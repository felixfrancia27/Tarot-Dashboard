import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div class="layout">
      <app-sidebar />
      <main class="main-content">
        <ng-content />
      </main>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
    }
    
    .main-content {
      flex: 1;
      margin-left: 280px;
      padding: 32px;
      min-height: 100vh;
    }
    
    @media (max-width: 1024px) {
      .main-content {
        margin-left: 0;
        padding: 20px;
      }
    }
  `]
})
export class LayoutComponent {}

