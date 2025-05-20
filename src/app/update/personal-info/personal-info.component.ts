import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-personal-info',
  imports: [ReactiveFormsModule, CommonModule],
  standalone: true, // Indicates that this component is a standalone component
  templateUrl: './personal-info.component.html',
  styleUrl: './personal-info.component.css'
})
export class PersonalInfoUpdateComponent implements OnInit {

  constructor(
    private personalInfo: ApiService, // Inject the ApiService for API calls
    private router: Router, // Inject the Router for navigation
    private getUser: ApiService // Inject the ApiService for user-related API calls
  ) { } // Constructor for the component

  private fb = inject(FormBuilder) // Inject FormBuilder for form creation

  christianForm = this.fb.group({ // Create a form group for the personal information form
    name: [''],
    email: [''],
    password: [''],
    role: [''],
    deanery: [''],
    parish: [''],
    parish_id: [''], // This will be set based on the selected parish
    father: [''],
    mother: [''],
    tribe: [''],
    clan: [''],
    birth_place: [''],
    birth_date: [''],
    sub_county: [''],
    residence: [''],
  })


  errorMessage = '';
  successMessage = '';
  userId: any // Variable to store the user ID
  localStorageData: string | null = null; // Variable to store local storage data



  deaneries: string[] = [
    'Nyeri Municipality Deanery',
    'Mukurwe-ini Deanery',
    'Othaya Deanery',
    'Nanyuki Deanery',
    'Narumoru Deanery',
    'Karatina Deanery',
    'Tetu Deanery',
    'Gatarakwa Deanery'
  ];

