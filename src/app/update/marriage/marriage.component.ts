// import { Component, inject, OnInit } from '@angular/core';
// import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
// import { Router } from '@angular/router';
// import { ApiService } from '../../services/api.service';
// import { NgIf } from '@angular/common';

// @Component({
//   selector: 'app-marriage',
//   imports: [ReactiveFormsModule, NgIf],
//   templateUrl: './marriage.component.html',
//   styleUrls: ['./marriage.component.css']
// })
// export class MarriageUpdateComponent implements OnInit {
//   constructor(
//     private router: Router,
//     private marriageService: ApiService
//   ) {}

//   private fb = inject(FormBuilder);

//   marriageForm = this.fb.group({
//     marriage_certificate_no: ['', [Validators.required]],
//     entry_no: ['', [Validators.required]],
//     county: ['', [Validators.required]],
//     subcounty: ['', [Validators.required]],
//     place_of_marriage: ['', [Validators.required]],
//     marriage_date: ['', [Validators.required]],
//     first_name_groom: ['', [Validators.required]],
//     last_name_groom: ['', [Validators.required]],
//     age_groom: ['', [Validators.required, Validators.min(18), Validators.max(150)]],
//     occupation_groom: ['', [Validators.required]],
//     residence_groom: ['', [Validators.required]],
//     first_name_bride: ['', [Validators.required]],
//     last_name_bride: ['', [Validators.required]],
//     age_bride: ['', [Validators.required, Validators.min(18), Validators.max(150)]],
//     occupation_bride: ['', [Validators.required]],
//     residence_bride: ['', [Validators.required]],
//     first_name_witness1: ['', [Validators.required]],
//     last_name_witness1: ['', [Validators.required]],
//     first_name_witness2: [''], // Optional
//     last_name_witness2: [''], // Optional
//     registrar: ['', [Validators.required]],
//     ref_number: ['', [Validators.required]],
//     file_url: [''],
//     user_id: ['']
//   });

//   errorMessage = '';
//   successMessage = '';
//   userId: any;
//   selectedFile: File | null = null;
//   isSubmitting = false;
//   isUploading = false;
//   uploadProgress = 0;

//   ngOnInit(): void {
//     console.log("Fill in the marriage form");

//     const user = localStorage.getItem('userLoggedIn');
//     if (!user) {
//       setTimeout(() => {
//         if (confirm('You are not logged in. Do you want to go to the login page?')) {
//           this.router.navigate(['/login']);
//         }
//       }, 3000);
//       return;
//     }

//     // Fixed: Changed from 'christianFormData' to 'marriageFormData'
//     const storedFormData = sessionStorage.getItem('marriageFormData');
//     if (storedFormData) {
//       try {
//         const formData = JSON.parse(storedFormData);
//         this.marriageForm.patchValue(formData);
//       } catch (error) {
//         console.error('Error parsing stored form data:', error);
//         sessionStorage.removeItem('marriageFormData');
//       }
//     }

//     // Load user ID from localStorage
//     const localStorageData = localStorage.getItem('selectedChristian');
//     if (localStorageData) {
//       try {
//         const parsedData = JSON.parse(localStorageData);
//         this.userId = parsedData?.id;
//         if (this.userId) {
//           this.marriageForm.patchValue({ user_id: this.userId });
//         }
//       } catch (error) {
//         console.error('Error parsing user data:', error);
//       }
//     }
//   }

//   onSubmitMarriageForm(): void {
//     // Fixed: Removed untouched condition that was preventing valid form submission
//     // if (this.marriageForm.invalid) {
//     //   this.errorMessage = 'Please fill in all required fields correctly.';
//     //   this.markAllFieldsAsTouched();
//     //   return;
//     // }

//     // Clear previous messages
//     this.errorMessage = '';
//     this.successMessage = '';
//     this.isSubmitting = true;

//     // Save form data to session storage before submission
//     this.saveFormDataToSession();

//     if (!this.userId) {
//       const localStorageData = localStorage.getItem('selectedChristian');
//       if (localStorageData) {
//         try {
//           const parsedData = JSON.parse(localStorageData);
//           this.userId = parsedData?.id;
//           this.marriageForm.patchValue({ user_id: this.userId });
//         } catch (error) {
//           console.error('Error parsing user data:', error);
//           this.errorMessage = 'Error retrieving user information. Please try again.';
//           this.isSubmitting = false;
//           return;
//         }
//       } else {
//         this.errorMessage = 'User information not found. Please log in again.';
//         this.isSubmitting = false;
//         return;
//       }
//     }

