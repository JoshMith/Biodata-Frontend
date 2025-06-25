import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-marriage',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './marriage.component.html',
  styleUrl: './marriage.component.css'
})
export class MarriageComponent {
  constructor(
    private marriageService: ApiService, // Inject ApiService for API calls
    private router: Router // Inject Router for navigation
  ) { } // Constructor for the component

  private fb = inject(FormBuilder) // Inject FormBuilder for form creation

  marriageForm = this.fb.group({
    marriage_certificate_no: ['', Validators.required],
    entry_no: ['', Validators.required],
    county: ['', Validators.required],
    subcounty: ['', Validators.required],
    place_of_marriage: ['', Validators.required],
    marriage_date: ['', Validators.required],
    first_name_groom: ['', Validators.required],
    last_name_groom: ['', Validators.required],
    age_groom: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    occupation_groom: ['', Validators.required],
    residence_groom: ['', Validators.required],
    first_name_bride: ['', Validators.required],
    last_name_bride: ['', Validators.required],
    age_bride: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
    occupation_bride: ['', Validators.required],
    residence_bride: ['', Validators.required],
    first_name_witness1: ['', Validators.required],
    last_name_witness1: ['', Validators.required],
    first_name_witness2: [''],
    last_name_witness2: [''],
    registrar: ['', Validators.required],
    ref_number: ['', Validators.required],
    file_url: [''],
    user_id: ['']
  })

  errorMessage = ''; // Variable to hold error messages
  successMessage = ''; // Variable to hold success messages
  selectedFile: File | null = null; // Variable to hold selected file
  isUploading = false; // Variable to track upload status
  uploadProgress = 0; // Variable to track upload progress

  ngOnInit(): void { // Lifecycle hook that is called after the component has been initialized
    console.log("Fill in the marriage form"); // Log message to indicate the form is being filled

    // Check if user is logged in
    const user = localStorage.getItem('userLoggedIn');
    if (!user) {
      setTimeout(() => {
        if (confirm('You are not logged in. Do you want to go to the login page?')) {
          this.router.navigate(['/login']);
        }
      }, 3000);
      return;
    }

    // Check if form data exists in session storage
    const storedFormData = sessionStorage.getItem('marriageFormData');
    if (storedFormData) {
      const formData = JSON.parse(storedFormData);
      this.marriageForm.patchValue(formData);
    }
  }

  onSubmitMarriageForm(): void {
    if (this.marriageForm.untouched) {
      this.errorMessage = 'Please fill in all required fields.';
      console.log('Please fill in all required fields.');
      return;
    }
    if (this.marriageForm.invalid) { // Check if the form is invalid
      this.errorMessage = 'Please fill in all required fields.'; // Set error message
      this.markAllFieldsAsTouched(); // Mark all fields as touched to show validation errors
      return; // Exit the function if the form is invalid
    }

    this.errorMessage = ''; // Clear any previous error messages

    const localStorageData = localStorage.getItem('addedUser'); // Updated to match confirmation component
    if (localStorageData) {
      const parsedData = JSON.parse(localStorageData);
      const userId = parsedData?.id;
      this.marriageForm.patchValue({ user_id: userId });

      // If file is selected, upload it first
      if (this.selectedFile) {
        this.uploadFile().then((fileUrl) => {
          this.marriageForm.patchValue({ file_url: fileUrl });
          this.submitForm();
        }).catch((error) => {
          console.error('Error uploading file:', error);
          this.errorMessage = 'Error uploading file. Please try again.';
        });
      } else {
        this.submitForm();
      }
    } else {
      this.errorMessage = 'User information not found. Please login again.';
    }
  }

  private submitForm(): void {
    this.marriageService.createMarriage(this.marriageForm.value).subscribe({
      next: (response) => {
        console.log('Marriage information added successfully:', response);
        this.successMessage = 'Marriage Information Added successfully! Redirecting to dashboard...';
        // localStorage.removeItem('addedUser');
        sessionStorage.removeItem('marriageFormData'); // Clear stored form data
        this.navigateToDashboard();
      },
      error: (error) => {
        console.error('Error adding marriage information:', error);
        this.errorMessage = 'Error adding marriage information. Please try again.';
      }
    });
  }

