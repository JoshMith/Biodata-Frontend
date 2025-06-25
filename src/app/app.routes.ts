import { Routes } from "@angular/router";

import { LoginComponent } from "./login/login.component";
import { DashboardComponent } from "./dashboard/dashboard.component";
import { RegisterComponent } from "./register/register.component";
import { SearchComponent } from "./search/search.component";
import { PersonalInfoComponent } from "./form/personal-info/personal-info.component";
import { BaptismComponent } from "./form/baptism/baptism.component";
import { EucharistComponent } from "./form/eucharist/eucharist.component";
import { ConfirmationComponent } from "./form/confirmation/confirmation.component";
import { MarriageComponent } from "./form/marriage/marriage.component";
import { BaptismUpdateComponent } from "./update/baptism/baptism.component";
import { ConfirmationUpdateComponent } from "./update/confirmation/confirmation.component";
import { EucharistUpdateComponent } from "./update/eucharist/eucharist.component";
import { MarriageUpdateComponent } from "./update/marriage/marriage.component";
import { PersonalInfoUpdateComponent } from "./update/personal-info/personal-info.component";
import { MarriageCardComponent } from "./marriage-card/marriage-card.component";
import { VerifyEmailComponent } from "./verify-email/verify-email.component";


export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },//the default page
    { path: 'login', component: LoginComponent },
    { path: 'dashboard', component: DashboardComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'search', component: SearchComponent },
    { path: 'personal-info', component: PersonalInfoComponent },
    { path: 'baptism', component: BaptismComponent },
    { path: 'eucharist', component: EucharistComponent },
    { path: 'confirmation', component: ConfirmationComponent },
    { path: 'marriage', component: MarriageComponent },
    { path: 'edit-personal-info', component: PersonalInfoUpdateComponent },
    { path: 'edit-baptism', component: BaptismUpdateComponent },
    { path: 'edit-eucharist', component: EucharistUpdateComponent },
    { path: 'edit-confirmation', component: ConfirmationUpdateComponent },
    { path: 'edit-marriage', component: MarriageUpdateComponent },
    { path: 'marriage-card', component: MarriageCardComponent },
    {path:'verifyEmail',component:VerifyEmailComponent},

]
