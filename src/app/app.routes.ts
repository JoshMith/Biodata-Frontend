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
import { SuperadminDashboardComponent } from './dashboard/superadmin-dashboard/superadmin-dashboard.component';
import { MemberDashboardComponent } from './dashboard/member-dashboard/member-dashboard.component';
import { ParishDashboardComponent } from './dashboard/parish-dashboard/parish-dashboard.component';
import { DeaneryDashboardComponent } from './dashboard/deanery-dashboard/deanery-dashboard.component';
import { AuditLogsComponent } from './audit-logs/audit-logs.component';

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
        component: SuperadminDashboardComponent,
        canActivate: [roleGuard(['superadmin', 'superviewer'])]
      },
      {
        path: 'dashboard/parish',
        component: ParishDashboardComponent,
        canActivate: [roleGuard(['parishadmin', 'parishviewer', 'secretary'])]
      },
      {
        path:'dashboard/deanery',
        component:DeaneryDashboardComponent,
        canActivate:[roleGuard(['deaneryviewer'])]
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

      { path: 'personal-info', component: PersonalInfoComponent, canActivate: [roleGuard(['superadmin', 'parishadmin', 'secretary'])] },
      { path: 'baptism', component: BaptismComponent, canActivate: [roleGuard(['superadmin', 'parishadmin', 'secretary'])] },
      { path: 'eucharist', component: EucharistComponent, canActivate: [roleGuard(['superadmin', 'parishadmin', 'secretary'])] },
      { path: 'confirmation', component: ConfirmationComponent, canActivate: [roleGuard(['superadmin', 'parishadmin', 'secretary'])] },
      { path: 'marriage', component: MarriageComponent, canActivate: [roleGuard(['superadmin', 'parishadmin', 'secretary'])] },

      { path: 'edit-personal-info', component: PersonalInfoUpdateComponent, canActivate: [roleGuard(['superadmin', 'parishadmin', 'secretary', 'member'])] },
      { path: 'edit-baptism', component: BaptismUpdateComponent, canActivate: [roleGuard(['superadmin', 'parishadmin', 'secretary', 'member'])] },
      { path: 'edit-eucharist', component: EucharistUpdateComponent, canActivate: [roleGuard(['superadmin', 'parishadmin', 'secretary', 'member'])] },
      { path: 'edit-confirmation', component: ConfirmationUpdateComponent, canActivate: [roleGuard(['superadmin', 'parishadmin', 'secretary', 'member'])] },
      { path: 'edit-marriage', component: MarriageUpdateComponent, canActivate: [roleGuard(['superadmin', 'parishadmin', 'secretary', 'member'])] },

      // AUDIT LOGS — superadmin and superviewer only
      {
        path: 'audit-logs',
        component: AuditLogsComponent,
        canActivate: [roleGuard(['superadmin', 'superviewer'])]
      },
    ]
  },

  // CATCH ALL
  {
    path: '**',
    redirectTo: 'login'
  }
];