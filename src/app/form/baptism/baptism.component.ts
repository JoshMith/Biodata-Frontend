import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-baptism',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './baptism.component.html',
  styleUrl: './baptism.component.css'
})
export class BaptismComponent {
  constructor(
    private router: Router,
    private baptismService: ApiService
  ) {}

  private fb = inject(FormBuilder);
  
  // Updated form to match database structure
  baptismForm = this.fb.group({
    parish: ['', Validators.required], // Changed from baptism_place
    baptism_date: ['', Validators.required],
    minister: ['', Validators.required], // Changed from baptised_by
    sponsor: ['', Validators.required], // Changed from administrator
    user_id: [''] // This will be set programmatically
  });

  errorMessage = '';
  successMessage = '';
  userId: any;

  ngOnInit(): void {
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

    // Get user ID from localStorage
    const localStorageData = localStorage.getItem('addedUser');
    if (localStorageData) {
      const parsedData = JSON.parse(localStorageData);
      this.userId = parsedData?.id;
    }

    // Check if form data exists in session storage
    const storedFormData = sessionStorage.getItem('baptismFormData');
    if (storedFormData) {
      const formData = JSON.parse(storedFormData);
      this.baptismForm.patchValue(formData);
    }
  }

  onSubmitBaptismForm(): void {
    // Clear previous messages
    this.errorMessage = '';
    this.successMessage = '';

    if (this.baptismForm.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      // Mark all fields as touched to show validation errors
      Object.keys(this.baptismForm.controls).forEach(key => {
        this.baptismForm.get(key)?.markAsTouched();
      });
      return;
    }

    if (!this.userId) {
      this.errorMessage = 'User ID not found. Add a Christian first.';
      return;
    }

    // Set user_id in form data
    const formData = { ...this.baptismForm.value };
    formData.user_id = this.userId;

    // Save form data to session storage before submitting
    sessionStorage.setItem('baptismFormData', JSON.stringify(this.baptismForm.value));

    this.baptismService.createBaptism(formData).subscribe({
      next: (response) => {
        console.log('Baptism information added successfully:', response);
        this.successMessage = 'Baptism Information Added successfully! Redirecting to next page...';
        // Clear the stored form data on success
        sessionStorage.removeItem('baptismFormData');
        this.navigateToEucharist();
      },
      error: (error) => {
        console.error('Error creating baptism record:', error);
        if (error.status === 400 && error.error?.message?.includes('already exists')) {
          this.errorMessage = 'Baptism record for this user already exists.';
        } else {
          this.errorMessage = 'Failed to save baptism information. Please try again.';
        }
      }
    });
  }

  // Helper method to check if a field has errors and is touched
  hasFieldError(fieldName: string): boolean {
    const field = this.baptismForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Helper method to get field error message
  getFieldError(fieldName: string): string {
    const field = this.baptismForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required.`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'parish': 'Parish',
      'baptism_date': 'Baptism Date',
      'minister': 'Minister',
      'sponsor': 'Sponsor'
    };
    return labels[fieldName] || fieldName;
  }

  navigateToEucharist() {
    setTimeout(() => {
      this.router.navigate(['/eucharist']);
    }, 1500);
  }

  navigateToPersonalInfo() {
    setTimeout(() => {
      this.router.navigate(['/personal-info']);
    }, 1000);
  }
}