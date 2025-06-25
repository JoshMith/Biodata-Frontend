import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, forkJoin, of, EMPTY } from 'rxjs';
import { takeUntil, catchError, switchMap, map } from 'rxjs/operators';

// Updated interfaces to match database schema
interface Christian {
  id: string; // Changed from 'id: number' to match database UUID
  email: string;
  password_hash: string;
  roles: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  middle_name: string;
  mother: string;
  father: string;
  siblings: string;
  birth_place: string;
  subcounty: string;
  birth_date: string;
  tribe: string;
  clan: string;
  residence: string;
  parish_id: string; // Changed from number to string (UUID)
  created_at: string;
}

interface SacramentData {
  baptism: any;
  eucharist: any;
  confirmation: any;
  marriage: any;
}

interface UserSession {
  role: string;
  parishId: string; // Changed from number to string (UUID)
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Search and display properties
  searchQuery = '';
  christians: Christian[] = [];
  selectedChristian: Christian | null = null;
  errorMessage = '';
  parishName = '';

  // Sacrament data
  selectedBaptism: any = null;
  selectedEucharist: any = null;
  selectedConfirmation: any = null;
  selectedMarriage: any = null;

  // UI state
  showBanner = false;
  bannerMessage = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    const userSession = this.getUserSession();

    // Debug: Log the userSession to see its structure
    console.log('UserSession from localStorage:', userSession);

    if (!userSession) {
      console.log('No userSession found');
      this.handleUnauthenticatedUser();
      return;
    }

    // Check if userSession has the expected structure
    if (!userSession.parishId && !userSession.roles) {
      console.log('UserSession does not have expected structure:', userSession);
      this.handleUnauthenticatedUser();
      return;
    }

