import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout').then(m => m.LayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'profile',
        loadComponent: () => import('./features/auth/profile').then(m => m.ProfileComponent)
      },
      {
        path: 'cakes',
        loadComponent: () => import('./features/admin/cake-management/cake-management.component').then(m => m.CakeManagementComponent)
      },
      {
        path: 'admin/invoices',
        loadComponent: () => import('./features/admin/invoices/invoices.component').then(m => m.InvoicesComponent)
      },
      {
        path: 'admin/users',
        loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'employee/pos',
        loadComponent: () => import('./features/employee/pos-view/pos.component').then(m => m.PosComponent)
      },
      {
        path: 'employee/invoices',
        loadComponent: () => import('./features/admin/invoices/invoices.component').then(m => m.InvoicesComponent)
      },
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard-view/dashboard.component').then(m => m.DashboardComponent),
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
