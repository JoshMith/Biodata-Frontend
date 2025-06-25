import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-personal-info',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true,
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.css'
})
export class PersonalInfoComponent implements OnInit, AfterViewInit {
  // Form group
  userForm: FormGroup;

  // Feedback messages
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;

  // User data
  userId: string | null = null;

  // Parish data
  parishes: any[] = [];

  private fb = inject(FormBuilder);

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {
    // Initialize form with validation - updated to match new schema
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      roles: ['member', Validators.required], // Default to 'member'
      phone_number: [''],
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      middle_name: [''],
      mother: [''],
      father: [''],
      siblings: [''],
      birth_place: [''],
      subcounty: [''],
      birth_date: ['', Validators.required],
      tribe: [''],
      clan: [''],
      residence: [''],
      parish_id: ['', Validators.required]
    });
  }

  ngOnInit(): void {
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

    // Load parishes
    this.loadParishes();

    // Check if form data exists in session storage
    const storedFormData = sessionStorage.getItem('userFormData');
    if (storedFormData) {
      const formData = JSON.parse(storedFormData);
      this.userForm.patchValue(formData);
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

  /**
   * Submit the form
   */
  onSubmitUserForm(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = 'Submitting your information...';

    // Mark all fields as touched to trigger validation messages
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      control?.markAsTouched();
    });


    // Save form data to session storage in case of navigation issues
    sessionStorage.setItem('userFormData', JSON.stringify(this.userForm.value));

    // Submit to API - changed from addChristian to addUser
    this.apiService.addChristian(this.userForm.value).subscribe({
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
      localStorage.setItem('addedUser', JSON.stringify({
        id: response.user.id,
        email: response.user.email,
        roles: response.user.roles,
        first_name: response.user.first_name,
        last_name: response.user.last_name
      }));

      this.successMessage = 'Personal information saved successfully! Redirecting...';
      this.isSubmitting = false;

      // Clear session storage since we've successfully saved
      sessionStorage.removeItem('userFormData');

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
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Helper method to get field error message
  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
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
      'roles': 'Roles'
    };
    return labels[fieldName] || fieldName;
  }

  navigateToBaptism(): void {
    setTimeout(() => {
      this.router.navigate(['/baptism']);
    }, 1500);
  }

  navigateToDashboard(): void {
    // Save form data before navigating away
    if (this.userForm.dirty) {
      sessionStorage.setItem('userFormData', JSON.stringify(this.userForm.value));
    }

    this.router.navigate(['/dashboard']);
  }
}