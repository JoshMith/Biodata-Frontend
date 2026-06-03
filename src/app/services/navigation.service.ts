import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class NavigationService {

  constructor(private router: Router) {}

  /**
   * Returns the correct dashboard path for the currently logged-in user.
   * Falls back to /login if there is no session.
   */
  getDashboardPath(): string {
    const raw = localStorage.getItem('userLoggedIn');
    if (!raw) return '/login';

    try {
      const role = JSON.parse(raw).role ?? '';
      switch (role) {
        case 'superuser':
        case 'viewer':
          return '/dashboard';
        case 'editor':
          return '/dashboard/editor';
        case 'member':
          return '/dashboard/member';
        default:
          return '/login';
      }
    } catch {
      return '/login';
    }
  }

  /** Navigates to the correct dashboard for the current user. */
  goToDashboard(): void {
    this.router.navigate([this.getDashboardPath()]);
  }
}