import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from '../../form/progress-bar';

@Component({
  selector: 'app-eucharist',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ProgressBarComponent],
  templateUrl: './eucharist.component.html',
  styleUrl: './eucharist.component.css'
})
export class EucharistUpdateComponent implements OnInit {
  private router = inject(Router);
  private eucharistService = inject(ApiService);
  private fb = inject(FormBuilder);

  eucharistForm = this.fb.group({
    eucharist_place: ['', Validators.required],
    eucharist_date: ['', Validators.required],
    user_id: ['']
  });

  errorMessage = '';
  successMessage = '';
  existingEucharistId: string | null = null;
  noEucharist = false;
  currentStep = 2; // Track the current step for the progress bar

  ngOnInit(): void {
    console.log("Initializing eucharist form");

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

  this.eucharistService.getEucharistByUserId(christianId).subscribe({
    next: (data: any) => {
      if (data && data.length > 0) {
        this.existingEucharistId = data[0].eucharist_id;
        this.eucharistForm.patchValue({
          eucharist_place: data[0].eucharist_place,
          eucharist_date: this.formatDateForInput(data[0].eucharist_date),
          user_id: christianId
        });
      } else {
        // Initialize with user_id if no existing data
        this.eucharistForm.patchValue({ user_id: christianId });
        this.noEucharist = true;
      }
    },
    error: (error) => {
      console.error('Error loading eucharist data:', error);
      this.errorMessage = `Failed to load existing data: ${error.error?.message}`;
    }
  });
}

// Add this helper method to your component
private formatDateForInput(dateString: string): string | null {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date string:', dateString);
      return null;
    }
    
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

  onSubmitEucharistForm(): void {
    if (this.eucharistForm.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    const formData = this.eucharistForm.value;
    const christianId = this.getSelectedChristianId();
    if (!christianId) {
      this.errorMessage = 'No Christian selected';
      return;
    }

    const request = this.existingEucharistId
      ? this.eucharistService.updateEucharist(this.existingEucharistId, formData)
      : this.eucharistService.createEucharist(formData);

    request.subscribe({
      next: (response) => {
        this.successMessage = 'Eucharist saved successfully!';
        setTimeout(() => {
          this.navigateToConfirmation();
        }, 2000);
      },
      error: (error) => {
        console.error('Error saving eucharist:', error);
        this.errorMessage = error.error?.message || 'Failed to save eucharist';
      }
    });
  }

  private getSelectedChristianId(): string | null {
    const selectedChristian = localStorage.getItem('selectedChristian');
    return selectedChristian ? JSON.parse(selectedChristian).id : null;
  }

  navigateToConfirmation(): void {
    const christianId = this.getSelectedChristianId();
    if (christianId) {
      this.router.navigate(['/edit-confirmation'], { 
        queryParams: { id: christianId } 
      });
    }
  }

  navigateToBaptism(): void {
    const christianId = this.getSelectedChristianId();
    if (christianId) {
      this.router.navigate(['/edit-baptism'], { 
        queryParams: { id: christianId } 
      });
    }
  }
}