# Christian Biodata Management System (CBMS) - Frontend Documentation

## 📋 Project Overview

The CBMS Frontend is a comprehensive Angular web application designed for the Archdiocese of Nyeri to manage Christian biographical data and sacramental records. Built with Angular 19, it provides an intuitive interface for user registration, authentication, role-based access control, and complete CRUD operations for managing sacramental records.

## 🏗️ Architecture

### Technology Stack

**Frontend Framework:**
- **Framework:** Angular 19.2.0
- **Language:** TypeScript 5.7.2
- **Styling:** Pure CSS (no CSS frameworks)
- **State Management:** Local Storage & Session Storage
- **HTTP Client:** Angular HttpClient with RxJS 7.8.0
- **Routing:** Angular Router 19.2.0
- **Forms:** Angular Reactive Forms

**Key Dependencies:**
```json
{
  "@angular/common": "^19.2.0",
  "@angular/compiler": "^19.2.0",
  "@angular/core": "^19.2.0",
  "@angular/forms": "^19.2.0",
  "@angular/platform-browser": "^19.2.0",
  "@angular/router": "^19.2.0",
  "rxjs": "~7.8.0",
  "zone.js": "~0.15.0"
}
```

## 📁 Project Structure

```
Biodata-Frontend/
├── src/
│   ├── app/
│   │   ├── auth/                          # Authentication components
│   │   │   ├── forgot-password/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── reset-password/
│   │   │   └── verify-email/
│   │   ├── dashboard/                     # Main dashboard
│   │   ├── form/                          # Data entry forms
│   │   │   ├── baptism/
│   │   │   ├── confirmation/
│   │   │   ├── eucharist/
│   │   │   ├── marriage/
│   │   │   ├── personal-info/
│   │   │   └── progress-bar.ts            # Shared progress indicator
│   │   ├── update/                        # Edit forms
│   │   │   ├── baptism/
│   │   │   ├── confirmation/
│   │   │   ├── eucharist/
│   │   │   ├── marriage/
│   │   │   └── personal-info/
│   │   ├── search/                        # Search & view Christians
│   │   ├── marriage-card/                 # Marriage certificate print view
│   │   ├── sacrament-card/               # Sacrament card print view
│   │   ├── services/
│   │   │   └── api.service.ts            # Backend API integration
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── index.html
│   ├── main.ts
│   └── styles.css
├── public/
│   ├── golden-cross2.jpg
│   └── sunset-sky.jpg
├── angular.json
├── package.json
├── tsconfig.json
├── PRODUCTION.MD                          # Deployment guide
└── README.md
```

## 🔐 Authentication & Authorization

### Authentication Flow

#### 1. Registration (`/register`)
- **Component:** `RegisterComponent`
- **Features:**
  - User registration with email and password
  - Parish and deanery selection
  - Role assignment (default: member)
  - Email verification system
  - Form validation with visual feedback

**Form Fields:**
```typescript
{
  first_name: string (required),
  last_name: string (required),
  middle_name: string (optional),
  email: string (required, email format),
  password: string (required, min 8 characters),
  phone_number: string (optional),
  deanery: string (required),
  parish_id: number (required)
}
```

#### 2. Login (`/login`)
- **Component:** `LoginComponent`
- **Features:**
  - Email and password authentication
  - Credential validation
  - Session management
  - Automatic redirection based on role
  - "Remember me" functionality (24 hours session)

**Login Response:**
```typescript
interface LoginResponse {
  user: {
    id: string,
    email: string,
    role: string,
    first_name: string,
    last_name: string,
    parish_id: string
  }
}
```

#### 3. Email Verification (`/verifyEmail`)
- **Component:** `VerifyEmailComponent`
- **Features:**
  - Token-based email verification
  - Automatic verification on page load
  - Success/failure feedback
  - Auto-redirect to dashboard or login

#### 4. Password Reset
- **Forgot Password Component:** Request reset link
- **Reset Password Component:** Set new password with token validation
- **Features:**
  - Email-based reset link
  - Token expiration (15 minutes)
  - Password confirmation validation
  - Auto-redirect to login on success

### Role-Based Access Control

**User Roles:**

