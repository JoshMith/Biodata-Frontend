import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './superadmin-dashboard.component.html',
  styleUrl: './superadmin-dashboard.component.css'
})
export class SuperadminDashboardComponent implements OnInit {
  user: any = null;
  isLoading = true;
  isSuperAdmin = false;

  stats = { christians: 0, baptised: 0, eucharist: 0, confirmed: 0, married: 0 };

  parishes: { name: string; deanery: string; count: number }[] = [];
  deaneryStats: { name: string; count: number }[] = [];

  constructor(private router: Router, private apiService: ApiService) { }

  ngOnInit(): void {
    const raw = localStorage.getItem('userLoggedIn');
    if (!raw) { this.router.navigate(['/login']); return; }
    this.user = JSON.parse(raw);
    this.isSuperAdmin = this.user?.role === 'superadmin';

    forkJoin({
      users: this.apiService.getChristians().pipe(catchError(() => of([]))),
      baptisms: this.apiService.getBaptisms().pipe(catchError(() => of([]))),
      eucharists: this.apiService.getEucharists().pipe(catchError(() => of([]))),
      confirmations: this.apiService.getConfirmations().pipe(catchError(() => of([]))),
      marriages: this.apiService.getMarriages().pipe(catchError(() => of([]))),
      parishes: this.apiService.getParishes().pipe(catchError(() => of([])))
    }).subscribe(({ users, baptisms, eucharists, confirmations, marriages, parishes }) => {
      const u = users as any[];
      const p = parishes as any[];

      this.stats.christians = u.length;
      this.stats.baptised = (baptisms as any[]).length;
      this.stats.eucharist = (eucharists as any[]).length;
      this.stats.confirmed = (confirmations as any[]).length;
      this.stats.married = (marriages as any[]).length;

      // Parish breakdown
      this.parishes = p.map(par => ({
        name: par.parish_name,
        deanery: par.deanery,
        count: u.filter((usr: any) => usr.parish_id === par.parish_id).length
      })).sort((a, b) => b.count - a.count);

      // Deanery rollup
      const deaneryMap = new Map<string, number>();
      u.forEach((usr: any) => {
        const par = p.find((x: any) => x.parish_id === usr.parish_id);
        if (par?.deanery) {
          deaneryMap.set(par.deanery, (deaneryMap.get(par.deanery) || 0) + 1);
        }
      });
      this.deaneryStats = Array.from(deaneryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      this.isLoading = false;
    });
  }

  get currentYear(): number { return new Date().getFullYear(); }
  get maxParishCount(): number { return Math.max(...this.parishes.map(p => p.count), 1); }
  get maxDeaneryCount(): number { return Math.max(...this.deaneryStats.map(d => d.count), 1); }

  navigate(path: string): void { this.router.navigate([path]); }

  logout(): void {
    this.apiService.logoutChristian(this.user?.email).subscribe({
      next: () => { localStorage.removeItem('userLoggedIn'); this.router.navigate(['/login']); },
      error: () => { localStorage.removeItem('userLoggedIn'); this.router.navigate(['/login']); }
    });
  }
}