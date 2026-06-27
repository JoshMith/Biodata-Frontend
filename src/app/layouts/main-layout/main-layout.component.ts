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
  isSuperAdmin = false;
  isSuperViewer = false;
  isDeaneryViewer = false;
  isParishAdmin = false;
  isParishViewer = false;
  isSecretary = false;
  isMember = false;
  currentYear = new Date().getFullYear();
  isDownloadingLogs = false;


  constructor(
    private router: Router,
    private apiService: ApiService
  ) { }

  ngOnInit(): void {
    const raw = localStorage.getItem('userLoggedIn');

    if (!raw) {
      this.router.navigate(['/login']);
      return;
    }

    this.user = JSON.parse(raw);

    this.isSuperAdmin = this.user?.role === 'superadmin';
    this.isSuperViewer = this.user?.role === 'superviewer';
    this.isDeaneryViewer = this.user?.role === 'deaneryviewer';
    this.isParishAdmin = this.user?.role === 'parishadmin';
    this.isParishViewer = this.user?.role === 'parishviewer';
    this.isSecretary = this.user?.role === 'secretary';
    this.isMember = this.user?.role === 'member';
  }


  downloadAuditLogs(): void {
    this.isDownloadingLogs = true;
    this.apiService.downloadAuditLogs().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
        this.isDownloadingLogs = false;
      },
      error: () => { this.isDownloadingLogs = false; }
    });
  }

  navigate(route: string): void {
    this.router.navigate([route]);

  }
  goToDashboard(): void {
    const role = this.user?.role?.toLowerCase();

    switch (role) {
      case 'superadmin':
      case 'superviewer':
        this.router.navigate(['/dashboard']);
        break;
      case 'deaneryviewer':
        this.router.navigate(['/dashboard/deanery']);
        break;
      case 'parishadmin':
        this.router.navigate(['/dashboard/editor']);
        break;
      case 'parishviewer':
        this.router.navigate(['/dashboard/editor']);
        break;
      case 'secretary':
        this.router.navigate(['/dashboard/editor']);
        break;
      case 'member':
        this.router.navigate(['/dashboard/member']);
        break;

      default:
        console.error('Unknown role:', role);
        this.router.navigate(['/login']);
    }
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