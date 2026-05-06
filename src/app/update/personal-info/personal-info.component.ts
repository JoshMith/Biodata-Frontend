import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from '../../shared/progress-bar';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ProgressBarComponent],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoUpdateComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  christianForm = this.fb.group({
    role: [''],
    phone_number: [''],
    first_name: [''],
    last_name: [''],
    middle_name: [''],
    deanery: [''],
    parish_id: [''],
    father: [''],
    mother: [''],
    tribe: [''],
    clan: [''],
    birth_place: [''],
    birth_date: [''],
    subcounty: [''],
    residence: [''],
  });

  currentStep = 0;
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;
  userId: string | null = null;
  parishes: any[] = [];
  deaneries: any[] = [];
  noRecord = false;

  ngOnInit(): void {
    this.checkAuthentication();
    this.loadInitialData();
    this.loadDeaneries();
    this.setupParishListener();
  }

  private checkAuthentication(): void {
    if (!localStorage.getItem('userLoggedIn')) {
      if (confirm('You are not logged in. Go to login page?')) {
        this.router.navigate(['/login']);
      }
    }
  }

  private loadInitialData(): void {
    const christianId = this.getSelectedChristianId();
    if (!christianId) return;

    this.userId = christianId;
    this.loadExistingData(christianId);
    this.checkSessionStorage();
  }

  private loadExistingData(id: string): void {
    this.apiService.getChristianById(id).subscribe({
      next: (data) => {
        // Format dates before patching the form
        const formattedData = {
          ...data,
          birth_date: this.formatDateForInput(data.birth_date)
        };

        this.christianForm.patchValue(formattedData);
        this.handleRolePermissions();
      },
      error: (error) => {
        console.error('Error loading Christian data:', error);
        this.errorMessage = `Failed to load existing data: ${error.error?.message}`;

      }
    });
  }

  // Helper method to format dates for HTML input
  private formatDateForInput(dateString: string): string | null {
    if (!dateString) return null;

    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Extracts YYYY-MM-DD
    } catch (e) {
      console.error('Error formatting date:', e);
      return null;
    }
  }

  private handleRolePermissions(): void {
    const userData = localStorage.getItem('userLoggedIn');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role !== 'superuser') {
        this.christianForm.get('role')?.disable();
      }
    }
  }

  private checkSessionStorage(): void {
    const storedFormData = sessionStorage.getItem('christianFormData');
    if (storedFormData) {
      this.christianForm.patchValue(JSON.parse(storedFormData));
    }
  }

  private loadDeaneries(): void {
    console.log('Loading deaneries...'); // Debug log

    this.apiService.getParishes().subscribe({
      next: (data) => {

        try {
          // Check if data exists and is an array
          if (!data) {
            throw new Error('No data received from server');
          }

          if (!Array.isArray(data)) {
            // If data is wrapped in an object, try to extract the array
            if (data && typeof data === 'object' && data.data && Array.isArray(data.data)) {
              data = data.data;
            } else if (data && typeof data === 'object' && data.parishes && Array.isArray(data.parishes)) {
              data = data.parishes;
            } else {
              throw new Error('Invalid data format received from server');
            }
          }

          // Extract unique deaneries with better validation
          const deanerySet = new Set<string>();

          data.forEach((item: any, index: number) => {
            if (!item || typeof item !== 'object') {
              console.warn(`Invalid parish data at index ${index}:`, item);
              return;
            }

            // Check if deanery field exists and is valid
            if (item.deanery && typeof item.deanery === 'string' && item.deanery.trim()) {
              deanerySet.add(item.deanery.trim());
            }
          });

          // Convert Set to Array and sort
          this.deaneries = Array.from(deanerySet).sort();

          console.log('Extracted deaneries:', this.deaneries); // Debug log

          if (this.deaneries.length === 0) {
            this.errorMessage = 'No deaneries found in the data';
            console.warn('No valid deaneries found in parish data');
          } else {
            // Clear any previous error messages
            this.errorMessage = '';
          }

        } catch (error: any) {
          console.error('Error processing deaneries:', error);
          this.errorMessage = `Failed to process deanery data: ${error.error?.message}`;
          this.deaneries = []; // Clear the list on error
        }
      },
      error: (error) => {
        console.error('API Error loading deaneries:', error);

        // More specific error handling
        if (error.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check your internet connection.';
        } else if (error.status === 404) {
          this.errorMessage = 'Parishes endpoint not found. Please contact support.';
        } else if (error.status === 500) {
          this.errorMessage = 'Server error occurred. Please try again later.';
        } else {
          this.errorMessage = error.error?.message || `Failed to load deaneries (Error ${error.status})`;
        }

        this.deaneries = []; // Clear the list on error
      }
    });
  }

  private setupParishListener(): void {
    this.christianForm.get('deanery')?.valueChanges.subscribe(deanery => {
      console.log('Deanery changed to:', deanery); // Debug log

      // Clear previous parishes first
      this.parishes = [];

      // Clear any previous error messages related to parish loading
      if (this.errorMessage && this.errorMessage.includes('Failed to load parishes')) {
        this.errorMessage = '';
      }

      // Validate deanery value
      if (!deanery || typeof deanery !== 'string' || !deanery.trim()) {
        console.log('No valid deanery selected, clearing parishes');
        return;
      }

      const trimmedDeanery = deanery.trim();
      console.log('Loading parishes for deanery:', trimmedDeanery);

      this.apiService.getParishByDeanery(trimmedDeanery).subscribe({
        next: (parishes) => {
          console.log('Loaded parishes for deanery:', parishes);

          // Validate the response
          if (!parishes) {
            console.warn('No parish data received');
            this.parishes = [];
            return;
          }

          // Handle different response formats
          let parishArray = parishes;
          if (!Array.isArray(parishes)) {
            if (parishes.data && Array.isArray(parishes.data)) {
              parishArray = parishes.data;
            } else if (parishes.parishes && Array.isArray(parishes.parishes)) {
              parishArray = parishes.parishes;
            } else {
              console.warn('Invalid parish data format:', parishes);
              this.parishes = [];
              return;
            }
          }

          this.parishes = parishArray;

          if (this.parishes.length === 0) {
            console.warn('No parishes found for deanery:', trimmedDeanery);
            // Optionally show a user-friendly message
            // this.errorMessage = `No parishes found for ${trimmedDeanery}`;
          } else {
            console.log(`Found ${this.parishes.length} parishes for ${trimmedDeanery}`);
          }
        },
        error: (error) => {
          console.error('Error loading parishes for deanery:', trimmedDeanery, error);

          // More specific error handling
          if (error.status === 404) {
            this.errorMessage = `No parishes found for deanery: ${trimmedDeanery}`;
          } else if (error.status === 0) {
            this.errorMessage = 'Cannot connect to server. Please check your internet connection.';
          } else {
            this.errorMessage = `Failed to load parishes for ${trimmedDeanery}`;
          }

          this.parishes = [];
        }
      });
    });
  }

  onSubmitChristianForm(): void {
    if (this.christianForm.invalid) {
      this.markFormAsTouched();
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    if (!this.userId) {
      this.errorMessage = 'No Christian selected';
      return;
    }

    this.isSubmitting = true;
    sessionStorage.setItem('christianFormData', JSON.stringify(this.christianForm.value));

    this.apiService.updateChristian(this.userId, this.christianForm.value).subscribe({
      next: (response) => {
        this.handleSuccess(response);
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  private handleSuccess(response: any): void {
    this.isSubmitting = false;
    this.successMessage = 'Personal information saved successfully!';
    sessionStorage.removeItem('christianFormData');
    setTimeout(() => {
      this.navigateToBaptism();
    }, 2000);
  }

  private handleError(error: any): void {
    this.isSubmitting = false;
    this.errorMessage = error.error?.message || 'An error occurred';
    console.error('Error updating Christian:', error);
  }

  private markFormAsTouched(): void {
    Object.values(this.christianForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.christianForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.christianForm.get(fieldName);
    return field?.errors?.['required'] && field.touched
      ? `${this.getFieldLabel(fieldName)} is required`
      : '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      'first_name': 'First Name',
      'last_name': 'Last Name',
      'middle_name': 'Middle Name',
      'phone_number': 'Phone Number',
      'birth_date': 'Birth Date',
      'birth_place': 'Birth Place',
      'subcounty': 'Sub County',
      'parish_id': 'Parish',
      'role': 'Role'
    };
    return labels[fieldName] || fieldName;
  }

  private getSelectedChristianId(): string | null {
    const selectedChristian = localStorage.getItem('selectedChristian');
    return selectedChristian ? JSON.parse(selectedChristian).id : null;
  }

  navigateToBaptism(): void {
    const christianId = this.getSelectedChristianId();
    if (christianId) {
      this.router.navigate(['/edit-baptism'], {
        queryParams: { id: christianId }
      });
    }
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}