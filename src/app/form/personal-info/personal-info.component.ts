import { Component, inject, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from '../../shared/progress-bar';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-personal-info',
  imports: [ReactiveFormsModule, CommonModule, ProgressBarComponent],
  standalone: true,
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.css'
})
export class PersonalInfoComponent implements OnInit, AfterViewInit, OnDestroy {
  currentStep = 0;
  userForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;
  userId: string | null = null;
  parishes: any[] = [];
  deaneries: any[] = [];
  showPassword = false;
  today = new Date().toISOString().split('T')[0];

  // Role-awareness
  loggedInUser: any = null;
  loggedInRole = '';
  isEditor = false;
  isSuperuser = false;
  editorParishName = '';

  private fb = inject(FormBuilder);

  constructor(
    private apiService: ApiService,
    private router: Router,
    public nav: NavigationService
  ) {
    this.userForm = this.fb.group({
      email: ['', [Validators.email]],
      password: ['', [Validators.minLength(8)]],
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      middle_name: [''],
      deanery: ['', Validators.required],
      parish_id: ['', Validators.required],
      phone_number: [''],
      mother: [''],
      father: [''],
      birth_place: [''],
      subcounty: [''],
      birth_date: ['', this.noFutureDateValidator],
      tribe: [''],
      clan: [''],
      domicile: ['']
    });
  }

  ngOnInit(): void {
    const raw = localStorage.getItem('userLoggedIn');
    if (!raw) {
      setTimeout(() => {
        if (confirm('You are not logged in. Do you want to go to the login page?')) {
          this.router.navigate(['/login']);
        }
      }, 3000);
      return;
    }

    this.loggedInUser = JSON.parse(raw);
    this.loggedInRole = this.loggedInUser?.role ?? '';
    this.isEditor = this.loggedInRole === 'editor';
    this.isSuperuser = this.loggedInRole === 'superuser';

    if (this.isEditor) {
      this.lockEditorParish();
    } else {
      this.loadDeaneries();
      this.loadParishesByDeanery();
    }

    const storedFormData = sessionStorage.getItem('userFormData');
    if (storedFormData) {
      const formData = JSON.parse(storedFormData);
      if (this.isEditor) {
        const { parish_id, deanery, ...rest } = formData;
        this.userForm.patchValue(rest);
      } else {
        this.userForm.patchValue(formData);
      }
    }
  }

  ngAfterViewInit(): void {
    const userData = localStorage.getItem('userLoggedIn');
    if (userData) {
      const user = JSON.parse(userData);
      if (user.role !== 'superuser') {
        this.userForm.get('role')?.disable();
        this.userForm.get('role')?.setValue('member');
        this.userForm.get('role')?.markAsTouched();
      }
    }
  }

  ngOnDestroy(): void {}


  private lockEditorParish(): void {
    const parishId = this.loggedInUser?.parishId ?? this.loggedInUser?.parish_id ?? '';
    if (!parishId) {
      this.errorMessage = 'Your parish could not be determined. Please contact an administrator.';
      return;
    }

    this.userForm.get('parish_id')?.setValue(parishId);
    this.userForm.get('parish_id')?.disable();

    this.apiService.getParishById(parishId).subscribe({
      next: (parish) => {
        this.editorParishName = parish.parish_name;
        this.userForm.get('deanery')?.setValue(parish.deanery);
        this.userForm.get('deanery')?.disable();
      },
      error: () => {
        this.errorMessage = 'Failed to load your parish details.';
      }
    });
  }


  private loadDeaneries(): void {
    this.apiService.getParishes().subscribe({
      next: (data) => {
        const seen = new Set<string>();
        this.deaneries = data.filter((item: any) => {
          if (seen.has(item.deanery)) return false;
          seen.add(item.deanery);
          return true;
        });
      },
      error: () => {
        this.errorMessage = 'Failed to load deaneries. Please refresh the page.';
      }
    });
  }

  private loadParishesByDeanery(): void {
    this.userForm.get('deanery')?.valueChanges.subscribe(deanery => {
      if (deanery) {
        this.apiService.getParishByDeanery(deanery).subscribe({
          next: (parishes) => { this.parishes = parishes; },
          error: () => {
            this.errorMessage = 'Failed to load parishes for the selected deanery.';
          }
        });
      } else {
        this.parishes = [];
      }
    });
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  onSubmitUserForm(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = 'Submitting your information...';

    const payload = this.userForm.getRawValue();
    sessionStorage.setItem('userFormData', JSON.stringify(payload));

    this.apiService.addChristian(payload).subscribe({
      next: (response) => { this.handleSuccessfulSubmission(response); },
      error: (error) => {
        this.isSubmitting = false;
        this.successMessage = '';
        this.errorMessage = error.error?.message || 'An error occurred. Please try again.';
      }
    });
  }

  private handleSuccessfulSubmission(response: any): void {
    if (response && response.user) {
      this.userId = response.user.id;
      localStorage.setItem('addedUser', JSON.stringify({
        id: response.user.id,
        email: response.user.email,
        role: response.user.role,
        first_name: response.user.first_name,
        last_name: response.user.last_name
      }));
      this.successMessage = 'Personal information saved successfully! Redirecting...';
      this.isSubmitting = false;
      sessionStorage.removeItem('userFormData');
      this.navigateToBaptism();
    } else {
      this.isSubmitting = false;
      this.errorMessage = 'Unexpected response format from server.';
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.userForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
    if (field?.errors?.['required'] && field.touched) {
      return `${this.getFieldLabel(fieldName)} is required.`;
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'first_name': 'First Name', 'last_name': 'Last Name', 'middle_name': 'Middle Name',
      'email': 'Email', 'password': 'Password', 'phone_number': 'Phone Number',
      'birth_date': 'Birth Date', 'birth_place': 'Birth Place',
      'subcounty': 'Sub County', 'parish_id': 'Parish',
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

  navigateToBaptism(): void {
    if (this.userForm.dirty) {
      sessionStorage.setItem('userFormData', JSON.stringify(this.userForm.getRawValue()));
    }
    setTimeout(() => { this.router.navigate(['/baptism']); }, 1500);
  }

  navigateToDashboard(): void {
    if (this.userForm.dirty) {
      sessionStorage.setItem('userFormData', JSON.stringify(this.userForm.getRawValue()));
    }
    this.nav.goToDashboard();
  }
}