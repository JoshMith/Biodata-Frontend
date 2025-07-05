import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../services/api.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
  imports: [CommonModule, FormsModule, RouterLink],
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
  selectedMarriage: any = [];

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
      // console.log('Parsed userData:', parsedData);
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
    // console.log('Filtering Christians by role:', role, 'Parish ID:', parishId);

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
      editor: 'You are logged in as EDITOR. You can view and manage Christians from your own parish only.',
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
    this.christians.sort((a: Christian, b: Christian) => {
      const nameA = `${a.first_name} ${a.last_name} ${a.middle_name}`.trim();
      const nameB = `${b.first_name} ${b.last_name} ${b.middle_name}`.trim();
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
    this.errorMessage = '';
    this.displayChristians();
    this.selectedChristian = null;
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
      this.displayChristians(); // Show all when search is empty
      return;
    }

    const query = this.searchQuery.toLowerCase().trim();

    this.apiService.getChristians().pipe(takeUntil(this.destroy$)).subscribe({
      next: (christians: Christian[]) => {
        const found = christians.filter(c =>
          `${c.first_name} ${c.last_name} ${c.middle_name} ${c.phone_number} ${c.email}`
            .toLowerCase()
            .includes(query)
        );

        if (found.length > 0) {
          this.christians = found;
          this.sortChristians();
          this.selectedChristian = null; // Clear selection
          this.errorMessage = ''
        } else {
          this.errorMessage = 'No matching Christians found';
          this.christians = []; // Clear list
        }
      },
      error: (error) => this.handleLoadError(error)
    });
  }

  // private findChristianByName(christians: Christian[]): Christian | undefined {
  //   return christians.find(christian => {
  //     const searchText = `${christian.first_name} ${christian.last_name} ${christian.middle_name} ${christian.phone_number} ${christian.email}`.trim();
  //     return searchText.toLowerCase().includes(this.searchQuery.toLowerCase().trim());
  //   });
  // }



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
            this.errorMessage = error.error.message;
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
            marriage: marriage ? this.apiService.getFullMarriageByUserId(christianId) : of(null)
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

        // Handle marriage data - get first marriage if array exists
        if (Array.isArray(sacramentData.marriage)) {
          this.selectedMarriage = sacramentData.marriage.length > 0
            ? sacramentData.marriage[0]
            : null;
        } else {
          this.selectedMarriage = sacramentData.marriage;
        }
      

        console.log('Loaded sacrament data:', {
          baptism: this.selectedBaptism,
          eucharist: this.selectedEucharist,
          confirmation: this.selectedConfirmation,
          marriage: this.selectedMarriage
        });
        this.sortChristians();
      });
  }

  getDocumentUrl(filePath: string): string {
    return this.apiService.getDocumentUrl(filePath);
  }

}