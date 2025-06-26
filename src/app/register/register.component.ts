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
    roles: ['', [Validators.required, Validators.pattern(/^(superuser|editor|viewer|member)$/)]],
    phone_number: [''],
    deanery: [''],
    parish_id: [0]
  })


  ngOnInit(): void {
    // Initialize any data if needed
    this.loadDeaneries();
    this.loadParishesByDeanery();
  }

  parishes: any[] = [];
  deaneries: any[] = [];

  ngAfterViewInit(): void {

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
        this.errorMessage = 'Failed to load deaneries. Please refresh the page.';
      }
    });
  }

  // Load parishes for selected deanery
  private loadParishesByDeanery(): void {
    this.form.valueChanges.subscribe(values => {
      // console.log('Current form values:', values.deanery);
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
        console.error("Deanery not found")
        this.parishes = [];
        this.form.get('parish_id')?.setValue(0);
      }
    });
  }




  onSubmitForm(): void {
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
        console.log('Registration and Login successful:', response.user.email);
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1500);


        // this.navigateToLogin();

      },

      (error: any) => {
        console.error('Registration failed:', error);
        this.errorMessage = error.error.message;
      }
    );


  }
  navigateToLogin(): void {
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 1500);
  }

}