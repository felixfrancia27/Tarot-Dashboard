import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'conversations',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/conversations/conversations.component').then(m => m.ConversationsComponent)
  },
  {
    path: 'conversation/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/conversation-detail/conversation-detail.component').then(m => m.ConversationDetailComponent)
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];