| Role | Access Level | Permissions |
|------|--------------|-------------|
| **Superuser** | Full System Access | • View all Christians<br>• Add/Edit/Delete any record<br>• Manage users<br>• Manage parishes<br>• Access all features |
| **Editor** | Parish-Level Access | • View Christians in own parish<br>• Add/Edit Christians<br>• Cannot delete records<br>• Limited to parish scope |
| **Viewer** | Read-Only Access | • View all Christians<br>• No edit permissions<br>• No delete permissions<br>• Cannot add Christians |
| **Member** | Personal Access | • View own records only<br>• Edit own information<br>• No access to others' data |

**Access Control Implementation:**
```typescript
// Session storage
localStorage.setItem('userLoggedIn', JSON.stringify({
  id: user.id,
  email: user.email,
  role: user.role,
  parishId: user.parish_id
}));

// Role-based filtering
private filterChristiansByRole(christians, role, parishId) {
  switch(role) {
    case 'superuser': return christians;
    case 'editor': return christians.filter(c => c.parish_id === parishId);
    case 'viewer': return christians;
    case 'member': return christians.filter(c => c.id === userId);
  }
}
```

## 🛣️ Application Routes

```typescript
const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Authentication
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verifyEmail', component: VerifyEmailComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  
  // Main Pages
  { path: 'dashboard', component: DashboardComponent },
  { path: 'search', component: SearchComponent },
  
  // Data Entry Forms
  { path: 'personal-info', component: PersonalInfoComponent },
  { path: 'baptism', component: BaptismComponent },
  { path: 'eucharist', component: EucharistComponent },
  { path: 'confirmation', component: ConfirmationComponent },
  { path: 'marriage', component: MarriageComponent },
  
  // Edit Forms
  { path: 'edit-personal-info', component: PersonalInfoUpdateComponent },
  { path: 'edit-baptism', component: BaptismUpdateComponent },
  { path: 'edit-eucharist', component: EucharistUpdateComponent },
  { path: 'edit-confirmation', component: ConfirmationUpdateComponent },
  { path: 'edit-marriage', component: MarriageUpdateComponent },
  
  // Print Views
  { path: 'marriage-card', component: MarriageCardComponent },
  { path: 'sacrament-card', component: SacramentCardComponent },
  
  // Progress Indicator
  { path: 'progress-bar', component: ProgressBarComponent }
];
```

## 📝 Core Components

### 1. Dashboard Component

**Purpose:** Main landing page after login

**Features:**
- Total Christian count display
- Role-based banner messaging
- Navigation to search and add Christians
- Logout functionality

**Key Methods:**
```typescript
loadUserCount(): void           // Fetches total Christian count
navigateToSearch(): void        // Redirects to search page
navigateToForm(): void          // Redirects to add Christian
logoutChristian(): void         // Logs out current user
```

### 2. Search Component

**Purpose:** Search, view, and manage Christian records

**Features:**
- Multi-field search (name, phone, email)
- Real-time filtering
- Detailed record view
- Sacrament data display
- Document download
- Role-based edit/delete permissions
- Print sacrament cards

**Search Algorithm:**
```typescript
searchChristianByName(): void {
  const terms = query.split(/[\s,;]+/).filter(t => t.length > 0);
  let results = [...christians];
  
  for (const term of terms) {
    results = results.filter(c => {
      const searchable = `${c.first_name} ${c.last_name} ${c.middle_name} 
                          ${c.phone_number} ${c.email}`.toLowerCase();
      return searchable.includes(term);
    });
  }
  
  this.christians = results;
}
```

**Document Download:**
```typescript
downloadDocument(documentData: any): void {
  const downloadUrl = documentData.downloadUrl || 
    `/marriage-documents/download/${documentData.file_path}`;
  
  this.apiService.downloadMarriageDocument(downloadUrl).subscribe({
    next: (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = documentData.file_name;
      link.click();
      window.URL.revokeObjectURL(url);
    }
  });
}
```

### 3. Form Components

#### Personal Info Form
**Purpose:** Create/Edit Christian biographical data

**Fields:**
- **Required:** first_name, last_name, email, password, birth_date, deanery, parish_id
- **Optional:** middle_name, phone_number, registration_number, father, mother, tribe, clan, birth_place, subcounty, residence

