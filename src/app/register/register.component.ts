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
    password: ['', [Validators.required, Validators.minLength(4)]],
    role: ['', [Validators.required, Validators.pattern(/^(superuser|editor|viewer)$/)]],
    phone_number: [''],
    parish_id: [0]
  })


  ngOnInit(): void {
    // Initialize any data if needed
  }

  parishes: any[] = [];

  ngAfterViewInit(): void {
    this.fetchParishes();
  }

  fetchParishes(): void {
    this.register.getParishes().subscribe({
      next: (data) => {
        this.parishes = data;
        console.log('Parishes loaded:', this.parishes);
      },
      error: (err) => {
        this.errorMessage = 'Failed to load parishes.';
      }
    });
  }

  onSubmitForm(): void {
    this.registerMessage = 'Registering...';
    this.errorMessage = '';
    this.register.registerChristian(this.form.value).subscribe(
      (response) => {
        console.log('Registration successful:', response);
        // console.log(this.form);
        // Store the token in local storage or session storage
        // localStorage.setItem('token', response.token); // Adjust according to your API response
        
        this.registerMessage = '';
        this.errorMessage = '';
        this.successMessage = 'Registration successful! Redirecting to login...';
        // Set loading state to true
        // this.isLoading = true;
        this.navigateToLogin();
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