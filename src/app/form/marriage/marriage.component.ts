import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from '../../shared/progress-bar';
import { ParishAutocompleteComponent } from '../../shared/parish-autocomplete/parish-autocomplete.component';

@Component({
  selector: 'app-marriage',
  imports: [CommonModule, ReactiveFormsModule, ProgressBarComponent, ParishAutocompleteComponent],
  templateUrl: './marriage.component.html',
  styleUrl: './marriage.component.css'
})
export class MarriageComponent implements OnInit {
  currentStep = 4;
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

  errorMessage = '';
  successMessage = '';
  showSuccess = false;
  isSubmitting = false;

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
      parties: this.fb.array([
        this.createPartyGroup('groom'),
        this.createPartyGroup('bride')
      ])
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

    const storedFormData = sessionStorage.getItem('marriageFormData');
    if (storedFormData) {
      const formData = JSON.parse(storedFormData);
      this.marriageForm.patchValue(formData);
    }
  }

  createPartyGroup(partyType: string): FormGroup {
    return this.fb.group({
      partyType: [partyType, Validators.required],
      fullName: ['', Validators.required],
      maritalStatus: ['', Validators.required],
      domicile: ['', Validators.required],
      fatherName: ['', Validators.required],
      motherName: ['', Validators.required]
    });
  }

  get parties(): FormArray {
    return this.marriageForm.get('parties') as FormArray;
  }

  hasFieldError(field: string): boolean {
    const control = this.marriageForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getFieldError(field: string): string {
    const control = this.marriageForm.get(field);
    if (control?.errors?.['required']) return 'This field is required';
    return '';
  }

  hasArrayFieldError(arrayName: string, index: number, field: string): boolean {
    const array = this.marriageForm.get(arrayName) as FormArray;
    const group = array.at(index) as FormGroup;
    const control = group.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getArrayFieldError(arrayName: string, index: number, field: string): string {
    const array = this.marriageForm.get(arrayName) as FormArray;
    const group = array.at(index) as FormGroup;
    const control = group.get(field);
    if (control?.errors?.['required']) return 'This field is required';
    return '';
  }

  navigateToConfirmation() {
    if (this.marriageForm.dirty) {
      sessionStorage.setItem('marriageFormData', JSON.stringify(this.marriageForm.value));
    }
    this.router.navigate(['/confirmation']);
  }

  onSubmit(): void {
    if (this.marriageForm.invalid) {
      this.marriageForm.markAllAsTouched();
      return;
    }

    const addedChristian = localStorage.getItem('addedUser');
    let userId: string | null = null;
    if (addedChristian) {
      try {
        userId = JSON.parse(addedChristian).id || null;
      } catch { userId = null; }
    }
    if (!userId) {
      this.errorMessage = 'No user selected. Please add a Christian first.';
      return;
    }

    this.isSubmitting = true;

    const v = this.marriageForm.value;

    const marriageData = {
      user_id: userId,
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

    this.apiService.createMarriage(marriageData).subscribe({
      next: (marriageResponse) => {
        const marriageId = marriageResponse.marriage_id;

        const partyPromises = v.parties.map((party: any) => {
          const partyData = {
            marriage_id: marriageId,
            party_type: party.partyType,
            full_name: party.fullName,
            marital_status: party.maritalStatus,
            domicile: party.domicile,
            father_name: party.fatherName,
            mother_name: party.motherName,
          };
          return this.apiService.createMarriageParty(partyData).toPromise();
        });

        Promise.all(partyPromises).then(() => {
          this.isSubmitting = false;
          this.showSuccess = true;
          this.successMessage = 'Marriage record saved successfully!';
          sessionStorage.removeItem('marriageFormData');
          setTimeout(() => this.router.navigate(['/dashboard']), 3000);
        }).catch(err => {
          console.error('Party creation error:', err);
          this.isSubmitting = false;
          this.errorMessage = err.error?.message || 'Failed to save marriage parties';
          alert('Error creating marriage parties. Please try again.');
        });
      },
      error: (err) => {
        console.error('Marriage creation error:', err);
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Failed to save marriage record';
        alert('Error creating marriage record. Please try again.');
      }
    });
  }
}