    this.loadChristians(userSession);
  }

  private getUserSession(): any {
    try {
      const userData = localStorage.getItem('userLoggedIn');
      if (!userData) {
        console.log('No userLoggedIn data in localStorage');
        return null;
      }

      const parsedData = JSON.parse(userData);
      console.log('Parsed userData:', parsedData);
      return parsedData;
    } catch (error) {
      console.error('Error parsing userLoggedIn from localStorage:', error);
      return null;
    }
  }

  private handleUnauthenticatedUser(): void {
    setTimeout(() => {
      if (confirm('You are not logged in. Do you want to go to the login page?')) {
        this.router.navigate(['/login']);
      }
    }, 3000);
  }

  private loadChristians(userSession: any): void {
    // Handle different possible structures of userSession
    let roles: string;
    let parishId: string;

    if (userSession) {
      // Structure: { user: { role: '', parishId: '' } }
      roles = userSession.roles;
      parishId = userSession.parishId;
    } else if (userSession.roles) {
      // Structure: { role: '', parishId: '' } or { role: '', parish_id: '' }
      roles = userSession.roles;
      parishId = userSession.parishId || userSession.parish_id;
    } else {
      console.error('Cannot determine user role from session:', userSession);
      this.handleUnauthenticatedUser();
      return;
    }

    console.log('User role:', roles, 'Parish ID:', parishId);

    this.apiService.getChristians()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Christian[]) => {
          this.christians = this.filterChristiansByRole(data, roles, parishId);
          this.sortChristians();
          this.setBannerMessage(roles);
        },
        error: (error) => this.handleLoadError(error)
      });
  }

  private filterChristiansByRole(
    christians: Christian[],
    role: string,
    parishId: string
  ): Christian[] {
    console.log('Filtering Christians by role:', role, 'Parish ID:', parishId);

    if (!role) {
      console.warn('No role provided for filtering');
      return [];
    }

    switch (role.toLowerCase()) {
      case 'viewer':
      case 'superuser':
        return christians;
      case 'editor':
        if (!parishId) {
          console.warn('No parish ID provided for editor role');
          return christians; // Show all if no parish restriction
        }
        return christians.filter(c => c.parish_id === parishId);
      case 'member':
      default:
        return [];
    }
  }

  private setBannerMessage(role: string): void {
    this.showBanner = true;
    const messages = {
      superuser: 'You are logged in as SUPERUSER. You have full access to view and manage all Christians in the system.',
      editor: 'You are logged in as PRIEST. You can view and manage Christians from your own parish only.',
      viewer: 'You are logged in as VIEWER. You can only view Christians in the system.',
      member: 'You are logged in as MEMBER. You can only view your own personal information and not other Christians in the system.'
    };

    this.bannerMessage = messages[role as keyof typeof messages] || '';
  }

  private handleLoadError(error: any): void {
    console.error('Error loading Christians:', error);
    this.errorMessage = error.error?.message || 'Something went wrong while fetching Christians. Try again.';
    this.showBanner = true;
    this.bannerMessage = 'You are not logged in. Go to login page.';

    setTimeout(() => {
      if (confirm('You are not logged in. Do you want to go to the login page?')) {
        this.router.navigate(['/login']);
      }
    }, 3000);
  }

  private sortChristians(): void {
    this.christians.sort((a, b) => {
      const nameA = `${a.first_name} ${a.last_name}`.trim();
      const nameB = `${b.first_name} ${b.last_name}`.trim();
      return nameA.localeCompare(nameB);
    });
  }

  // Public methods
  displayChristians(): void {
    this.apiService.getChristians()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.christians = data;
          this.sortChristians();
        },
        error: (error) => console.error('Error displaying Christians:', error)
      });
  }

  searchChristianById(id: string): void {
    this.apiService.getChristianById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.christians = [data];
        },
        error: (error) => console.error('Error searching Christian by ID:', error)
      });
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.displayChristians();
  }

  selectChristian(christian: Christian): void {
    this.scrollToTop();
    this.clearErrorMessage();

    if (!christian) {
      this.handleChristianNotFound();
      return;
    }

    this.selectedChristian = christian;
    this.storeSelectedChristian(christian);

    this.loadParishName(christian.parish_id);
    this.loadSacramentData(christian.id);
  }

  searchChristianByName(): void {
    if (!this.searchQuery.trim()) {
      return;
    }

    this.apiService.getChristians()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (christians: Christian[]) => {
          const found = this.findChristianByName(christians);

          if (found) {
            this.selectChristian(found);
          } else {
            this.handleChristianNotFound();
          }
        },
        error: (error) => this.handleLoadError(error)
      });
  }

  private findChristianByName(christians: Christian[]): Christian | undefined {
    return christians.find(christian => {
      const fullName = `${christian.first_name} ${christian.last_name}`.trim();
      return fullName.toLowerCase().includes(this.searchQuery.toLowerCase().trim());
    });
  }

  deleteChristian(): void {
    const selectedChristianData = this.getStoredSelectedChristian();

    if (!selectedChristianData) {
      console.error('No Christian selected for deletion.');
      return;
    }

    if (confirm(`Are you sure you want to delete ${selectedChristianData.name}?`)) {
      this.apiService.deleteChristian(selectedChristianData.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.christians = this.christians.filter(c => c.id !== selectedChristianData.id);
            console.log(`Deleted Christian: ${selectedChristianData.name}`);
            this.clearSelectedChristian();
          },
          error: (error) => {
            console.error('Error deleting Christian:', error);
            this.errorMessage = 'Error deleting Christian.';
          }
        });
    }
  }

  redirectToUpdateChristian(): void {
    const selectedChristianData = this.getStoredSelectedChristian();

    if (selectedChristianData) {
      setTimeout(() => {
        this.router.navigate(['/edit-personal-info'], {
          queryParams: { id: selectedChristianData.id }
        });
      }, 1000);
    } else {
      console.error('No Christian selected for redirection.');
    }
  }

  // Helper methods
  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private clearErrorMessage(): void {
    this.errorMessage = '';
  }

  private handleChristianNotFound(): void {
    this.selectedChristian = null;
    this.errorMessage = 'Christian not found.';
    console.error('Christian not found');
    this.sortChristians();
  }

  private storeSelectedChristian(christian: Christian): void {
    const christianData = {
      id: christian.id, // Map user_id to id for compatibility
      email: christian.email,
      role: christian.roles,
      name: `${christian.first_name} ${christian.last_name}`.trim(),
      parishId: christian.parish_id
    };
    localStorage.setItem('selectedChristian', JSON.stringify(christianData));
  }

  private getStoredSelectedChristian(): any {
    const data = localStorage.getItem('selectedChristian');
    return data ? JSON.parse(data) : null;
  }

  private clearSelectedChristian(): void {
    localStorage.removeItem('selectedChristian');
    this.selectedChristian = null;
    this.clearErrorMessage();
  }

  private loadParishName(parishId: string): void {
    if (!parishId) {
      this.parishName = '';
      return;
    }

    this.apiService.getParishById(parishId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (parishData: any) => {
          this.parishName = parishData?.parish_name || '';
        },
        error: (error) => {
          console.error('Error fetching parish name:', error);
          this.parishName = '';
        }
      });
  }

  private loadSacramentData(christianId: string): void {
    // Use forkJoin to load all sacrament data simultaneously
    const sacramentRequests = {
      baptisms: this.apiService.getBaptisms(),
      eucharists: this.apiService.getEucharists(),
      confirmations: this.apiService.getConfirmations(),
      marriages: this.apiService.getMarriages()
    };

    forkJoin(sacramentRequests)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(({ baptisms, eucharists, confirmations, marriages }) => {
          // Find matching sacraments for the Christian
          const baptism = baptisms.find((b: any) => b.user_id === christianId);
          const eucharist = eucharists.find((e: any) => e.user_id === christianId);
          const confirmation = confirmations.find((c: any) => c.user_id === christianId);
          const marriage = marriages.find((m: any) => m.user_id === christianId);

          // Create requests for detailed sacrament data
          const detailRequests = {
            baptism: baptism ? this.apiService.getBaptismById(baptism.baptism_id.toString()) : of(null),
            eucharist: eucharist ? this.apiService.getEucharistById(eucharist.eucharist_id.toString()) : of(null),
            confirmation: confirmation ? this.apiService.getConfirmationById(confirmation.confirmation_id.toString()) : of(null),
            marriage: marriage ? this.apiService.getMarriageById(marriage.marriage_id.toString()) : of(null)
          };

          return forkJoin(detailRequests);
        }),
        catchError((error) => {
          console.error('Error loading sacrament data:', error);
          return of({ baptism: null, eucharist: null, confirmation: null, marriage: null });
        })
      )
      .subscribe((sacramentData: SacramentData) => {
        this.selectedBaptism = sacramentData.baptism;
        this.selectedEucharist = sacramentData.eucharist;
        this.selectedConfirmation = sacramentData.confirmation;
        this.selectedMarriage = sacramentData.marriage;
        this.sortChristians();
      });
  }
}