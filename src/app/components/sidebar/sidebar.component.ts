import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                  fill="currentColor"/>
          </svg>
        </div>
        <div class="brand">
          <h2>Tarot Dashboard</h2>
          <span class="client-name">{{ clientName() }}</span>
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
          <span>Dashboard</span>
        </a>
        
        <a routerLink="/conversations" routerLinkActive="active" class="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <span>Conversaciones</span>
        </a>
      </nav>
      
      <div class="sidebar-footer">
        <div class="agent-info">
          <div class="agent-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
              <line x1="9" y1="9" x2="9.01" y2="9"/>
              <line x1="15" y1="9" x2="15.01" y2="9"/>
            </svg>
          </div>
          <div class="agent-details">
            <span class="agent-name">{{ agentName() }}</span>
            <span class="username">{{ username() }}</span>
          </div>
        </div>
        
        <button class="btn btn-ghost logout-btn" (click)="onLogout()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 280px;
      height: 100vh;
      background: var(--bg-card);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
    }
    
    .sidebar-header {
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 14px;
      border-bottom: 1px solid var(--border-color);
    }
    
    .logo {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      
      svg {
        width: 24px;
        height: 24px;
        color: white;
      }
    }
    
    .brand h2 {
      font-family: var(--font-display);
      font-size: 1.1rem;
      font-weight: 600;
      margin-bottom: 2px;
    }
    
    .client-name {
      font-size: 0.8rem;
      color: var(--color-primary-light);
    }
    
    .sidebar-nav {
      flex: 1;
      padding: 20px 16px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      border-radius: var(--border-radius);
      color: var(--text-secondary);
      transition: all var(--transition-fast);
      
      svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
      
      span {
        font-size: 0.95rem;
        font-weight: 500;
      }
      
      &:hover {
        background: var(--bg-card-hover);
        color: var(--text-primary);
      }
      
      &.active {
        background: rgba(108, 92, 231, 0.15);
        color: var(--color-primary-light);
        
        svg {
          color: var(--color-primary);
        }
      }
    }
    
    .sidebar-footer {
      padding: 20px;
      border-top: 1px solid var(--border-color);
    }
    
    .agent-info {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px;
      background: var(--bg-input);
      border-radius: var(--border-radius);
      margin-bottom: 16px;
    }
    
    .agent-icon {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, var(--color-secondary), var(--color-primary));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      svg {
        width: 22px;
        height: 22px;
        color: white;
      }
    }
    
    .agent-details {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .agent-name {
      font-size: 0.85rem;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .username {
      font-size: 0.75rem;
      color: var(--text-muted);
      text-transform: capitalize;
    }
    
    .logout-btn {
      width: 100%;
      justify-content: center;
      color: var(--text-secondary);
      
      svg {
        width: 18px;
        height: 18px;
      }
      
      &:hover {
        color: var(--color-error);
        background: rgba(255, 118, 117, 0.1);
      }
    }
  `]
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  
  clientName = computed(() => this.authService.currentClient()?.clientName || 'Cliente');
  agentName = computed(() => this.authService.currentClient()?.agentName || 'Agente');
  username = computed(() => this.authService.currentClient()?.username || '');
  
  onLogout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
