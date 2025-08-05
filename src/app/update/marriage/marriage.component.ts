import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ProgressBarComponent } from '../../form/progress-bar';

@Component({
  selector: 'app-marriage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProgressBarComponent],
  templateUrl: './marriage.component.html',
  styleUrl: './marriage.component.css'
})
export class MarriageUpdateComponent implements OnInit {
  marriageForm: FormGroup;
  countyOptions = ['Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita/Taveta', 'Garissa', 'Wajir', 'Mandera', 'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo/Marakwet', 'Nandi', 'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga', 'Bungoma', 'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira', 'Nairobi'];
  maritalStatusOptions = ['Single', 'Divorced', 'Widowed'];
  showSuccess = false;
  noMarriage = false;
  isSubmitting = false;
  selectedFile: File | null = null;
  uploadProgress: number | null = null;
  userId: string | null = null;
  existingMarriageId: number | null = null;
  existingPartyIds: number[] = [];
  currentStep = 4; // Track the current step for the progress bar

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
      parties: this.fb.array([]),
      conductedBy: ['', Validators.required],
      specialLicenseNumber: [''],
      privatePartiesCount: [''],
      privatePartiesNames: [''],
      marriageCertificateFile: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    console.log("Edit the Marriage Form")
    this.loadUserData();
    
