import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from '../../shared/progress-bar';

@Component({
  selector: 'app-marriage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProgressBarComponent],
  templateUrl: './marriage.component.html',
  styleUrl: './marriage.component.css'
})
export class MarriageUpdateComponent implements OnInit {
  marriageForm: FormGroup;
  countyOptions = [
    'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita/Taveta', 'Garissa', 'Wajir',
    'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos',
    'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga', "Murang'a", 'Kiambu', 'Turkana',
    'West Pokot', 'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo/Marakwet', 'Nandi',
    'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega',
    'Vihiga', 'Bungoma', 'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii',
    'Nyamira', 'Nairobi'
  ];
  maritalStatusOptions = ['Single', 'Divorced', 'Widowed'];

  showSuccess = false;
  noMarriage = false;
  isSubmitting = false;
  userId: string | null = null;
  existingMarriageId: number | null = null;
  existingPartyIds: number[] = [];
  currentStep = 4;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.marriageForm = this.fb.group({
      civilMarriageCertificateNumber: ['', Validators.required],
      marriageDate: ['', Validators.required],
      submissionLocation: ['', Validators.required],
      submissionSubCounty: ['', Validators.required],
      submissionCounty: ['', Validators.required],
      conductedBy: ['', Validators.required],
      witness1Name: ['', Validators.required],
      witness1SonOf: [''],
      witness1Clan: [''],
      witness2Name: ['', Validators.required],
      witness2SonOf: [''],
      witness2Clan: [''],
      parties: this.fb.array([])
    });
  }

  ngOnInit(): void {
    const user = localStorage.getItem('userLoggedIn');
    if (!user) {
      setTimeout(() => {
        if (confirm('You are not logged in. Do you want to go to the login page?')) {
          this.router.navigate(['/login']);
        }
      }, 3000);
      return;
    }

    if (this.parties.length === 0) {
      this.parties.push(this.createPartyGroup('groom'));
      this.parties.push(this.createPartyGroup('bride'));
    }

    const localStorageData = localStorage.getItem('selectedChristian');
    if (localStorageData) {
      try {
        this.userId = JSON.parse(localStorageData)?.id || null;
        if (this.userId) this.loadExistingMarriageData();
      } catch (e) { console.error('Error parsing user data:', e); }
    }
  }

  createPartyGroup(partyType: string, partyId: number | null = null): FormGroup {
    return this.fb.group({
      partyId: [partyId],
      partyType: [partyType, Validators.required],
      fullName: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      domicile: ['', Validators.required],
      fatherName: ['', Validators.required],
      motherName: ['', Validators.required]
    });
  }

  private loadExistingMarriageData() {
    if (!this.userId) return;
    this.apiService.getFullMarriageByUserId(this.userId).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          this.existingMarriageId = data[0].marriage_id;
          this.populateForm(data[0]);
        } else {
          this.noMarriage = true;
        }
      },
      error: () => { this.noMarriage = true; }
    });
  }

  private populateForm(m: any) {
    this.marriageForm.patchValue({
      civilMarriageCertificateNumber: m.civil_marriage_certificate_number,
      marriageDate: this.formatDate(m.marriage_date),
      submissionLocation: m.submission_location,
      submissionSubCounty: m.submission_sub_county,
      submissionCounty: m.submission_county,
      conductedBy: m.conducted_by,
      witness1Name: m.witness1_name,
      witness1SonOf: m.witness1_son_of,
      witness1Clan: m.witness1_clan,
      witness2Name: m.witness2_name,
      witness2SonOf: m.witness2_son_of,
      witness2Clan: m.witness2_clan,
    });

    while (this.parties.length) this.parties.removeAt(0);
    this.existingPartyIds = [];

    if (m.parties?.length > 0) {
      m.parties.forEach((party: any) => {
        this.existingPartyIds.push(party.party_id);
        this.parties.push(this.fb.group({
          partyId: [party.party_id],
          partyType: [party.party_type, Validators.required],
          fullName: [party.full_name, Validators.required],
          maritalStatus: [party.marital_status, Validators.required],
          domicile: [party.domicile, Validators.required],
          fatherName: [party.father_name, Validators.required],
          motherName: [party.mother_name, Validators.required]
        }));
      });
    }
  }

  get parties(): FormArray {
    return this.marriageForm.get('parties') as FormArray;
  }

  hasFieldError(field: string): boolean {
    const c = this.marriageForm.get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
  getFieldError(field: string): string {
    return this.marriageForm.get(field)?.errors?.['required'] ? 'This field is required' : '';
  }
  hasArrayFieldError(arrayName: string, index: number, field: string): boolean {
    const c = (this.marriageForm.get(arrayName) as FormArray).at(index).get(field);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }
  getArrayFieldError(arrayName: string, index: number, field: string): string {
    const c = (this.marriageForm.get(arrayName) as FormArray).at(index).get(field);
    return c?.errors?.['required'] ? 'This field is required' : '';
  }

  private formatDate(s: string): string {
    if (!s) return '';
    return new Date(s).toISOString().split('T')[0];
  }

  onSubmit(): void {
    if (this.marriageForm.invalid || !this.userId) {
      this.marriageForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const v = this.marriageForm.value;

    const marriageData = {
      civil_marriage_certificate_number: v.civilMarriageCertificateNumber,
      marriage_date: v.marriageDate,
      submission_location: v.submissionLocation,
      submission_sub_county: v.submissionSubCounty,
      submission_county: v.submissionCounty,
      conducted_by: v.conductedBy,
      witness1_name: v.witness1Name,
      witness1_son_of: v.witness1SonOf,
      witness1_clan: v.witness1Clan,
      witness2_name: v.witness2Name,
      witness2_son_of: v.witness2SonOf,
      witness2_clan: v.witness2Clan,
    };

    const saveMarriage = this.existingMarriageId
      ? this.apiService.updateMarriage(this.existingMarriageId.toString(), marriageData)
      : this.apiService.createMarriage({ ...marriageData, user_id: this.userId });

    saveMarriage.subscribe({
      next: (resp: any) => {
        const marriageId = this.existingMarriageId || resp.marriage_id;
        this.saveParties(marriageId, v.parties);
      },
      error: (err: any) => {
        console.error('Marriage save error:', err);
        this.isSubmitting = false;
        alert('Error saving marriage record. Please try again.');
      }
    });
  }

  private saveParties(marriageId: number, parties: any[]) {
    const deletePromises = this.existingPartyIds.map(id =>
      this.apiService.deleteMarriageParty(id.toString()).toPromise()
    );

    Promise.all(deletePromises).then(() => {
      const createPromises = parties.map((party: any) =>
        this.apiService.createMarriageParty({
          marriage_id: marriageId,
          party_type: party.partyType,
          full_name: party.fullName,
          marital_status: party.maritalStatus,
          domicile: party.domicile,
          father_name: party.fatherName,
          mother_name: party.motherName,
        }).toPromise()
      );

      Promise.all(createPromises).then(() => {
        this.isSubmitting = false;
        this.showSuccess = true;
        setTimeout(() => this.router.navigate(['/dashboard']), 3000);
      }).catch(err => {
        console.error('Party creation error:', err);
        this.isSubmitting = false;
        alert('Error creating marriage parties. Please try again.');
      });
    }).catch(err => {
      console.error('Party delete error:', err);
      this.isSubmitting = false;
    });
  }

  navigateToConfirmation() {
    const id = this.getSelectedChristianId();
    if (id) this.router.navigate(['/edit-confirmation'], { queryParams: { id } });
  }

  private getSelectedChristianId(): string | null {
    const s = localStorage.getItem('selectedChristian');
    return s ? JSON.parse(s).id : null;
  }
}