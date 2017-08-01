import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthCheck } from './authcheck';
// Route Configuration
export const routes: Routes = [
  {
    path: '', redirectTo: 'login', pathMatch: 'full', canActivate: [
      'AuthCheck',
      AuthCheck
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent }
];


export const routing: ModuleWithProviders = RouterModule.forRoot(routes);