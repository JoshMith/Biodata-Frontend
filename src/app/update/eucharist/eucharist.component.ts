import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-eucharist',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './eucharist.component.html',
  styleUrl: './eucharist.component.css'
})
export class EucharistUpdateComponent implements OnInit {
  constructor(
    private router: Router, // Inject Router for navigation
    private eucharistService: ApiService // Inject ApiService for API calls
  ) { }

  private fb = inject(FormBuilder) // Inject FormBuilder for form creation
  eucharistForm = this.fb.group({ // Create a form group for the eucharist form
    eucharist_place: [''],
    eucharist_date: [''],
    user_id: [''],
  });

  errorMessage = '';
  successMessage = '';
  userId: any; // Variable to store the user ID

  ngOnInit(): void { // Lifecycle hook that is called after the component has been initialized
    console.log("Fill in the eucharist form");

    // Check if user is logged in
    const user = localStorage.getItem('userLoggedIn');
    if (!user) {
      setTimeout(() => {
        if (confirm('You are not logged in. Do you want to go to the login page?')) {
          this.router.navigate(['/login']);
        }
      }, 3000);
      return;
    }

    // Check if form data exists in session storage
    const storedFormData = sessionStorage.getItem('christianFormData');
    if (storedFormData) {
      const formData = JSON.parse(storedFormData);
      this.eucharistForm.patchValue(formData);
    }
  }

  onSubmitEucharistForm(): void {
    if (this.eucharistForm.untouched) {
      this.errorMessage = 'Please fill in all required fields.';
      console.log('Please fill in all required fields.');
      return;
    }
    if (this.eucharistForm.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const localStorageData = localStorage.getItem('selectedChristian'); // Get the user ID from local storage
    if (localStorageData) {
      const parsedData = JSON.parse(localStorageData);
      this.userId = parsedData?.id;

      this.eucharistForm.patchValue({ user_id: this.userId }); // Assign userId from local storage to the form data

      // Check if the record already exists
      this.eucharistService.getEucharistByUserId(this.userId).subscribe(
        (existingRecord: any) => {
          if (existingRecord.length > 0) {
            // If record exists, update it
            console.log("This is the fetched existing record: ", existingRecord);
            const eucharistId = existingRecord[0].eucharist_id;
            this.eucharistService.updateEucharist(eucharistId, this.eucharistForm.value).subscribe(
              (response) => {
                console.log('Eucharist information updated successfully:', response); // Log the successful update response
                this.successMessage = 'Eucharist Information updated successfully!'; // Set success message
                this.navigateToConfirmation(); // Navigate to the next page after a delay
              },
              (error: any) => {
                console.error('Error updating eucharist information:', error); // Log any error
                this.errorMessage = 'Failed to update eucharist information. Please try again.';
              }
            );
          } else {
            // If record does not exist, create a new one
            this.eucharistService.createEucharist(this.eucharistForm.value).subscribe(
              (response) => {
                console.log('Eucharist information added successfully:', response); // Log the successful creation response
                this.successMessage = 'Eucharist Information added successfully!'; // Set success message
                this.navigateToConfirmation(); // Navigate to the next page after a delay
              },
              (error) => {
                console.error('Error adding eucharist information:', error); // Log any error
                this.errorMessage = 'Failed to add eucharist information. Fill in all the fields to continue...';
              }
            );
          }
        },
        (error: any) => {
          console.error('Error checking existing eucharist record:', error); // Log any error
          this.errorMessage = 'Failed to check existing eucharist record. Please try again.';
        }
      );
    }
  }

  navigateToConfirmation() {
    setTimeout(() => {
      this.router.navigate(['/edit-confirmation']); // Navigate to the confirmation page
    }, 1500); // Delay of 5 seconds before navigation
  }

  navigateToBaptism() {
    setTimeout(() => {
      this.router.navigate(['/edit-baptism']); // Navigate to the baptism page
    }, 1000); // Delay of 2 seconds before navigation
  }
}
