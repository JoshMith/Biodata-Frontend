import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule, NgIf } from '@angular/common';
import { ProgressBarComponent } from '../../shared/progress-bar';
import { ParishAutocompleteComponent } from '../../shared/parish-autocomplete/parish-autocomplete.component';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-baptism',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ProgressBarComponent, ParishAutocompleteComponent, RouterLink],
  templateUrl: './baptism.component.html',
  styleUrl: './baptism.component.css'
})
export class BaptismUpdateComponent implements OnInit {
  private router = inject(Router);
  private baptismService = inject(ApiService);
  private fb = inject(FormBuilder);
  public nav = inject(NavigationService);

  baptismForm = this.fb.group({
    parish: ['', Validators.required],
    baptism_date: ['', Validators.required, this.noFutureDateValidator],
    baptism_number: ['', Validators.required],
    minister: ['', Validators.required],
    sponsor: ['', Validators.required],
    user_id: ['']
  });

  errorMessage = '';
  successMessage = '';
  existingBaptismId: string | null = null;
  noBaptism = false;
  currentStep = 1; // Track the current step for the progress bar
  today = new Date().toISOString().split('T')[0];

  ngOnInit(): void {
    console.log("Initializing baptism form");

    // Check authentication
    if (!localStorage.getItem('userLoggedIn')) {
      if (confirm('You are not logged in. Go to login page?')) {
        this.router.navigate(['/login']);
      }
      return;
    }

    // Load existing data
    this.loadExistingData();
  }

  private loadExistingData(): void {
    const christianId = this.getSelectedChristianId();
    if (!christianId) {
      this.errorMessage = 'No Christian selected';
      return;
    }

    this.baptismService.getBaptismByUserId(christianId).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          this.existingBaptismId = data[0].baptism_id;
          this.baptismForm.patchValue({
            parish: data[0].parish,
            baptism_date: this.formatDateForInput(data[0].baptism_date),
            baptism_number: data[0].baptism_number,
            minister: data[0].minister,
            sponsor: data[0].sponsor,
            user_id: christianId
          });
        } else {
          // Initialize with user_id if no existing data
          this.baptismForm.patchValue({ user_id: christianId });
          this.noBaptism = true;
        }
      },
      error: (error) => {
        console.error('Error loading baptism data:', error);
        this.errorMessage = `Failed to load existing data: ${error.error?.message}`;
      }
    });
  }

  // Add this helper method to your component
  private formatDateForInput(dateString: string): string | null {
    if (!dateString) return null;

    try {
      const date = new Date(dateString);
      // Convert to local date string in YYYY-MM-DD format
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return null;
    }
  }

  onSubmitBaptismForm(): void {
    if (this.baptismForm.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    const formData = this.baptismForm.value;
    const christianId = this.getSelectedChristianId();
    if (!christianId) {
      this.errorMessage = 'No Christian selected';
      return;
    }

    const request = this.existingBaptismId
      ? this.baptismService.updateBaptism(this.existingBaptismId, formData)
      : this.baptismService.createBaptism(formData);

    request.subscribe({
      next: (response) => {
        this.successMessage = 'Baptism saved successfully!';
        setTimeout(() => {
          this.navigateToEucharist();
        }, 2000);
      },
      error: (error) => {
        console.error('Error saving baptism:', error);
        this.errorMessage = error.error?.message || 'Failed to save baptism';
      }
    });
  }

  private getSelectedChristianId(): string | null {
    const selectedChristian = localStorage.getItem('selectedChristian');
    return selectedChristian ? JSON.parse(selectedChristian).id : null;
  }

  noFutureDateValidator(control: AbstractControl) {
    if (!control.value) return null;
    const selected = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected > today ? { futureDate: true } : null;
  }

  navigateToEucharist(): void {
    const christianId = this.getSelectedChristianId();
    if (christianId) {
      this.router.navigate(['/edit-eucharist'], {
        queryParams: { id: christianId }
      });
    }
  }

  navigateToPersonalInfo(): void {
    const christianId = this.getSelectedChristianId();
    if (christianId) {
      this.router.navigate(['/edit-personal-info'], {
        queryParams: { id: christianId }
      });
    }
  }

  hasFieldError(field: string): boolean {
    const c = this.baptismForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  getFieldError(field: string): string {
    return this.baptismForm.get(field)?.errors?.['required'] ? 'This field is required' : '';
  }
}