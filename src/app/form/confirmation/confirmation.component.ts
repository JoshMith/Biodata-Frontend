import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})
export class ConfirmationComponent {
  constructor(
    private router: Router, // Inject Router for navigation
    private confirmationService: ApiService // Inject ApiService for API calls
  ) { } // Constructor for the component

  private fb = inject(FormBuilder) // Inject FormBuilder for form creation

  confirmationForm = this.fb.group({ // Create a form group for the confirmation form
    confirmation_place: ['', Validators.required],
    confirmation_date: ['', Validators.required],
    minister: ['', Validators.required],
    confirmation_no: ['', Validators.required],
    user_id: ['']
  })

  errorMessage = '';
  successMessage = '';

  ngOnInit(): void { // Lifecycle hook that is called after the component has been initialized
    // this.onSubmitConfirmationForm();
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
    if (this.confirmationForm.untouched) { // Check if the form is untouched
      this.errorMessage = 'Please fill in all required fields.'; // Set error message
      console.log('Please fill in all required fields.');
      return; // Exit the function if the form is untouched
    }

    if (this.confirmationForm.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    const localStorageData = localStorage.getItem('addedUser'); // Get the user ID from local storage
    if (localStorageData) {
      const parsedData = JSON.parse(localStorageData);
      const userId = parsedData?.id;

      this.confirmationForm.value['user_id'] = userId;

      this.confirmationService.createConfirmation(this.confirmationForm.value).subscribe(
        (response) => {
          console.log('Confirmation information added successfully:', response); // Log the successful registration response
          console.log(this.confirmationForm); // Log the form data
          this.successMessage = 'Confirmation Information Added successfully! Redirecting to next page...'; // Set success message
          this.navigateToMarriage(); // Navigate to the marriage page after a delay
        },
        (error) => {
          console.error('Error adding confirmation information:', error);
          this.errorMessage = 'Failed to add confirmation information. Please try again.';
        }
      )
    }
  }

  // Helper method to check if a field has errors and is touched
hasFieldError(fieldName: string): boolean {
  const field = this.confirmationForm.get(fieldName);
  return !!(field && field.invalid && field.touched);
}

// Helper method to get field error message
getFieldError(fieldName: string): string {
  const field = this.confirmationForm.get(fieldName);
  if (field && field.errors && field.touched) {
    if (field.errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required.`;
    }
  }
  return '';
}

private getFieldLabel(fieldName: string): string {
  const labels: { [key: string]: string } = {
    'confirmation_place': 'Confirmation Place',
    'confirmation_date': 'Confirmation Date',
    'minister': 'Minister',
    'confirmation_no': 'Confirmation Number'
  };
  return labels[fieldName] || fieldName;
}

  navigateToMarriage() {
    setTimeout(() => {
      this.router.navigate(['/marriage']); // Navigate to the marriage page
    }, 1500); // Delay of 1.5 seconds before navigation
  }

  navigateToEucharist() {
    setTimeout(() => {
      this.router.navigate(['/eucharist']); // Navigate to the eucharist page
    }, 1000); // Delay of 1 second before navigation
  }
}