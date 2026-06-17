import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
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
  // PUBLIC ROUTES
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'verifyEmail', component: VerifyEmailComponent },

  // DEFAULT ENTRY → LOGIN
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },

  // PROTECTED AREA (AFTER LOGIN)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [

      // DASHBOARDS (ROLE-BASED)
      {
        path: 'dashboard',
        component: SuperuserDashboardComponent,
        canActivate: [roleGuard(['superuser', 'viewer'])]
      },
      {
        path: 'dashboard/editor',
        component: EditorDashboardComponent,
        canActivate: [roleGuard(['editor'])]
      },
      {
        path: 'dashboard/member',
        component: MemberDashboardComponent,
        canActivate: [roleGuard(['member'])]
      },

      // DEFAULT AFTER LOGIN
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },

      // OTHER FEATURES
      { path: 'search', component: SearchComponent },
      { path: 'sacrament-card', component: SacramentCardComponent },
      { path: 'marriage-card', component: MarriageCardComponent },

      { path: 'personal-info', component: PersonalInfoComponent, canActivate: [roleGuard(['superuser', 'editor'])] },
      { path: 'baptism', component: BaptismComponent, canActivate: [roleGuard(['superuser', 'editor'])] },
      { path: 'eucharist', component: EucharistComponent, canActivate: [roleGuard(['superuser', 'editor'])] },
      { path: 'confirmation', component: ConfirmationComponent, canActivate: [roleGuard(['superuser', 'editor'])] },
      { path: 'marriage', component: MarriageComponent, canActivate: [roleGuard(['superuser', 'editor'])] },

      { path: 'edit-personal-info', component: PersonalInfoUpdateComponent },
      { path: 'edit-baptism', component: BaptismUpdateComponent },
      { path: 'edit-eucharist', component: EucharistUpdateComponent },
      { path: 'edit-confirmation', component: ConfirmationUpdateComponent },
      { path: 'edit-marriage', component: MarriageUpdateComponent }
    ]
  },

  // CATCH ALL
  {
    path: '**',
    redirectTo: 'login'
  }
];