    // Initialize parties if creating new
    if (this.parties.length === 0) {
      this.parties.push(this.createPartyGroup('groom'));
      this.parties.push(this.createPartyGroup('bride'));
    }
  }

  private loadUserData(): void {
    // Get user ID from localStorage
    const user = localStorage.getItem('userLoggedIn');
    if (!user) {
      setTimeout(() => {
        if (confirm('You are not logged in. Do you want to go to the login page?')) {
          this.router.navigate(['/login']);
        }
      }, 3000);
      return;
    }

    const localStorageData = localStorage.getItem('selectedChristian');
    if (localStorageData) {
      try {
        const parsedData = JSON.parse(localStorageData);
        this.userId = parsedData?.id || null;
        if (this.userId) {
          this.loadExistingMarriageData();
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }

  private loadExistingMarriageData() {
    if (!this.userId) return;

    this.apiService.getFullMarriageByUserId(this.userId).subscribe({
      next: (data: any) => {
        if (data && data.length > 0) {
          this.existingMarriageId = data[0].marriage_id;
          this.populateForm(data[0]);
        }
      },
      error: (error) => {
        console.error('Error fetching marriage data:', error);
        this.noMarriage = true;
      }
    });
  }

  private populateForm(marriageData: any) {
    this.marriageForm.patchValue({
      certificateNumber: marriageData.certificate_number,
      marriageDate: this.formatDateForInput(marriageData.marriage_date),
      submissionLocation: marriageData.submission_location,
      submissionSubCounty: marriageData.submission_sub_county,
      submissionCounty: marriageData.submission_county,
      marriageEntryNumber: marriageData.marriage_entry_number,
      registrarCertificationNumber: marriageData.registrar_certification_number,
      conductedBy: marriageData.conducted_by,
      specialLicenseNumber: marriageData.special_license_number,
      privatePartiesCount: marriageData.private_parties_count,
      privatePartiesNames: marriageData.private_parties_names
    });

    // Clear existing parties
    while (this.parties.length) {
      this.parties.removeAt(0);
    }

    // Add parties and collect existing party IDs
    this.existingPartyIds = [];
    if (marriageData.parties && marriageData.parties.length > 0) {
      marriageData.parties.forEach((party: any) => {
        this.existingPartyIds.push(party.party_id);
        this.parties.push(this.fb.group({
          partyId: [party.party_id],
          partyType: [party.party_type, Validators.required],
          fullName: [party.full_name, Validators.required],
          age: [party.age, [Validators.required, Validators.min(18)]],
          maritalStatus: [party.marital_status, Validators.required],
          occupation: [party.occupation, Validators.required],
          residenceAddress: [party.residence_address, Validators.required],
          residenceCounty: [party.residence_county, Validators.required],
          residenceSubCounty: [party.residence_sub_county, Validators.required],
          fatherName: [party.father_name, Validators.required],
          fatherOccupation: [party.father_occupation, Validators.required],
          fatherResidence: [party.father_residence, Validators.required],
          motherName: [party.mother_name, Validators.required],
          motherOccupation: [party.mother_occupation, Validators.required],
          motherResidence: [party.mother_residence, Validators.required]
        }));
      });
    }
  }

  createPartyGroup(partyType: string, partyId: number | null = null): FormGroup {
    return this.fb.group({
      partyId: [partyId],
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
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        this.clearFileInput();
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.clearFileInput();
        return;
      }

      this.selectedFile = file;
      this.marriageForm.patchValue({ marriageCertificateFile: file });
      this.marriageForm.get('marriageCertificateFile')?.updateValueAndValidity();
    }
  }

  private clearFileInput(): void {
    const fileInput = document.getElementById('marriageCertificateFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
    this.selectedFile = null;
  }

  hasFieldError(field: string): boolean {
    const control = this.marriageForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getFieldError(field: string): string {
    const control = this.marriageForm.get(field);
    if (control && control.errors) {
      if (control.errors['required']) return 'This field is required';
    }
    return '';
  }

  hasArrayFieldError(arrayName: string, index: number, field: string): boolean {
    const array = this.marriageForm.get(arrayName) as FormArray;
    const group = array.at(index) as FormGroup;
    const control = group.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getArrayFieldError(arrayName: string, index: number, field: string): string {
    const array = this.marriageForm.get(arrayName) as FormArray;
    const group = array.at(index) as FormGroup;
    const control = group.get(field);
    if (control && control.errors) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['min']) return `Minimum age is ${control.errors['min'].min}`;
    }
    return '';
  }

  onSubmit(): void {
    if (this.marriageForm.invalid || !this.selectedFile || !this.userId) {
      this.marriageForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.uploadProgress = 0;
    this.showSuccess = false;

    const marriageData = {
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

    if (this.existingMarriageId) {
      this.updateMarriage(marriageData);
    } else {
      this.createMarriage(marriageData);
    }
  }

  private createMarriage(marriageData: any) {
    // Add user ID to marriage data
    const fullMarriageData = { ...marriageData, user_id: this.userId };

    this.apiService.createMarriage(fullMarriageData).subscribe({
      next: (marriageResponse) => {
      const marriageId = marriageResponse.marriage_id;
      this.createParties(marriageId)
        .then(() => this.uploadDocument(marriageId))
        .catch(err => {
        console.error('Error creating parties or document:', err);
        this.handleError('Error creating parties or document', err);
        });
      },
      error: (err) => {
      console.error('Error creating marriage record:', err);
      this.handleError('Error creating marriage record', err);
      }
    });
  }

  private updateMarriage(marriageData: any) {
    if (!this.existingMarriageId) return;

    this.apiService.updateMarriage(this.existingMarriageId.toString(), marriageData).subscribe({
      next: () => {
      this.updateParties()
        .then(() => this.uploadDocument(this.existingMarriageId!))
        .catch(err => {
        console.error('Error updating parties or document:', err);
        this.handleError('Error updating parties or document', err);
        });
      },
      error: (err) => {
      console.error('Error updating marriage record:', err);
      this.handleError('Error updating marriage record', err);
      }
    });
  }

  private createParties(marriageId: number): Promise<void> {
    return new Promise((resolve, reject) => {
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

      Promise.all(partyPromises)
        .then(() => resolve())
        .catch(err => {
          console.error('Error creating parties:', err);
          reject(err);
        });
    });
  }

  private updateParties(): Promise<void> {
    return new Promise((resolve, reject) => {
      // First delete existing parties
      const deletePromises = this.existingPartyIds.map(id => 
        this.apiService.deleteMarriageParty(id.toString()).toPromise()
      );

      Promise.all(deletePromises)
        .then(() => {
          // Then create new parties
          if (this.existingMarriageId) {
            this.createParties(this.existingMarriageId)
              .then(() => resolve())
              .catch(err => {
              console.error('Error creating parties:', err);
              reject(err);
              });
          } else {
            resolve();
          }
        })
        .catch(err => reject(err));
    });
  }

  private uploadDocument(marriageId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.selectedFile) {
        resolve();
        return;
      }

      const formData = new FormData();
      formData.append('marriage_id', marriageId.toString());
      formData.append('document_type', 'Marriage Certificate');
      formData.append('file', this.selectedFile);

      this.apiService.createMarriageDocument(formData)
        .pipe(
          finalize(() => {
            this.isSubmitting = false;
            this.uploadProgress = null;
          })
        )
        .subscribe({
          next: (event: any) => {
            if (event.type === 1 && event.loaded && event.total) {
              this.uploadProgress = Math.round((100 * event.loaded) / event.total);
            }
            if (event.type === 4) {
              this.showSuccess = true;
              setTimeout(() => {
                this.router.navigate(['/dashboard']);
              }, 3000);
              resolve();
            }
          },
          error: (err) => {
            reject(err);
          }
        });
    });
  }

  private handleError(context: string, error: any) {
    console.error(`${context}:`, error);
    this.isSubmitting = false;
    this.uploadProgress = null;
    alert(`${context}. Please try again.`);
  }

  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  // Get id from localStorage
  getSelectedChristianId(): string | null {
    const selectedChristian = localStorage.getItem('selectedChristian');
    if (selectedChristian) {
      const parsedData = JSON.parse(selectedChristian);
      return parsedData.id && parsedData.first_name && parsedData.last_name && parsedData.middle_name || null;
    }
    return null;
  }

  navigateToConfirmation() {
      this.router.navigate(['/edit-confirmation'], {
        queryParams: { id: this.getSelectedChristianId() }
      });
  }

}