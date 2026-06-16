import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.css'
})
export class MainLayoutComponent implements OnInit {

  user: any = null;
  isSuperuser = false;
  currentYear = new Date().getFullYear();

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    const raw = localStorage.getItem('userLoggedIn');

    if (!raw) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = JSON.parse(raw);

    this.isSuperuser = this.user?.role === 'superuser';
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  logout(): void {
    this.apiService.logoutChristian(this.user?.email).subscribe({
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