**Deanery/Parish Loading:**
```typescript
private loadDeaneries(): void {
  this.apiService.getParishes().subscribe(data => {
    const seen = new Set<string>();
    this.deaneries = data.filter((item: any) => {
      if (seen.has(item.deanery)) return false;
      seen.add(item.deanery);
      return true;
    });
  });
}

private loadParishesByDeanery(): void {
  this.form.get('deanery')?.valueChanges.subscribe(deanery => {
    if (deanery) {
      this.apiService.getParishByDeanery(deanery).subscribe({
        next: (parishes) => this.parishes = parishes
      });
    }
  });
}
```

#### Baptism Form
**Fields:**
- parish (string, required)
- baptism_date (date, required)
- baptism_number (string, required)
- minister (string, required)
- sponsor (string, required)

#### Eucharist Form
**Fields:**
- eucharist_place (string, required)
- eucharist_date (date, required)

#### Confirmation Form
**Fields:**
- confirmation_place (string, required)
- confirmation_date (date, required)
- minister (string, required)
- confirmation_no (string, required)

#### Marriage Form
**Purpose:** Complete marriage certificate registration

**Features:**
- Marriage details entry
- Bride and groom information
- Parent information for both parties
- Document upload (PDF/Image)
- Upload progress indicator
- Multi-step form validation

**Form Structure:**
```typescript
marriageForm = this.fb.group({
  // Marriage Details
  certificateNumber: ['', Validators.required],
  marriageDate: ['', Validators.required],
  submissionLocation: ['', Validators.required],
  submissionSubCounty: ['', Validators.required],
  submissionCounty: ['', Validators.required],
  marriageEntryNumber: ['', Validators.required],
  registrarCertificationNumber: ['', Validators.required],
  
  // Parties (Bride & Groom)
  parties: this.fb.array([
    this.createPartyGroup('groom'),
    this.createPartyGroup('bride')
  ]),
  
  // Ceremony Details
  conductedBy: ['', Validators.required],
  specialLicenseNumber: [''],
  privatePartiesCount: [''],
  privatePartiesNames: [''],
  
  // Document
  marriageCertificateFile: [null, Validators.required]
});
```

**Party Group Structure:**
```typescript
createPartyGroup(partyType: string): FormGroup {
  return this.fb.group({
    partyType: [partyType, Validators.required],
    fullName: ['', Validators.required],
    age: ['', [Validators.required, Validators.min(18)]],
    maritalStatus: ['', Validators.required],
    occupation: ['', Validators.required],
    residenceAddress: ['', Validators.required],
    residenceCounty: ['', Validators.required],
    residenceSubCounty: ['', Validators.required],
    fatherName: ['', Validators.required],
    fatherOccupation: ['', Validators.required],
    fatherResidence: ['', Validators.required],
    motherName: ['', Validators.required],
    motherOccupation: ['', Validators.required],
    motherResidence: ['', Validators.required]
  });
}
```

**File Upload:**
```typescript
onFileChange(event: any): void {
  const file = event.target.files[0];
  if (file) {
    this.selectedFile = file;
    this.marriageForm.patchValue({ marriageCertificateFile: file });
  }
}

// Upload with progress tracking
this.apiService.createMarriageDocument(formData).subscribe({
  next: (event: any) => {
    if (event.type === 1 && event.loaded && event.total) {
      this.uploadProgress = Math.round((100 * event.loaded) / event.total);
    }
  }
});
```

### 4. Progress Bar Component

**Purpose:** Multi-step form progress indicator

**Steps:**
1. Personal Info
2. Baptism
3. Eucharist
4. Confirmation
5. Marriage

**Usage:**
```html
<app-progress-bar [currentStep]="currentStep"></app-progress-bar>
```

