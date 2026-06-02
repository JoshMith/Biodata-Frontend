import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from '../../shared/progress-bar';
import { ParishAutocompleteComponent } from '../../shared/parish-autocomplete/parish-autocomplete.component';

@Component({
  selector: 'app-eucharist',
  imports: [CommonModule, ReactiveFormsModule, ProgressBarComponent, ParishAutocompleteComponent],
  templateUrl: './eucharist.component.html',
  styleUrl: './eucharist.component.css'
})
export class EucharistComponent {
  constructor(
    private router: Router,
    private eucharistService: ApiService // Inject ApiService for API calls
  ) { }

  private fb = inject(FormBuilder) // Inject FormBuilder for form creation
  eucharistForm = this.fb.group({ // Create a form group for the eucharist form
    eucharist_place: ['', Validators.required],
    eucharist_date: ['', Validators.required, this.noFutureDateValidator],
    user_id: [''],
  });

  errorMessage = '';
  successMessage = '';
  currentStep = 2; // Set the current step for the progress bar
  today = new Date().toISOString().split('T')[0];

  ngOnInit(): void { // Lifecycle hook that is called after the component has been initialized
    // this.onSubmitEucharistForm();
    console.log("Fill in the eucharist form");

    // Check if form data exists in session storage
    const storedFormData = sessionStorage.getItem('eucharistFormData');
    if (storedFormData) {
      const formData = JSON.parse(storedFormData);
      this.eucharistForm.patchValue(formData);
    }

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
  }

  onSubmitEucharistForm(): void {
    if (this.eucharistForm.untouched) { // Check if the form is untouched
      this.errorMessage = 'Please fill in all required fields.'; // Set error message
      console.log('Please fill in all required fields.');
      return; // Exit the function if the form is untouched
    }
    if (this.eucharistForm.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }
    const localStorageData = localStorage.getItem('addedUser'); // Get the user ID from local storage
    if (localStorageData) {
      const parsedData = JSON.parse(localStorageData);
      // const userId = parsedData?.id;
      this.eucharistForm.value['user_id'] = parsedData?.id;
      this.eucharistService.createEucharist(this.eucharistForm.value).subscribe(
        (response) => {
          console.log('Eucharist information added successfully:', response); // Log the successful registration response
          console.log(this.eucharistForm); // Log the form data
          this.successMessage = 'Eucharist Information Added successfully! Redirecting to next page...'; // Set success message
          this.navigateToConfirmation(); // Navigate to the login page after a delay
          // Clear session storage since we've successfully saved
          sessionStorage.removeItem('userFormData');
        },
        (error) => {
          console.error('Error adding eucharist information:', error); // Log any error
          this.errorMessage = error.error?.message || 'Failed to add eucharist information. Fill in all the fields to continue...';
        });
    }
  }


  // Helper method to check if a field has errors and is touched
  hasFieldError(fieldName: string): boolean {
    const field = this.eucharistForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Helper method to get field error message
  getFieldError(fieldName: string): string {
    const field = this.eucharistForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required.`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'eucharist_place': 'Eucharist Place',
      'eucharist_date': 'Eucharist Date',
    };
    return labels[fieldName] || fieldName;
  }

  noFutureDateValidator(control: AbstractControl) {
    if (!control.value) return null;
    const selected = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected > today ? { futureDate: true } : null;
  }

  navigateToConfirmation() {
    // Save form data before navigating away
    if (this.eucharistForm.dirty) {
      sessionStorage.setItem('eucharistFormData', JSON.stringify(this.eucharistForm.value));
    }
    this.router.navigate(['/confirmation']); // Navigate to the confirmation page
  }

  navigateToBaptism() {
    // Save form data before navigating away
    if (this.eucharistForm.dirty) {
      sessionStorage.setItem('eucharistFormData', JSON.stringify(this.eucharistForm.value));
    }
    this.router.navigate(['/baptism']); // Navigate to the personal info page
  }


}