  parishes: { parish_id: number, parish_name: string, deanery: string }[] = [
    { parish_id: 1, parish_name: 'Cathedral Parish (Our Lady of Consolata Cathedral)', deanery: 'Nyeri Municipality Deanery' },
    { parish_id: 2, parish_name: 'St. Jude Parish', deanery: 'Nyeri Municipality Deanery' },
    { parish_id: 3, parish_name: "King'ong'o Parish", deanery: 'Nyeri Municipality Deanery' },
    { parish_id: 4, parish_name: 'Mwenji Parish', deanery: 'Nyeri Municipality Deanery' },
    { parish_id: 5, parish_name: 'Kiamuiru Parish', deanery: 'Nyeri Municipality Deanery' },
    { parish_id: 6, parish_name: 'Mathari Institutions Chaplaincy', deanery: 'Nyeri Municipality Deanery' },
    { parish_id: 7, parish_name: 'St. Charles Lwanga Parish', deanery: 'Nyeri Municipality Deanery' },
    { parish_id: 8, parish_name: 'Mukurwe-ini Parish', deanery: 'Mukurwe-ini Deanery' },
    { parish_id: 9, parish_name: 'Kaheti Parish', deanery: 'Mukurwe-ini Deanery' },
    { parish_id: 10, parish_name: 'Kimondo Parish', deanery: 'Mukurwe-ini Deanery' },
    { parish_id: 11, parish_name: 'Gikondi Parish', deanery: 'Mukurwe-ini Deanery' },
    { parish_id: 12, parish_name: 'Othaya Parish', deanery: 'Othaya Deanery' },
    { parish_id: 13, parish_name: 'Kariko Parish', deanery: 'Othaya Deanery' },
    { parish_id: 14, parish_name: 'Birithia Parish', deanery: 'Othaya Deanery' },
    { parish_id: 15, parish_name: 'Karima Parish', deanery: 'Othaya Deanery' },
    { parish_id: 16, parish_name: 'Kagicha Parish', deanery: 'Othaya Deanery' },
    { parish_id: 17, parish_name: 'Karuthi Parish', deanery: 'Othaya Deanery' },
    { parish_id: 18, parish_name: 'Kigumo Parish', deanery: 'Othaya Deanery' },
    { parish_id: 19, parish_name: 'Nanyuki Parish', deanery: 'Nanyuki Deanery' },
    { parish_id: 20, parish_name: 'Dol Dol Parish', deanery: 'Nanyuki Deanery' },
    { parish_id: 21, parish_name: 'Matanya Parish', deanery: 'Nanyuki Deanery' },
    { parish_id: 22, parish_name: 'St. Teresa Parish', deanery: 'Nanyuki Deanery' },
    { parish_id: 23, parish_name: 'Kalalu Parish', deanery: 'Nanyuki Deanery' },
    { parish_id: 24, parish_name: 'Narumoru Town Parish', deanery: 'Narumoru Deanery' },
    { parish_id: 25, parish_name: 'Irigithathi Parish', deanery: 'Narumoru Deanery' },
    { parish_id: 26, parish_name: 'Thegu Parish', deanery: 'Narumoru Deanery' },
    { parish_id: 27, parish_name: 'Archangel Michael Chaka Parish', deanery: 'Narumoru Deanery' },
    { parish_id: 28, parish_name: 'Munyu Parish', deanery: 'Narumoru Deanery' },
    { parish_id: 29, parish_name: 'Karatina Parish', deanery: 'Karatina Deanery' },
    { parish_id: 30, parish_name: 'Miiri Parish', deanery: 'Karatina Deanery' },
    { parish_id: 31, parish_name: 'Giakaibei Parish', deanery: 'Karatina Deanery' },
    { parish_id: 32, parish_name: 'Gikumbo Parish', deanery: 'Karatina Deanery' },
    { parish_id: 33, parish_name: 'Gathugu Parish', deanery: 'Karatina Deanery' },
    { parish_id: 34, parish_name: 'Ngandu Parish', deanery: 'Karatina Deanery' },
    { parish_id: 35, parish_name: 'Kabiru-ini Parish', deanery: 'Karatina Deanery' },
    { parish_id: 36, parish_name: 'Kahira-ini Parish', deanery: 'Karatina Deanery' },
    { parish_id: 37, parish_name: 'Tetu Parish', deanery: 'Tetu Deanery' },
    { parish_id: 38, parish_name: 'Wamagana Parish', deanery: 'Tetu Deanery' },
    { parish_id: 39, parish_name: 'Kigogo-ini Parish', deanery: 'Tetu Deanery' },
    { parish_id: 40, parish_name: 'Itheguri Parish', deanery: 'Tetu Deanery' },
    { parish_id: 41, parish_name: 'Gititu Parish', deanery: 'Tetu Deanery' },
    { parish_id: 42, parish_name: 'Kangaita Parish', deanery: 'Tetu Deanery' },
    { parish_id: 43, parish_name: 'Giakanja Parish', deanery: 'Tetu Deanery' },
    { parish_id: 44, parish_name: 'Karangia Parish', deanery: 'Tetu Deanery' },
    { parish_id: 45, parish_name: 'Mweiga Parish', deanery: 'Gatarakwa Deanery' },
    { parish_id: 46, parish_name: 'Endarasha Parish', deanery: 'Gatarakwa Deanery' },
    { parish_id: 47, parish_name: 'Gatarakwa Parish', deanery: 'Gatarakwa Deanery' },
    { parish_id: 48, parish_name: 'Karemeno Parish', deanery: 'Gatarakwa Deanery' },
    { parish_id: 49, parish_name: 'Mugunda Parish', deanery: 'Gatarakwa Deanery' },
    { parish_id: 50, parish_name: 'Sirima Parish', deanery: 'Gatarakwa Deanery' },
    { parish_id: 51, parish_name: 'Winyumiririe Parish', deanery: 'Gatarakwa Deanery' },
    { parish_id: 52, parish_name: 'Kamariki Parish', deanery: 'Gatarakwa Deanery' }
  ];

  
  getParishIdByName(parishName: string): number | null {
    if (!parishName) {
      return null;
    }

    const trimmedName = parishName.trim();
    const parish = this.parishes.find(
      p => p.parish_name === trimmedName
    );

    // console.log('Looking for parish:', trimmedName);
    // console.log('Found parish:', parish);

    return parish?.parish_id || null;
  }

  // Keep this method for reactive form updates
  setParishIdByName(parishName: string): void {
    const parishId = this.getParishIdByName(parishName);
    this.christianForm.patchValue({ parish_id: parishId !== null ? String(parishId) : null });
  }

