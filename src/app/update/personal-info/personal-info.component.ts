import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-personal-info',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true, // Indicates that this component is a standalone component
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.css'
})
export class PersonalInfoUpdateComponent implements OnInit {

  constructor(
    private apiService: ApiService, // Inject the ApiService for API calls
    private router: Router, // Inject the Router for navigation
  ) { } // Constructor for the component

  private fb = inject(FormBuilder) // Inject FormBuilder for form creation

  christianForm = this.fb.group({ // Create a form group for the personal information form
    email: [''],
    password: [''],
    roles: [''],
    phone_number: [''],
    first_name: [''],
    last_name: [''],
    middle_name: [''],
    parish_id: [''], // This will be set based on the selected parish
    father: [''],
    mother: [''],
    siblings: [''],
    tribe: [''],
    clan: [''],
    birth_place: [''],
    birth_date: [''],
    sub_county: [''],
    residence: [''],
  })


  errorMessage = '';
  successMessage = '';
  isSubmitting = false; // Flag to indicate if the form is being submitted
  userId: any // Variable to store the user ID
  localStorageData: string | null = null; // Variable to store local storage data

  parishes: any[] = []; // Array to hold the list of parishes




  ngOnInit(): void { // Lifecycle hook that is called after the component has been initialized

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



    // Check if user is logged in
    this.localStorageData = localStorage.getItem('selectedChristian'); // Get the user ID from local storage
    if (this.localStorageData) {
      const parsedData = JSON.parse(this.localStorageData);
      this.userId = parsedData?.id;


      // Populate the form fields with the data from localStorage
      this.christianForm.patchValue({
        email: parsedData?.email,
        roles: parsedData?.roles,
        phone_number: parsedData?.phone_number,
        first_name: parsedData?.first_name,
        last_name: parsedData?.last_name,
        middle_name: parsedData?.middle_name,
      });
    }

    // Load parishes
    this.loadParishes();

    // Check if form data exists in session storage
    const storedFormData = sessionStorage.getItem('christianFormData');
    if (storedFormData) {
      const formData = JSON.parse(storedFormData);
      this.christianForm.patchValue(formData);
    }
  }

  ngAfterViewInit(): void {
    // Any additional setup can be done here
  }

  //Load parishes from API
  private loadParishes(): void {
    this.apiService.getParishes().subscribe({
      next: (parishes) => {
        this.parishes = parishes;
      },
      error: (error) => {
        console.error('Error loading parishes:', error);
        this.errorMessage = 'Failed to load parishes. Please refresh the page.';
      }
    });
  }



  onSubmitChristianForm(): void {
    if (this.christianForm.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      console.log('Please fill in all required fields.');
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = 'Submitting your information...';

    // Mark all fields as touched to trigger validation messages
    Object.keys(this.christianForm.controls).forEach(key => {
      const control = this.christianForm.get(key);
      control?.markAsTouched();
    });

    // Save form data to session storage in case of navigation issues
    sessionStorage.setItem('christianFormData', JSON.stringify(this.christianForm.value));

    // Submit to API - changed from addChristian to addUser
    this.apiService.updateChristian(this.userId, this.christianForm.value).subscribe({
      next: (response) => {
        this.handleSuccessfulSubmission(response);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.successMessage = '';
        this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
        console.error('Error adding user:', error);
      }
    });
  }

   // Handle successful form submission
  private handleSuccessfulSubmission(response: any): void {
    if (response && response.user) {
      this.userId = response.user.id;

      // Store user info in localStorage
      localStorage.setItem('selectedChristian', JSON.stringify({
        id: response.user.id,
        email: response.user.email,
        role: response.user.role,
        first_name: response.user.first_name,
        last_name: response.user.last_name
      }));

      this.successMessage = 'Personal information saved successfully! Redirecting...';
      this.isSubmitting = false;

      // Clear session storage since we've successfully saved
      sessionStorage.removeItem('christianFormData');

      // Navigate to next step
      this.navigateToBaptism();
    } else {
      this.isSubmitting = false;
      this.errorMessage = 'Unexpected response format from server.';
    }
  }

    // Utility to mark all controls in a form group as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Helper method to check if a field has errors and is touched
  hasFieldError(fieldName: string): boolean {
    const field = this.christianForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Helper method to get field error message
  getFieldError(fieldName: string): string {
    const field = this.christianForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required.`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'first_name': 'First Name',
      'last_name': 'Last Name',
      'middle_name': 'Middle Name',
      'email': 'Email',
      'password': 'Password',
      'phone_number': 'Phone Number',
      'birth_date': 'Birth Date',
      'birth_place': 'Birth Place',
      'subcounty': 'Sub County',
      'parish_id': 'Parish',
      'roles': 'Role'
    };
    return labels[fieldName] || fieldName;
  }

  navigateToBaptism() {
    setTimeout(() => {
      this.router.navigate(['/edit-baptism']); // Navigate to the baptism page
    }
      , 1500);
  } // End of navigateToBaptism method

  navigateToDashboard() {
    setTimeout(() => {
      this.router.navigate(['/dashboard']); // Navigate to the dashboard page
    }, 1000); // Delay of 2 seconds before navigation
  } // End of navigateToDashboard method

}
