import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-confirmation',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})
export class ConfirmationUpdateComponent implements OnInit {
  constructor(
    private router: Router, // Inject Router for navigation
    private confirmationService: ApiService // Inject ApiService for API calls
  ) { }

  private fb = inject(FormBuilder); // Inject FormBuilder for form creation
  confirmationForm = this.fb.group({ // Create a form group for the confirmation form
    confirmation_place: [''],
    confirmation_date: [''],
    minister: [''],
    confirmation_no: [''],
    user_id: ['']
  });

  errorMessage = '';
  successMessage = '';
  userId: any; // Variable to store the user ID

  ngOnInit(): void { // Lifecycle hook that is called after the component has been initialized
    console.log("Fill in the confirmation form");

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
      this.confirmationForm.patchValue(formData);
    }
  }

  onSubmitConfirmationForm(): void {
    if (this.confirmationForm.untouched) {
      this.errorMessage = 'Please fill in all required fields.';
      console.log('Please fill in all required fields.');
      return;
    }
    if (this.confirmationForm.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const localStorageData = localStorage.getItem('selectedChristian'); // Get the user ID from local storage
    if (localStorageData) {
      const parsedData = JSON.parse(localStorageData);
      this.userId = parsedData?.id;

      this.confirmationForm.patchValue({ user_id: this.userId }); // Assign userId from local storage to the form data

      // Check if the record already exists
      this.confirmationService.getConfirmationByUserId(this.userId).subscribe(
        (existingRecord: any) => {
          if (existingRecord.length > 0) {
            // If record exists, update it
            console.log("This is the fetched existing record: ", existingRecord);
            const confirmationId = existingRecord[0].confirmation_id;
            this.confirmationService.updateConfirmation(confirmationId, this.confirmationForm.value).subscribe(
              (response) => {
                console.log('Confirmation information updated successfully:', response); // Log the successful update response
                this.successMessage = 'Confirmation Information updated successfully!'; // Set success message
                this.navigateToMarriage(); // Navigate to the next page after a delay
              },
              (error: any) => {
                console.error('Error updating confirmation information:', error); // Log any error
                this.errorMessage = 'Failed to update confirmation information. Please try again.';
              }
            );
          } else {
            // If record does not exist, create a new one
            this.confirmationService.createConfirmation(this.confirmationForm.value).subscribe(
              (response) => {
                console.log('Confirmation information added successfully:', response); // Log the successful creation response
                this.successMessage = 'Confirmation Information added successfully!'; // Set success message
                this.navigateToMarriage(); // Navigate to the next page after a delay
              },
              (error) => {
                console.error('Error adding confirmation information:', error); // Log any error
                this.errorMessage = 'Failed to add confirmation information. Fill in all the fields to continue...';
              }
            );
          }
        },
        (error: any) => {
          console.error('Error checking existing confirmation record:', error); // Log any error
          this.errorMessage = 'Failed to check existing confirmation record. Please try again.';
        }
      );
    }
  }

  navigateToMarriage() {
    setTimeout(() => {
      this.router.navigate(['/edit-marriage']); // Navigate to the marriage page
    }, 1500); // Delay of 5 seconds before navigation
  }

  navigateToEucharist() {
    setTimeout(() => {
      this.router.navigate(['/edit-eucharist']); // Navigate to the eucharist page
    }, 1000); // Delay of 1 second before navigation
  }
}
