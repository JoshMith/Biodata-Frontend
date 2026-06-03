import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './member-dashboard.component.html',
  styleUrl: './member-dashboard.component.css'
})
export class MemberDashboardComponent implements OnInit {
  user: any = null;
  parishName = '';
  deaneryName = '';
  isLoading = true;
  currentYear = new Date().getFullYear();

  constructor(private router: Router, private apiService: ApiService) { }

  ngOnInit(): void {
    const raw = localStorage.getItem('userLoggedIn');
    if (!raw) { this.router.navigate(['/login']); return; }
    this.user = JSON.parse(raw);

    if (this.user.parishId) {
      this.apiService.getParishById(this.user.parishId).subscribe({
        next: (p) => {
          this.parishName = p.parish_name;
          this.deaneryName = p.deanery;
          this.isLoading = false;
        },
        error: () => { this.isLoading = false; }
      });
    } else {
      this.isLoading = false;
    }
  }

  viewMyDetails(): void {
    this.router.navigate(['/search']);
  }

  logout(): void {
    const email = this.user?.email;
    if (email) {
      this.apiService.logoutChristian(email).subscribe({
        next: () => {
          localStorage.removeItem('userLoggedIn');
          this.router.navigate(['/login']);
        },
        error: () => {
          localStorage.removeItem('userLoggedIn');
          this.router.navigate(['/login']);
        }
      });
    }
  }
}