  filteredParishes: string[] = [];


  ngOnInit(): void { // Lifecycle hook that is called after the component has been initialized

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

    this.localStorageData = localStorage.getItem('selectedChristian'); // Get the user ID from local storage
    if (this.localStorageData) {
      const parsedData = JSON.parse(this.localStorageData);
      this.userId = parsedData?.id;


      // Populate the form fields with the data from localStorage
      this.christianForm.patchValue({
        name: parsedData?.name,
        email: parsedData?.email,
        role: parsedData?.role,
        deanery: parsedData?.deanery,
        parish: this.parishes.find(p => p.parish_id === parsedData?.parishId)?.parish_name || '',
      });
    }

    // Check if form data exists in session storage
    const storedFormData = sessionStorage.getItem('christianFormData');
    if (storedFormData) {
      const formData = JSON.parse(storedFormData);
      this.christianForm.patchValue(formData);
    }
  }

    ngAfterViewInit(): void {
    this.christianForm.get('deanery')?.valueChanges.subscribe((selectedDeanery: string | null) => {
      this.filteredParishes = this.parishes
        .filter(p => p.deanery === selectedDeanery)
        .map(p => p.parish_name);
      // Optionally reset parish selection if deanery changes
      this.christianForm.get('parish')?.setValue('');
    });
    
    // Add parish selection tracking to automatically set parish_id
    this.christianForm.get('parish')?.valueChanges.subscribe((selectedParish: string | null) => {
      if (selectedParish) {
        this.setParishIdByName(selectedParish);
      }
    });
  }


  onSubmitChristianForm(): void {
    if (this.christianForm.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      console.log('Please fill in all required fields.');
      
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.christianForm.controls).forEach(key => {
        const control = this.christianForm.get(key);
        control?.markAsTouched();
      });
      
      return;
    }

    // Get parish name from form and ensure parish_id is correctly set
    const formValue = this.christianForm.value;
    const parishName = formValue.parish ?? '';
    
    // Get the parish ID directly and make sure it's included in the form data
    const parishId = this.getParishIdByName(parishName);
    this.christianForm.patchValue({ parish_id: parishId !== null ? String(parishId) : null });
    
    // Get the updated form value after setting the parish_id
    const updatedFormValue = this.christianForm.value;
    // console.log('Form value before submission:', updatedFormValue);


    this.localStorageData = localStorage.getItem('selectedChristian'); // Get the user ID from local storage
    if (this.localStorageData) {
      const parsedData = JSON.parse(this.localStorageData);
      const userId = parsedData?.id;
      this.personalInfo.updateChristian(userId, updatedFormValue).subscribe(
        (response) => {
          this.getUser.getChristians().subscribe(
            (data) => {
              console.log('Fetched data:', data); // Log the fetched data

              this.userId = data?.reduce((max: any, user: any) => user.id > max ? user.id : max, 0); // Get the greatest id from the data
              const user = data?.find((user: any) => user.id === this.userId);

              console.log('Fetched userId:', this.userId); // Log the fetched userId
              this.successMessage = 'Personal Information Added successfully! Redirecting to next page...'; // Set success message
              this.navigateToBaptism(); // Navigate to the login page after a delay
            }
          );
          console.log('Christian Updated successfully:', response); // Log the successful registration response
          console.log(this.christianForm); // Log the form data
        },
        // Handle the error response from the API
        (error: any) => {
          console.error(`Error Updating this ${parsedData?.name}:`, error); // Log the error response
          this.errorMessage = error.error.message; // Set the error message
        }
      )
    }


  }

  navigateToBaptism() {
    setTimeout(() => {
      this.router.navigate(['/edit-baptism']); // Navigate to the baptism page
    }
      , 1500);
  } // End of navigateToBaptism method

  navigateToDashboard() {
    setTimeout(() => {
      this.router.navigate(['/dashboard']); // Navigate to the dashboard page
    }, 1000); // Delay of 2 seconds before navigation
  } // End of navigateToDashboard method

}
