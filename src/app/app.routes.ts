import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login.component';
import { MarriageComponent } from './form/marriage/marriage.component';
import { RegisterComponent } from './auth/register/register.component';
import { PersonalInfoComponent } from './form/personal-info/personal-info.component';
import { BaptismComponent } from './form/baptism/baptism.component';
import { EucharistComponent } from './form/eucharist/eucharist.component';
import { ConfirmationComponent } from './form/confirmation/confirmation.component';
import { BaptismUpdateComponent } from './update/baptism/baptism.component';
import { ConfirmationUpdateComponent } from './update/confirmation/confirmation.component';
import { EucharistUpdateComponent } from './update/eucharist/eucharist.component';
import { PersonalInfoUpdateComponent } from './update/personal-info/personal-info.component';
import { MarriageCardComponent } from './marriage-card/marriage-card.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
import { SearchComponent } from './search/search.component';
import { MarriageUpdateComponent } from './update/marriage/marriage.component';
import { SacramentCardComponent } from './sacrament-card/sacrament-card.component';
import { ProgressBarComponent } from './shared/progress-bar';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/reset-password/reset-password.component';
import { authGuard } from './guards/auth.guard';
import { roleGuard } from './guards/role.guard';
import { SuperuserDashboardComponent } from './dashboard/superuser-dashboard/superuser-dashboard.component';
import { MemberDashboardComponent } from './dashboard/member-dashboard/member-dashboard.component';
import { EditorDashboardComponent } from './dashboard/editor-dashboard/editor-dashboard.component';

export const routes: Routes = [
  // --- Public routes (no auth needed) ---
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'verifyEmail', component: VerifyEmailComponent },

  // --- Any authenticated role ---
  {
    path: 'dashboard', component: SuperuserDashboardComponent, canActivate: [authGuard, roleGuard(['superuser', 'viewer'])]
  },
  {
    path: 'dashboard/editor', component: EditorDashboardComponent, canActivate: [authGuard, roleGuard(['editor'])]
  },
  {
    path: 'dashboard/member', component: MemberDashboardComponent, canActivate: [authGuard, roleGuard(['member'])]
  },
  {
    path: 'search', component: SearchComponent, canActivate: [authGuard]
  },
  {
    path: 'sacrament-card', component: SacramentCardComponent, canActivate: [authGuard]
  },
  {
    path: 'marriage-card', component: MarriageCardComponent, canActivate: [authGuard]
  },

  // --- Add new records: superuser and editor only ---
  {
    path: 'personal-info', component: PersonalInfoComponent, canActivate: [authGuard, roleGuard(['superuser', 'editor'])]
  },
  {
    path: 'baptism', component: BaptismComponent, canActivate: [authGuard, roleGuard(['superuser', 'editor'])]
  },
  {
    path: 'eucharist', component: EucharistComponent, canActivate: [authGuard, roleGuard(['superuser', 'editor'])]
  },
  {
    path: 'confirmation', component: ConfirmationComponent, canActivate: [authGuard, roleGuard(['superuser', 'editor'])]
  },
  {
    path: 'marriage', component: MarriageComponent, canActivate: [authGuard, roleGuard(['superuser', 'editor'])]
  },

  // --- Edit existing records: superuser, editor, and member (own record only) ---
  // Note: member ownership is enforced in the component, not the route guard,
  // because the guard doesn't know which record ID is being edited.
  {
    path: 'edit-personal-info', component: PersonalInfoUpdateComponent, canActivate: [authGuard, roleGuard(['superuser', 'editor', 'member'])]
  },
  {
    path: 'edit-baptism', component: BaptismUpdateComponent, canActivate: [authGuard, roleGuard(['superuser', 'editor', 'member'])]
  },
  {
    path: 'edit-eucharist', component: EucharistUpdateComponent, canActivate: [authGuard, roleGuard(['superuser', 'editor', 'member'])]
  },
  {
    path: 'edit-confirmation', component: ConfirmationUpdateComponent, canActivate: [authGuard, roleGuard(['superuser', 'editor', 'member'])]
  },
  {
    path: 'edit-marriage', component: MarriageUpdateComponent, canActivate: [authGuard, roleGuard(['superuser', 'editor', 'member'])]
  },

  // --- Dev/internal only (no guard needed in production but keep isolated) ---
  { path: 'progress-bar', component: ProgressBarComponent },

  { path: '', redirectTo: 'login', pathMatch: 'full' },
];