**Implementation:**
```typescript
@Component({
  selector: 'app-progress-bar',
  template: `
    <div class="progress-container">
      <div class="progress-track">
        <div class="progress-step" *ngFor="let step of steps; let i = index" 
             [class.active]="i === currentStep" 
             [class.completed]="i < currentStep">
          <div class="step-number">{{ i + 1 }}</div>
          <div class="step-label">{{ step }}</div>
        </div>
        <div class="progress-line" [style.width]="calculateProgress()"></div>
      </div>
    </div>
  `
})
export class ProgressBarComponent {
  @Input() currentStep: number = 0;
  steps = ['Personal Info', 'Baptism', 'Eucharist', 'Confirmation', 'Marriage'];

  calculateProgress(): string {
    if (this.currentStep === 0) return '0%';
    const segmentWidth = 100 / (this.steps.length - 1);
    return `${this.currentStep * segmentWidth}%`;
  }
}
```

### 5. Print Components

#### Marriage Card Component
**Purpose:** Generate printable marriage certificate (MA1 Form)

**Features:**
- Official Kenya MA1 format
- Landscape A4 layout
- Bride and groom details
- Parent information
- Marriage official details
- Print-optimized CSS

**Print Layout:**
```css
@media print {
  .card-container {
    width: 297mm !important;
    height: 210mm !important;
    page-break-inside: avoid;
  }
  
  @page {
    size: landscape;
    margin: 5mm;
  }
}
```

#### Sacrament Card Component
**Purpose:** Generate printable baptismal card

**Features:**
- Two-page layout (cover + details)
- Portrait A4 format
- Church information
- Personal details
- All sacrament records
- Print-optimized layout

## 🔧 Services

### API Service

**Base URL Configuration:**
```typescript
private baseUrl = 'https://cbms.adnyeri.org/api';
// Development: 'http://localhost:3000'
```

**Authentication Methods:**
```typescript
loginChristian(data: any): Observable<any>
registerChristian(data: any): Observable<any>
logoutChristian(data: any): Observable<any>
requestPasswordReset(email: string): Observable<any>
verifyResetToken(token: string): Observable<any>
resetPassword(token, newPassword, confirmPassword): Observable<any>
```

**User Management:**
```typescript
getChristians(): Observable<any>
getChristianById(id: string): Observable<any>
getChristianByName(name: string): Observable<any>
getChristianCount(): Observable<any>
addChristian(data: any): Observable<any>
updateChristian(id: string, data: any): Observable<any>
deleteChristian(id: string): Observable<any>
```

**Parish Management:**
```typescript
getParishes(): Observable<any>
getParishById(id: string): Observable<any>
getParishByName(name: string): Observable<any>
getParishByDeanery(deanery: string): Observable<any>
updateParish(id: string, data: any): Observable<any>
deleteParish(id: string): Observable<any>
```

**Sacrament Records:**
```typescript
// Baptism
getBaptisms(): Observable<any>
getBaptismById(id: string): Observable<any>
getBaptismByUserId(userId: string): Observable<any>
createBaptism(data: any): Observable<any>
updateBaptism(id: string, data: any): Observable<any>
deleteBaptism(id: string): Observable<any>

// Eucharist
getEucharists(): Observable<any>
getEucharistById(id: string): Observable<any>
getEucharistByUserId(userId: string): Observable<any>
createEucharist(data: any): Observable<any>
updateEucharist(id: string, data: any): Observable<any>
deleteEucharist(id: string): Observable<any>

// Confirmation
getConfirmations(): Observable<any>
getConfirmationById(id: string): Observable<any>
getConfirmationByUserId(userId: string): Observable<any>
createConfirmation(data: any): Observable<any>
updateConfirmation(id: string, data: any): Observable<any>
deleteConfirmation(id: string): Observable<any>

// Marriage
createMarriage(data: any): Observable<any>
getMarriages(): Observable<any>
getMarriageById(id: string): Observable<any>
getFullMarriageByUserId(userId: string): Observable<any>
updateMarriage(id: string, data: any): Observable<any>
deleteMarriage(id: string): Observable<any>

// Marriage Parties
createMarriageParty(data: any): Observable<any>
deleteMarriageParty(id: string): Observable<any>

// Marriage Documents
createMarriageDocument(formData: FormData): Observable<HttpEvent<any>>
getDocumentUrl(filePath: string): string
downloadMarriageDocument(downloadUrl: string): Observable<Blob>
getMarriageDocumentsList(marriageId: string): Observable<any[]>
```

