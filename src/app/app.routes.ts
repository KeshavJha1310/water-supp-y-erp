import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LoginComponent } from './auth/login/login.component';
import { SignInComponent } from './auth/sign-in/sign-in.component';
import { AuthGuard } from './core/services/gaurds/auth.gaurd';

export const routes: Routes = [
    {path:'',component:DashboardComponent, canActivate: [AuthGuard]},
    {path:'login',component:LoginComponent},
    {path:'addDeliveryMan',component:SignInComponent}
];
