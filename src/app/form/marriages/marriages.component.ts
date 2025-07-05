import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-marriages',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './marriages.component.html',
  styleUrl: './marriages.component.css'
})
export class MarriagesComponent implements OnInit {
  marriageForm: FormGroup;
  countyOptions = ['Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita/Taveta', 'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo/Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira', 'Nairobi'];
  maritalStatusOptions = ['Single', 'Divorced', 'Widowed'];
  showSuccess = false;
  isSubmitting = false;
  selectedFile: File | null = null;
  uploadProgress: number | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.marriageForm = this.fb.group({
      certificateNumber: ['', Validators.required],
      marriageDate: ['', Validators.required],
      submissionLocation: ['', Validators.required],
      submissionSubCounty: ['', Validators.required],
      submissionCounty: ['', Validators.required],
      marriageEntryNumber: ['', Validators.required],
      registrarCertificationNumber: ['', Validators.required],
      parties: this.fb.array([
        this.createPartyGroup('groom'),
        this.createPartyGroup('bride')
      ]),
      conductedBy: ['', Validators.required],
      specialLicenseNumber: [''],
      privatePartiesCount: [''],
      privatePartiesNames: [''],
      marriageCertificateFile: [null, Validators.required]
    });
  }

  ngOnInit(): void { }

  createPartyGroup(partyType: string): FormGroup {
    return this.fb.group({
      partyType: [partyType, Validators.required],
      fullName: ['', Validators.required],
      age: ['', [Validators.required, Validators.min(18)]],
      maritalStatus: ['', Validators.required],
      occupation: ['', Validators.required],
      residenceAddress: ['', Validators.required],
      residenceCounty: ['', Validators.required],
      residenceSubCounty: ['', Validators.required],
      fatherName: ['', Validators.required],
      fatherOccupation: ['', Validators.required],
      fatherResidence: ['', Validators.required],
      motherName: ['', Validators.required],
      motherOccupation: ['', Validators.required],
      motherResidence: ['', Validators.required]
    });
  }

  get parties(): FormArray {
    return this.marriageForm.get('parties') as FormArray;
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.marriageForm.patchValue({ marriageCertificateFile: file });
      this.marriageForm.get('marriageCertificateFile')?.updateValueAndValidity();
    }
  }

  hasFieldError(field: string): boolean {
    const control = this.marriageForm.get(field);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  getFieldError(field: string): string {
    const control = this.marriageForm.get(field);
    if (control && control.errors) {
      if (control.errors['required']) {
        return 'This field is required';
      }
      if (control.errors['min']) {
        return `Minimum age is ${control.errors['min'].min}`;
      }
    }
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
    if (control && control.errors) {
      if (control.errors['required']) {
        return 'This field is required';
      }
      if (control.errors['min']) {
        return `Minimum age is ${control.errors['min'].min}`;
      }
    }
    return '';
  }

  onSubmit(): void {
    if (this.marriageForm.invalid || !this.selectedFile) {
      this.marriageForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.uploadProgress = 0;

    // Get addedChristian from local storage
    const addedChristian = localStorage.getItem('addedUser');
    let userId: string | null = null;
    if (addedChristian) {
      try {
        const christianObj = JSON.parse(addedChristian);
        userId = christianObj.id || null;
      } catch (e) {
        userId = null;
      }
    }
    if (!userId) {
      this.isSubmitting = false;
      this.uploadProgress = null;
      alert('No user selected. Please select a Christian before submitting.');
      return;
    }

    // Prepare main marriage data
    const marriageData = {
      user_id: userId,
      certificate_number: this.marriageForm.value.certificateNumber,
      marriage_date: this.marriageForm.value.marriageDate,
      submission_location: this.marriageForm.value.submissionLocation,
      submission_sub_county: this.marriageForm.value.submissionSubCounty,
      submission_county: this.marriageForm.value.submissionCounty,
      marriage_entry_number: this.marriageForm.value.marriageEntryNumber,
      registrar_certification_number: this.marriageForm.value.registrarCertificationNumber,
      conducted_by: this.marriageForm.value.conductedBy,
      special_license_number: this.marriageForm.value.specialLicenseNumber,
      private_parties_count: this.marriageForm.value.privatePartiesCount,
      private_parties_names: this.marriageForm.value.privatePartiesNames
    };

    // Create marriage record
    this.apiService.createMarriage(marriageData).subscribe({
      next: (marriageResponse) => {
        const marriageId = marriageResponse.marriage_id;

        // Create marriage parties
        const partyPromises = this.marriageForm.value.parties.map((party: any) => {
          const partyData = {
            marriage_id: marriageId,
            party_type: party.partyType,
            full_name: party.fullName,
            age: party.age,
            marital_status: party.maritalStatus,
            residence_address: party.residenceAddress,
            residence_county: party.residenceCounty,
            residence_sub_county: party.residenceSubCounty,
            occupation: party.occupation,
            father_name: party.fatherName,
            father_occupation: party.fatherOccupation,
            father_residence: party.fatherResidence,
            mother_name: party.motherName,
            mother_occupation: party.motherOccupation,
            mother_residence: party.motherResidence
          };
          return this.apiService.createMarriageParty(partyData).toPromise();
        });

        // Wait for all parties to be created
        Promise.all(partyPromises).then(() => {
          // Upload marriage certificate
          const formData = new FormData();
          formData.append('marriage_id', marriageId);
          formData.append('document_type', 'Marriage Certificate');
          formData.append('file', this.selectedFile as Blob);

          this.apiService.createMarriageDocument(formData)
            .pipe(
              finalize(() => {
                this.isSubmitting = false;
                this.uploadProgress = null;
              })
            )
            .subscribe({
              next: (event: any) => {
                // Handle upload progress
                if (event.type === 1 && event.loaded && event.total) {
                  this.uploadProgress = Math.round((100 * event.loaded) / event.total);
                }

                // Complete
                if (event.type === 4) {
                  this.showSuccess = true;
                  setTimeout(() => {
                    this.router.navigate(['/dashboard']);
                  }, 3000);
                }
              },
              error: (err) => {
                console.error('Document upload error:', err);
                alert('Error uploading document. Please try again.');
              }
            });
        }).catch(err => {
          console.error('Party creation error:', err);
          this.isSubmitting = false;
          alert('Error creating marriage parties. Please try again.');
        });
      },
      error: (err) => {
        console.error('Marriage creation error:', err);
        this.isSubmitting = false;
        this.uploadProgress = null;
        alert('Error creating marriage record. Please try again.');
      }
    });
  }
}