**HTTP Configuration:**
```typescript
// All requests include credentials for cookie-based auth
{ withCredentials: true }

// File upload with progress tracking
{
  withCredentials: true,
  reportProgress: true,
  observe: 'events'
}

// File download
{
  responseType: 'blob',
  withCredentials: true,
  observe: 'response'
}
```

## 💾 State Management

### Local Storage

**User Session:**
```typescript
// Stored on login
localStorage.setItem('userLoggedIn', JSON.stringify({
  id: user.id,
  email: user.email,
  role: user.role,
  first_name: user.first_name,
  last_name: user.last_name,
  parishId: user.parish_id
}));

// Auto-expire after 24 hour
setTimeout(() => {
  localStorage.removeItem('userLoggedIn');
}, 86400000);
```

**Selected Christian:**
```typescript
// Stored when viewing/editing a Christian
localStorage.setItem('selectedChristian', JSON.stringify({
  id: christian.id,
  email: christian.email,
  role: christian.role,
  name: `${christian.first_name} ${christian.last_name}`,
  parishId: christian.parish_id
}));
```

**Added User (During Multi-Step Form):**
```typescript
// Stored after personal info submission
localStorage.setItem('addedUser', JSON.stringify({
  id: response.user.id,
  email: response.user.email,
  role: response.user.role,
  first_name: response.user.first_name,
  last_name: response.user.last_name
}));

// Cleared when all forms are complete
localStorage.removeItem('addedUser');
```

### Session Storage

**Form Data Persistence:**
```typescript
// Save form data before navigation
sessionStorage.setItem('userFormData', JSON.stringify(this.userForm.value));
sessionStorage.setItem('baptismFormData', JSON.stringify(this.baptismForm.value));
sessionStorage.setItem('eucharistFormData', JSON.stringify(this.eucharistForm.value));
sessionStorage.setItem('confirmationFormData', JSON.stringify(this.confirmationForm.value));
sessionStorage.setItem('marriageFormData', JSON.stringify(this.marriageForm.value));

// Restore on component init
ngOnInit() {
  const storedFormData = sessionStorage.getItem('userFormData');
  if (storedFormData) {
    this.userForm.patchValue(JSON.parse(storedFormData));
  }
}

// Clear after successful submission
sessionStorage.removeItem('userFormData');
```

## 🎨 Styling & UI/UX

### Color Scheme

```css
/* Primary Colors */
--primary-dark: #4A002A;      /* Main brand color */
--primary-gold: #C2AE6D;      /* Accent color */
--secondary-gold: #6d5507;    /* Secondary accent */
--light-bg: #F1E9E9;          /* Card backgrounds */
--cream: #fffbe6;             /* Body background */

/* Status Colors */
--success: #2e7d32;           /* Success messages */
--error: #d32f2f;             /* Error messages */
--warning: #ffc107;           /* Warning states */
```

### Responsive Design

**Breakpoints:**
```css
/* Mobile First */
@media (max-width: 480px) {
  .container { max-width: 95%; padding: 15px; }
  .form-row { flex-direction: column; }
}

/* Tablet */
@media (max-width: 768px) {
  .christian-details { flex-direction: row; }
  .name-row { flex-direction: column; }
}

/* Desktop */
@media (min-width: 768px) {
  .christian-details { justify-content: space-between; }
}
```

### Form Validation Styling

```css
/* Valid state */
input.ng-touched.ng-valid {
  border-left: 5px solid green;
}

/* Invalid state */
input.ng-touched.ng-invalid {
  border-left: 5px solid #a94442;
}

/* Error messages */
.error-message {
  color: #d32f2f;
  font-size: 12px;
  margin-top: 2px;
}

/* Success messages */
.success-message {
  color: #2e7d32;
  background-color: #e8f5e8;
  border: 1px solid #4caf50;
  padding: 10px;
  border-radius: 5px;
}
```

### Loading States

```typescript
// Component state
isLoading: boolean = false;

// Template
<div *ngIf="isLoading" class="loading">
  Loading...
</div>
```

