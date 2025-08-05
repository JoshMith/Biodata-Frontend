import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  errorMessage = '';
  successMessage = '';
  registerMessage = '';
  isLoading: boolean = false;

  constructor(private register: ApiService, private router: Router) { }

  private fb = inject(FormBuilder)
  form = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    middle_name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    phone_number: [''],
    deanery: [''],
    parish_id: [0]
  })


  ngOnInit(): void {
    // Initialize any data if needed
    setTimeout(() => {
      this.loadDeaneries();
      this.loadParishesByDeanery();
    }, 3000);
  }


  parishes: any[] = [];
  deaneries: any[] = [];

  ngAfterViewInit(): void {
    // One can only register as a member
    // this.form.get('role')?.markAsTouched();
    // this.form.get('role')?.disable();
    // this.form.get('role')?.setValue('member');
  }



  private loadDeaneries(): void {
    this.register.getParishes().subscribe({
      next: (data) => {
        // Remove duplicate deaneries by name
        const seen = new Set<string>();
        this.deaneries = data.filter((item: any) => {
          if (seen.has(item.deanery)) {
            return false;
          }
          seen.add(item.deanery);
          return true;
        });
        // console.log("Deaneries loaded:", this.deaneries)
      },
      error: (error) => {
        console.error('Error loading deaneries:', error);
        this.errorMessage = 'Failed to load deaneries. Please check connection.';
      }
    });
  }

  // Load parishes for selected deanery
  private loadParishesByDeanery(): void {
    this.form.valueChanges.subscribe(values => {
      // console.log('Current form values:', values);
      const deanery = values.deanery;
      if (deanery) {
        // console.log("Deanery found")
        this.register.getParishByDeanery(deanery).subscribe({
          next: (parishes) => {
            this.parishes = parishes;
          },
          error: (error) => {
            console.error('Error loading parishes:', error);
            this.errorMessage = 'Failed to load parishes for the selected deanery. Please try again.';
          }

        });
      } else {
        // console.error("Deanery not found")
        this.parishes = [];
        // this.form.get('parish_id')?.setValue(0);
      }
    });
    // Continue with the next code
  }




  onSubmitForm(): void {
    if (this.form.invalid) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }
    this.registerMessage = 'Registering...';
    this.errorMessage = '';
    this.register.registerChristian(this.form.value).subscribe(
      (response) => {
        // console.log('Registration successful:', response);
        // console.log(this.form);

        this.registerMessage = '';
        this.errorMessage = '';
        this.successMessage = 'Registration successful! Redirecting...';
        // Set loading state to true
        // this.isLoading = true;

        localStorage.setItem('userLoggedIn', JSON.stringify(response.user));

        if (!response.user.verified) {
          this.successMessage = 'Registration successful! Please verify your email before proceeding to the dashboard.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2500);
          return;
        }

        // Navigate to login page after successful registration
        console.log('Registration successful:', response.user.email);
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2500);


        // this.navigateToLogin();

      },

      (error: any) => {
        this.registerMessage = '';
        this.successMessage = '';
        this.errorMessage = '';
        console.error('Registration failed:', error);
        this.errorMessage = error.error.message || "Registration Failed!";
      }
    );


  }
  navigateToLogin(): void {
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1500);
  }

}