  private markAllFieldsAsTouched(): void {
    Object.keys(this.marriageForm.controls).forEach(key => {
      this.marriageForm.get(key)?.markAsTouched();
    });
  }

  navigateToDashboard() { // Function to navigate to the dashboard
    setTimeout(() => {
      this.router.navigate(['/dashboard']);
    }, 1500);
  }

  navigateToConfirmation() { // Function to navigate to the confirmation page
    // Save form data before navigating
    sessionStorage.setItem('marriageFormData', JSON.stringify(this.marriageForm.value));
    setTimeout(() => {
      this.router.navigate(['/confirmation']);
    }, 1000);
  }

  // File upload methods
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Please select a valid file type (JPEG, PNG, or PDF).';
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        this.errorMessage = 'File size must be less than 5MB.';
        return;
      }

      this.selectedFile = file;
      this.errorMessage = ''; // Clear any previous error messages
    }
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    // Reset the file input
    const fileInput = document.getElementById('file_upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getFileName(): string {
    return this.selectedFile ? this.selectedFile.name : '';
  }

  getFileSize(): string {
    if (!this.selectedFile) return '';
    const size = this.selectedFile.size;
    if (size < 1024) {
      return size + ' bytes';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(1) + ' KB';
    } else {
      return (size / (1024 * 1024)).toFixed(1) + ' MB';
    }
  }

  private uploadFile(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.selectedFile) {
        resolve('');
        return;
      }

      this.isUploading = true;
      this.uploadProgress = 0;

      const formData = new FormData();
      formData.append('file', this.selectedFile);

      // Simulate upload progress (replace with actual upload service)
      const uploadInterval = setInterval(() => {
        this.uploadProgress += 10;
        if (this.uploadProgress >= 100) {
          clearInterval(uploadInterval);
          this.isUploading = false;
          this.uploadProgress = 0;
          // Replace this with actual file upload service call
          resolve('https://example.com/uploaded-file-url'); // Mock URL
        }
      }, 200);

      // Uncomment and modify this when you have actual file upload service
      /*
      this.marriageService.uploadFile(formData).subscribe({
        next: (response) => {
          this.isUploading = false;
          resolve(response.fileUrl);
        },
        error: (error) => {
          this.isUploading = false;
          reject(error);
        }
      });
      */
    });
  }

  // Helper method to check if a field has errors and is touched
  hasFieldError(fieldName: string): boolean {
    const field = this.marriageForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  // Helper method to get field error message
  getFieldError(fieldName: string): string {
    const field = this.marriageForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required.`;
      }
      if (field.errors['pattern']) {
        return `${this.getFieldLabel(fieldName)} must be a valid number.`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'marriage_certificate_no': 'Marriage Certificate Number',
      'entry_no': 'Entry Number',
      'county': 'County',
      'subcounty': 'Sub County',
      'place_of_marriage': 'Place of Marriage',
      'marriage_date': 'Marriage Date',
      'first_name_groom': 'Groom First Name',
      'last_name_groom': 'Groom Last Name',
      'age_groom': 'Groom Age',
      'occupation_groom': 'Groom Occupation',
      'residence_groom': 'Groom Residence',
      'first_name_bride': 'Bride First Name',
      'last_name_bride': 'Bride Last Name',
      'age_bride': 'Bride Age',
      'occupation_bride': 'Bride Occupation',
      'residence_bride': 'Bride Residence',
      'first_name_witness1': 'First Witness First Name',
      'last_name_witness1': 'First Witness Last Name',
      'first_name_witness2': 'Second Witness First Name',
      'last_name_witness2': 'Second Witness Last Name',
      'registrar': 'Registrar',
      'ref_number': 'Reference Number'
    };
    return labels[fieldName] || fieldName;
  }
}