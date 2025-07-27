import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-confirmation',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './confirmation.component.html',
  styleUrl: './confirmation.component.css'
})
export class ConfirmationUpdateComponent implements OnInit {
  private router = inject(Router);
  private confirmationService = inject(ApiService);
  private fb = inject(FormBuilder);

  confirmationForm = this.fb.group({
    confirmation_place: ['', Validators.required],
    confirmation_date: ['', Validators.required],
    minister: [''],
    confirmation_no: [''],
    user_id: ['']
  });

  errorMessage = '';
  successMessage = '';
  existingConfirmationId: string | null = null;
  noConfirmation = false;

  ngOnInit(): void {
    console.log("Initializing confirmation form");

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

  this.confirmationService.getConfirmationByUserId(christianId).subscribe({
    next: (data: any) => {
      if (data?.length > 0) {
        const confirmationData = data[0];
        this.existingConfirmationId = confirmationData.confirmation_id;
        
        this.confirmationForm.patchValue({
          confirmation_place: confirmationData.confirmation_place,
          confirmation_date: this.formatDateForInput(confirmationData.confirmation_date),
          minister: confirmationData.minister,
          confirmation_no: confirmationData.confirmation_no,
          user_id: christianId
        });
      } else {
        this.confirmationForm.patchValue({ user_id: christianId });
        this.noConfirmation = true;
      }
    },
    error: (error) => {
      console.error('Error loading confirmation data:', error);
      this.errorMessage = `Failed to load existing data: ${error.error?.message}`;
    }
  });
}

// Add this helper method to your component
private formatDateForInput(dateString: string): string | null {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null; // Check for invalid dates
    
    // Convert to local date and format as YYYY-MM-DD
    const offset = date.getTimezoneOffset() * 60000; // Handle timezone offset
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().split('T')[0];
  } catch (e) {
    console.error('Error formatting date:', e);
    return null;
  }
}
  onSubmitConfirmationForm(): void {
    if (this.confirmationForm.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    const formData = this.confirmationForm.value;
    const christianId = this.getSelectedChristianId();
    if (!christianId) {
      this.errorMessage = 'No Christian selected';
      return;
    }

    const request = this.existingConfirmationId
      ? this.confirmationService.updateConfirmation(this.existingConfirmationId, formData)
      : this.confirmationService.createConfirmation(formData);

    request.subscribe({
      next: (response) => {
        this.successMessage = 'Confirmation saved successfully!';
        setTimeout(() => {
          this.navigateToMarriage();
        }, 2000);
      },
      error: (error) => {
        console.error('Error saving confirmation:', error);
        this.errorMessage = error.error?.message || 'Failed to save confirmation';
      }
    });
  }

  private getSelectedChristianId(): string | null {
    const selectedChristian = localStorage.getItem('selectedChristian');
    return selectedChristian ? JSON.parse(selectedChristian).id : null;
  }

  navigateToMarriage(): void {
    const christianId = this.getSelectedChristianId();
    if (christianId) {
      this.router.navigate(['/edit-marriage'], { 
        queryParams: { id: christianId } 
      });
    }
  }

  navigateToEucharist(): void {
    const christianId = this.getSelectedChristianId();
    if (christianId) {
      this.router.navigate(['/edit-eucharist'], { 
        queryParams: { id: christianId } 
      });
    }
  }
}