//     if (this.selectedFile) {
//       this.uploadFile().then((fileUrl) => {
//         this.marriageForm.patchValue({ file_url: fileUrl });
//         this.checkAndSaveMarriage();
//         console.log('File uploaded successfully:', fileUrl);
//       }).catch((error) => {
//         console.error('Error uploading file:', error);
//         this.errorMessage = 'Error uploading file. Please try again.';
//         this.isSubmitting = false;
//       });
//     } else {
//       this.checkAndSaveMarriage();
//     }
//   }

//   private saveFormDataToSession(): void {
//     try {
//       const formData = this.marriageForm.value;
//       sessionStorage.setItem('marriageFormData', JSON.stringify(formData));
//     } catch (error) {
//       console.error('Error saving form data to session:', error);
//     }
//   }

//   private checkAndSaveMarriage(): void {
//     this.marriageService.getMarriageByUserId(this.userId).subscribe({
//       next: (existingRecord: any) => {
//         if (existingRecord && existingRecord.length > 0) {
//           this.updateMarriageRecord(existingRecord[0].marriage_id);
//         } else {
//           this.createMarriageRecord();
//         }
//       },
//       error: (error: any) => {
//         console.error('Error checking existing marriage record:', error);
//         this.errorMessage = 'Failed to check existing marriage record. Please try again.';
//         this.isSubmitting = false;
//       }
//     });
//   }

//   private createMarriageRecord(): void {
//     const formData = this.prepareFormData();

//     this.marriageService.createMarriage(formData).subscribe({
//       next: (response) => {
//         console.log('Marriage information added successfully:', response);
//         this.successMessage = 'Marriage Information added successfully!';
//         this.clearSessionData();
//         this.navigateToDashboard();
//         this.isSubmitting = false;
//       },
//       error: (error) => {
//         console.error('Error adding marriage information:', error);
//         this.errorMessage = this.getErrorMessage(error) || 'Failed to add marriage information. Please try again.';
//         this.isSubmitting = false;
//       }
//     });
//   }

//   private updateMarriageRecord(marriageId: any): void {
//     const formData = this.prepareFormData();

//     this.marriageService.updateMarriage(marriageId, formData).subscribe({
//       next: (response) => {
//         console.log('Marriage information updated successfully:', response);
//         this.successMessage = 'Marriage Information updated successfully!';
//         this.clearSessionData();
//         this.navigateToDashboard();
//         this.isSubmitting = false;
//       },
//       error: (error: any) => {
//         console.error('Error updating marriage information:', error);
//         this.errorMessage = this.getErrorMessage(error) || 'Failed to update marriage information. Please try again.';
//         this.isSubmitting = false;
//       }
//     });
//   }

//   private prepareFormData(): FormData {
//     const formData = this.marriageForm.value as any;
//     formData.user_id = this.userId; // Ensure user_id is included
    
//     Object.keys(this.marriageForm.value).forEach(key => {
//       const value = this.marriageForm.value[key as keyof typeof this.marriageForm.value];
//       if (value !== null && value !== undefined && value !== '') {
//         formData.append(key, value.toString());
//       }
//     });

//     if (this.selectedFile) {
//       formData.append('marriage_certificate', this.selectedFile);
//       console.log('Selected file:', this.selectedFile.name);
//     }

//     return formData;
//   }

//   private getErrorMessage(error: any): string {
//     if (error?.error?.message) {
//       return error.error.message;
//     }
//     if (error?.message) {
//       return error.message;
//     }
//     return '';
//   }

//   private clearSessionData(): void {
//     try {
//       sessionStorage.removeItem('marriageFormData');
//     } catch (error) {
//       console.error('Error clearing session data:', error);
//     }
//   }

//   private markAllFieldsAsTouched(): void {
//     Object.keys(this.marriageForm.controls).forEach(key => {
//       this.marriageForm.get(key)?.markAsTouched();
//     });
//   }

//   navigateToDashboard(): void {
//     // Save current form state before navigating
//     this.saveFormDataToSession();
//     // setTimeout(() => {
//     //   this.router.navigate(['/dashboard']);
//     // }, 1500);
//   }

//   navigateToConfirmation(): void {
//     // Save current form state before navigating
//     this.saveFormDataToSession();
//     setTimeout(() => {
//       this.router.navigate(['/edit-confirmation']);
//     }, 1000);
//   }

//   onFileSelected(event: any): void {
//     const file = event.target.files[0];
//     if (file) {
//       const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
//       if (!allowedTypes.includes(file.type)) {
//         this.errorMessage = 'Please select a valid file type (JPEG, PNG, or PDF).';
//         this.clearFileInput();
//         return;
//       }

//       const maxSize = 5 * 1024 * 1024; // 5MB
//       if (file.size > maxSize) {
//         this.errorMessage = 'File size must be less than 5MB.';
//         this.clearFileInput();
//         return;
//       }

//       this.selectedFile = file;
//       this.errorMessage = '';
//       console.log('File selected:', file.name, 'Size:', this.getFileSize());
//     }
//   }