```css
.loading {
  text-align: center;
  padding: 20px;
  font-size: 16px;
  color: #4a002a;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #4A002A;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

## 🔒 Security Features

### Input Validation

**Email Validation:**
```typescript
email: ['', [Validators.required, Validators.email]]
```

**Password Validation:**
```typescript
password: ['', [Validators.required, Validators.minLength(8)]]
```

**Custom Validators:**
```typescript
passwordMatchValidator(group: FormGroup) {
  const password = group.get('newPassword')?.value;
  const confirmPassword = group.get('confirmPassword')?.value;
  return password === confirmPassword ? null : { passwordMismatch: true };
}
```

### XSS Protection

- Angular's built-in sanitization
- No `innerHTML` usage
- Safe data binding with interpolation

### CORS Configuration

```typescript
// API requests include credentials
{ withCredentials: true }

// Allowed origins on backend
allowedOrigins = ['https://cbms.adnyeri.org', 'http://localhost:4200'];
```

### Session Management

- 1-hour auto-logout
- Secure session storage
- Protected routes with guards

## 🚀 Deployment

### Production Build

```bash
# Build for production
ng build --configuration production

# Output location
dist/biodata-system/browser/
```

### Deployment Process (from PRODUCTION.MD)

**Frontend Deployment:**
```bash
# 1. Navigate to project directory
cd ~/Biodata-Frontend

# 2. Backup current website
cp -r ~/cbms.adnyeri.org ~/backups/cbms.adnyeri.org-backup-$(date +%Y%m%d-%H%M%S)

# 3. Pull latest changes
git pull

# 4. Build production
ng build --configuration production

