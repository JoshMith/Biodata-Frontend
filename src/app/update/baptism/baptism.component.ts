import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-baptism',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './baptism.component.html',
  styleUrl: './baptism.component.css'
})
export class BaptismUpdateComponent implements OnInit {
  constructor(
    private router: Router, // Inject Router for navigation
    private baptismService: ApiService // Inject ApiService for API calls
  ) { }

  private fb = inject(FormBuilder) // Inject FormBuilder for form creation
  baptismForm = this.fb.group({ // Create a form group for the baptism form
    parish: [''],
    baptism_date: [''],
    minister: [''],
    sponsor: [''],
    user_id: [''],
  })


  errorMessage = '';
  successMessage = '';
  userId: any // Variable to store the user ID
  ngOnInit(): void { // Lifecycle hook that is called after the component has been initialized
    // this.onSubmitBaptismForm();
    console.log("Fill in the baptism form");

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
      this.baptismForm.patchValue(formData);
    }
  }

  onSubmitBaptismForm(): void {
    if (this.baptismForm.untouched) {
      this.errorMessage = 'Please fill in all required fields.';
      console.log('Please fill in all required fields.');
      return;
    }
    if (this.baptismForm.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }
    const localStorageData = localStorage.getItem('selectedChristian'); // Get the user ID from local storage
    if (localStorageData) {
      const parsedData = JSON.parse(localStorageData);
      this.userId = parsedData?.id;

      this.baptismForm.patchValue({ user_id: this.userId });  // Assign userId from local storage to the form data

      // Check if the record already exists
      this.baptismService.getBaptismByUserId(this.userId).subscribe(
        (existingRecord: any) => {
          if (existingRecord.length > 0) {
            // If record exists, update it
            console.log("This is the fetched existing record: ",existingRecord);
            const baptismId = existingRecord[0].baptism_id;
            this.baptismService.updateBaptism(baptismId, this.baptismForm.value).subscribe(


              (response) => {
                console.log('Baptism information updated successfully:', response); // Log the successful update response
                this.successMessage = 'Baptism Information updated successfully!'; // Set success message
                this.navigateToEucharist(); // Navigate to the next page after a delay
              },
              (error: any) => {
                console.error('Error updating baptism information:', error); // Log any error
                this.errorMessage = 'Failed to update baptism information. Please try again.';
              }
            );
          } else {
            // If record does not exist, create a new one
            this.baptismService.createBaptism(this.baptismForm.value).subscribe(
              (response) => {
                console.log('Baptism information added successfully:', response); // Log the successful creation response
                this.successMessage = 'Baptism Information added successfully!'; // Set success message
                this.navigateToEucharist(); // Navigate to the next page after a delay
              },
              (error) => {
                console.error('Error adding baptism information:', error); // Log any error
                this.errorMessage = 'Failed to add baptism information. Fill in all the fields to continue...';
              }
            );
          }
        },
        (error: any) => {
          console.error('Error checking existing baptism record:', error); // Log any error
          this.errorMessage = 'Failed to check existing baptism record. Please try again.';
        }
      );
    }
  }

  navigateToEucharist() {
    setTimeout(() => {
      this.router.navigate(['/edit-eucharist']); // Navigate to the eucharist page
    }, 1500); // Delay of 5 seconds before navigation
  }

  navigateToPersonalInfo() {
    setTimeout(() => {
      this.router.navigate(['/edit-personal-info']); // Navigate to the personal info page
    }, 1000); // Delay of 2 seconds before navigation
  }

}