//   private clearFileInput(): void {
//     const fileInput = document.getElementById('file_upload') as HTMLInputElement;
//     if (fileInput) {
//       fileInput.value = '';
//     }
//     this.selectedFile = null;
//   }

//   removeSelectedFile(): void {
//     this.clearFileInput();
//     console.log('File removed');
//   }

//   getFileName(): string {
//     return this.selectedFile ? this.selectedFile.name : '';
//   }

//   getFileSize(): string {
//     if (!this.selectedFile) return '';
//     const size = this.selectedFile.size;
//     if (size < 1024) return size + ' bytes';
//     if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
//     return (size / (1024 * 1024)).toFixed(1) + ' MB';
//   }

//   private uploadFile(): Promise<string> {
//     return new Promise<string>((resolve, reject) => {
//       if (!this.selectedFile) {
//         reject('No file selected');
//         return;
//       }

//       // Prepare form data with only the file
//       const formData = new FormData();
//       formData.append('marriage_certificate', this.selectedFile);

//       // Listen for file_url value change after update/create
//       const fileUrlSubscription = this.marriageForm.get('file_url')?.valueChanges.subscribe((fileUrl) => {
//         if (fileUrl) {
//           fileUrlSubscription?.unsubscribe();
//           this.isUploading = false;
//           resolve(fileUrl);
//         }
//       });

//       this.isUploading = true;
//       this.uploadProgress = 100;

//       this.marriageService.getMarriageByUserId(this.userId).subscribe({
//         next: (existingRecord: any) => {
//           const marriageId = existingRecord && existingRecord.length > 0 ? existingRecord[0].marriage_id : null;
//           const apiCall = marriageId
//             ? this.marriageService.updateMarriage(marriageId, formData)
//             : this.marriageService.createMarriage(formData);

//           apiCall.subscribe({
//             next: () => {
//               // Do nothing here, wait for valueChanges to resolve
//             },
//             error: (error: any) => {
//               fileUrlSubscription?.unsubscribe();
//               this.isUploading = false;
//               reject(error);
//             }
//           });
//         },
//         error: (error: any) => {
//           fileUrlSubscription?.unsubscribe();
//           this.isUploading = false;
//           reject(error);
//         }
//       });
//     });
//   }


//   hasFieldError(fieldName: string): boolean {
//     const field = this.marriageForm.get(fieldName);
//     return !!(field && field.invalid && (field.dirty || field.touched));
//   }

//   getFieldError(fieldName: string): string {
//     const field = this.marriageForm.get(fieldName);
//     if (field && field.errors && (field.dirty || field.touched)) {
//       if (field.errors['required']) {
//         return `${this.getFieldLabel(fieldName)} is required.`;
//       }
//       if (field.errors['min']) {
//         return `${this.getFieldLabel(fieldName)} must be at least ${field.errors['min'].min}.`;
//       }
//       if (field.errors['max']) {
//         return `${this.getFieldLabel(fieldName)} must not exceed ${field.errors['max'].max}.`;
//       }
//       if (field.errors['pattern']) {
//         return `${this.getFieldLabel(fieldName)} format is invalid.`;
//       }
//     }
//     return '';
//   }

//   private getFieldLabel(fieldName: string): string {
//     const labels: { [key: string]: string } = {
//       'marriage_certificate_no': 'Marriage Certificate Number',
//       'entry_no': 'Entry Number',
//       'county': 'County',
//       'subcounty': 'Sub County',
//       'place_of_marriage': 'Place of Marriage',
//       'marriage_date': 'Marriage Date',
//       'first_name_groom': 'Groom First Name',
//       'last_name_groom': 'Groom Last Name',
//       'age_groom': 'Groom Age',
//       'occupation_groom': 'Groom Occupation',
//       'residence_groom': 'Groom Residence',
//       'first_name_bride': 'Bride First Name',
//       'last_name_bride': 'Bride Last Name',
//       'age_bride': 'Bride Age',
//       'occupation_bride': 'Bride Occupation',
//       'residence_bride': 'Bride Residence',
//       'first_name_witness1': 'First Witness First Name',
//       'last_name_witness1': 'First Witness Last Name',
//       'first_name_witness2': 'Second Witness First Name',
//       'last_name_witness2': 'Second Witness Last Name',
//       'registrar': 'Registrar',
//       'ref_number': 'Reference Number'
//     };
//     return labels[fieldName] || fieldName;
//   }

//   // Helper method to check if form is ready for submission
//   isFormValid(): boolean {
//     return this.marriageForm.valid && !this.isSubmitting && !this.isUploading;
//   }

//   // Helper method to get form submission button text
//   getSubmitButtonText(): string {
//     if (this.isUploading) return 'Uploading...';
//     if (this.isSubmitting) return 'Submitting...';
//     return 'Submit Form';
//   }
// }