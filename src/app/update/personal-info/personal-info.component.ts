import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AbstractControl, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from '../../shared/progress-bar';
import { NavigationService } from '../../services/navigation.service';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ProgressBarComponent, RouterLink],
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoUpdateComponent implements OnInit {
  private apiService = inject(ApiService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  public nav = inject(NavigationService);

  christianForm = this.fb.group({
    role: [''],
    email: [''],
    password: [''],
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
    birth_date: ['', this.noFutureDateValidator],
    subcounty: [''],
    domicile: [''],
  });

  currentStep = 0;
  errorMessage = '';
  successMessage = '';
  isSubmitting = false;
  userId: string | null = null;
  parishes: any[] = [];
  deaneries: any[] = [];
  noRecord = false;
  showPassword = false;
  today = new Date().toISOString().split('T')[0];

  // Role-awareness
  loggedInUser: any = null;
  loggedInRole = '';
  isEditor = false;
  isSuperuser = false;
  isMember = false;
  lockedParishName = '';

  ngOnInit(): void {
    const raw = localStorage.getItem('userLoggedIn');
    if (!raw) {
      if (confirm('You are not logged in. Go to login page?')) this.router.navigate(['/login']);
      return;
    }

    this.loggedInUser = JSON.parse(raw);
    this.loggedInRole = this.loggedInUser?.role ?? '';
    this.isEditor = this.loggedInRole === 'editor';
    this.isSuperuser = this.loggedInRole === 'superuser';
    this.isMember = this.loggedInRole === 'member';

    this.loadInitialData();

    if (this.isSuperuser) {
      this.loadDeaneries();
      this.setupParishListener();
    }
  }

  // ── Data loading ─────────────────────────────────────────────────────────────

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
        this.christianForm.patchValue({
          ...data,
          birth_date: this.formatDateForInput(data.birth_date)
        });
        this.applyRoleRestrictions(data);
      },
      error: (error) => {
        this.errorMessage = `Failed to load existing data: ${error.error?.message}`;
      }
    });
  }

  /**
   * After loading the Christian's data, apply role-based restrictions:
   *  - Superuser: no restrictions (can change role, deanery, parish freely)
   *  - Editor: parish/deanery locked to their own parish
   *  - Member: parish/deanery completely locked to the record's current parish; role also disabled
   */
  private applyRoleRestrictions(data: any): void {
    if (!this.isSuperuser) {
      this.christianForm.get('role')?.disable();
    }

    if (this.isSuperuser) {
      return;
    }

    const parishId = data.parish_id;
    this.christianForm.get('parish_id')?.setValue(parishId);
    this.christianForm.get('parish_id')?.disable();
    this.christianForm.get('deanery')?.disable();

    if (parishId) {
      this.apiService.getParishById(parishId).subscribe({
        next: (parish) => {
          this.lockedParishName = parish.parish_name;
          this.christianForm.get('deanery')?.setValue(parish.deanery);
        },
        error: () => { /* non-fatal — the ID is already set */ }
      });
    }
  }

  private formatDateForInput(dateString: string): string | null {
    if (!dateString) return null;
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch { return null; }
  }

  private checkSessionStorage(): void {
    const stored = sessionStorage.getItem('christianFormData');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Never restore parish fields from session for restricted roles
      if (!this.isSuperuser) {
        const { parish_id, deanery, role, ...rest } = parsed;
        this.christianForm.patchValue(rest);
      } else {
        this.christianForm.patchValue(parsed);
      }
    }
  }


  private loadDeaneries(): void {
    this.apiService.getParishes().subscribe({
      next: (data) => {
        const deanerySet = new Set<string>();
        data.forEach((item: any) => {
          if (item?.deanery?.trim()) deanerySet.add(item.deanery.trim());
        });
        this.deaneries = Array.from(deanerySet).sort();
      },
      error: () => { this.errorMessage = 'Failed to load deaneries.'; }
    });
  }

  private setupParishListener(): void {
    this.christianForm.get('deanery')?.valueChanges.subscribe(deanery => {
      this.parishes = [];
      if (!deanery?.trim()) return;
      this.apiService.getParishByDeanery(deanery.trim()).subscribe({
        next: (parishes) => { this.parishes = Array.isArray(parishes) ? parishes : []; },
        error: () => { this.errorMessage = `Failed to load parishes for ${deanery}.`; }
      });
    });
  }

  // ── Submit ───────────────────────────────────────────────────────────────────

  onSubmitChristianForm(): void {
    if (this.christianForm.invalid) {
      Object.values(this.christianForm.controls).forEach(c => c.markAsTouched());
      this.errorMessage = 'Please fill in all required fields';
      return;
    }
    if (!this.userId) { this.errorMessage = 'No Christian selected'; return; }

    this.isSubmitting = true;
    const payload = this.christianForm.getRawValue();
    sessionStorage.setItem('christianFormData', JSON.stringify(payload));

    this.apiService.updateChristian(this.userId, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Personal information saved successfully!';
        sessionStorage.removeItem('christianFormData');
        setTimeout(() => this.navigateToBaptism(), 2000);
      },
      error: (error) => {
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || 'An error occurred';
      }
    });
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  hasFieldError(fieldName: string): boolean {
    const field = this.christianForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.christianForm.get(fieldName);
    return field?.errors?.['required'] && field.touched
      ? `${this.getFieldLabel(fieldName)} is required` : '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      'first_name': 'First Name', 'last_name': 'Last Name', 'middle_name': 'Middle Name',
      'phone_number': 'Phone Number', 'birth_date': 'Birth Date', 'birth_place': 'Birth Place',
      'subcounty': 'Sub County', 'parish_id': 'Parish', 'role': 'Role'
    };
    return labels[fieldName] || fieldName;
  }

  private getSelectedChristianId(): string | null {
    const s = localStorage.getItem('selectedChristian');
    return s ? JSON.parse(s).id : null;
  }

  noFutureDateValidator(control: AbstractControl) {
    if (!control.value) return null;
    const selected = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected > today ? { futureDate: true } : null;
  }

  navigateToBaptism(): void {
    const christianId = this.getSelectedChristianId();
    if (christianId) this.router.navigate(['/edit-baptism'], { queryParams: { id: christianId } });
  }

  navigateToDashboard(): void {
    this.nav.goToDashboard();
  }
}