# 5. Deploy to web directory
rm -rf ~/cbms.adnyeri.org/*
cp -r ~/Biodata-Frontend/dist/biodata-system/browser/* ~/cbms.adnyeri.org/

# 6. Verify deployment
ls -la ~/cbms.adnyeri.org/
```

**Backend Deployment:**
```bash
# Navigate to backend
cd ~/Biodata-Backend

# Pull latest changes
git pull

# Restart PM2 process
pm2 restart biodata-backend

pm2 delete biodata-backend
pm2 start "npm run start" --name "biodata-backend"
pm2 save
pm2 status
```

### Environment Configuration

**Development:**
```typescript
private baseUrl = 'http://localhost:3000';
```

**Production:**
```typescript
private baseUrl = 'https://cbms.adnyeri.org/api';
```

## 📊 Data Flow Examples

### User Registration Flow

```
1. User fills registration form
2. Frontend validates input
3. POST /auth/register with user data
4. Backend creates user (verified: false)
5. Backend sends verification email
6. User clicks verification link
7. GET /auth/verifyEmail?token=...
8. Backend verifies token, updates user
9. Frontend redirects to login
10. User logs in with verified account
```

### Multi-Step Form Flow

```
1. Personal Info Form
   ↓ (Save to localStorage: addedUser)
2. Baptism Form
   ↓ (Save to sessionStorage: form data)
3. Eucharist Form
   ↓ (Save to sessionStorage: form data)
4. Confirmation Form
   ↓ (Save to sessionStorage: form data)
5. Marriage Form
   ↓ (Upload document, create parties)
6. Complete → Clear storage → Redirect to dashboard
```

### Search and View Flow

```
1. User enters search query
2. Split query into terms
3. Filter Christians by all terms
4. Display matching results
5. User selects a Christian
6. Load all sacrament data via forkJoin
7. Display complete Christian record
8. User can edit/delete/print
```

### Document Download Flow

```
1. User clicks download button
2. GET /marriage-documents/download/:filename
3. Backend streams file as Blob
4. Frontend creates object URL
5. Trigger browser download
6. Cleanup: revoke object URL
```

## 🧪 Testing Considerations

Currently, no automated tests are configured. For testing:

**Manual Testing Checklist:**

1. **Authentication:**
   - ✓ Registration with validation
   - ✓ Email verification
   - ✓ Login with valid/invalid credentials
   - ✓ Password reset flow
   - ✓ Logout

2. **Forms:**
   - ✓ Multi-step form navigation
   - ✓ Form data persistence
   - ✓ Validation messages
   - ✓ File upload
   - ✓ Submit success/error

3. **Search:**
   - ✓ Search by name
   - ✓ Search by email
   - ✓ Search by phone
   - ✓ Multi-term search
   - ✓ Role-based filtering

4. **CRUD Operations:**
   - ✓ Create records
   - ✓ Read/View records
   - ✓ Update records
   - ✓ Delete records (role-based)

5. **Print Views:**
   - ✓ Marriage certificate layout
   - ✓ Sacrament card layout
   - ✓ Print formatting
   - ✓ Page breaks

6. **Responsive Design:**
   - ✓ Mobile view
   - ✓ Tablet view
   - ✓ Desktop view
   - ✓ Print view

## 📈 Performance Optimization

### Lazy Loading

Currently, all components are loaded eagerly. Future improvement:

```typescript
const routes: Routes = [
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module')
      .then(m => m.AdminModule)
  }
];
```

### Caching Strategies

**Parish Data:**
```typescript
// Cache parishes to avoid repeated API calls
private cachedParishes: any[] = [];

getParishes(): Observable<any> {
  if (this.cachedParishes.length > 0) {
    return of(this.cachedParishes);
  }
  return this.http.get(url).pipe(
    tap(data => this.cachedParishes = data)
  );
}
```

### RxJS Operators

```typescript
// Avoid memory leaks
import { takeUntil } from 'rxjs/operators';
private destroy$ = new Subject<void>();

ngOnInit() {
  this.apiService.getData()
    .pipe(takeUntil(this.destroy$))
    .subscribe(data => { });
}

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

## 🐛 Known Issues & Limitations

1. **No Error Recovery:**
   - Limited retry logic on failed requests
   - No offline mode

2. **Session Management:**
   - Fixed 1-hour timeout
   - No refresh token implementation

3. **File Upload:**
   - No file size validation on frontend
   - Limited file type checking

4. **Search:**
   - No debouncing on search input
   - No pagination for large result sets

5. **Accessibility:**
   - Limited ARIA labels
   - No keyboard navigation optimization

6. **Testing:**
   - No unit tests
   - No integration tests
   - No E2E tests

## 🔮 Future Enhancements

### Short Term
1. **Testing Suite:**
   - Unit tests with Jasmine/Karma
   - E2E tests with Protractor/Cypress
   - Component testing

2. **Error Handling:**
   - Global error interceptor
   - User-friendly error messages
   - Retry logic for failed requests

3. **UX Improvements:**
   - Search debouncing
   - Pagination
   - Infinite scroll
   - Loading skeletons

### Long Term
1. **Features:**
   - Bulk import/export
   - Advanced filtering
   - Report generation
   - Analytics dashboard
   - Notification system

2. **Architecture:**
   - State management (NgRx/Akita)
   - Lazy loading modules
   - Service workers (PWA)
   - Caching strategies

3. **Accessibility:**
   - WCAG 2.1 compliance
   - Screen reader support
   - Keyboard navigation
   - High contrast mode

4. **Performance:**
   - Virtual scrolling
   - Image optimization
   - Code splitting
   - Bundle size reduction

## 📱 Browser Support

**Supported Browsers:**
- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

**Not Supported:**
- Internet Explorer 11 and below

## 📚 Additional Resources

### Angular Documentation
- [Angular Official Docs](https://angular.dev)
- [Angular Forms Guide](https://angular.dev/guide/forms)
- [Angular Router](https://angular.dev/guide/routing)
- [RxJS Documentation](https://rxjs.dev)

### Project Resources
- **Production Site:** https://cbms.adnyeri.org
- **API Endpoint:** https://cbms.adnyeri.org/api
- **Backend Docs:** See BACKEND_DOCUMENTATION.md

## 👨‍💻 Development Team

**Developed by:** Megalio Software Developers

**Contributors:**
- Frontend Development
- UI/UX Design
- Testing & QA

## 📄 License

This project is proprietary software developed for the Archdiocese of Nyeri.

---

**Version:** 1.0.0  
**Framework:** Angular 19.2.0  
**Last Updated:** January 2026  
**Live URL:** https://cbms.adnyeri.org

## 🔗 Related Documentation

- [Backend Documentation](./DOCUMENTATION.md)
- [Deployment Guide](./PRODUCTION.MD)
- [API Reference](./API_REFERENCE.md) (if exists)