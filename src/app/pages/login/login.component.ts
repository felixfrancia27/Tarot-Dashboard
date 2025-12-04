import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-bg">
        <div class="orb orb-1"></div>
        <div class="orb orb-2"></div>
        <div class="orb orb-3"></div>
      </div>
      
      <div class="login-card animate-slide-up">
        <div class="login-header">
          <div class="logo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
                    fill="currentColor"/>
            </svg>
          </div>
          <h1>Tarot Dashboard</h1>
          <p class="subtitle">Panel de control de llamadas</p>
        </div>
        
        <form (ngSubmit)="onLogin()" class="login-form">
          <div class="form-group">
            <label for="username">Usuario</label>
            <div class="input-with-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <input 
                type="text" 
                id="username"
                class="input"
                [(ngModel)]="username"
                name="username"
                placeholder="Ingresa tu usuario"
                required
                autocomplete="username"
              />
            </div>
          </div>
          
          <div class="form-group">
            <label for="password">Contraseña</label>
            <div class="input-with-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input 
                [type]="showPassword() ? 'text' : 'password'"
                id="password"
                class="input"
                [(ngModel)]="password"
                name="password"
                placeholder="Ingresa tu contraseña"
                required
                autocomplete="current-password"
              />
              <button 
                type="button" 
                class="btn-toggle-password"
                (click)="showPassword.set(!showPassword())"
              >
                @if (showPassword()) {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                } @else {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                }
              </button>
            </div>
          </div>
          
          @if (error()) {
            <div class="error-message animate-fade-in">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {{ error() }}
            </div>
          }
          
          <button 
            type="submit" 
            class="btn btn-primary btn-login"
            [disabled]="isLoading()"
          >
            @if (isLoading()) {
              <div class="spinner-small"></div>
              Ingresando...
            } @else {
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Ingresar
            }
          </button>
        </form>
        
        <div class="login-footer">
          <div class="powered-by">
            <span>Conectado con</span>
            <strong>ElevenLabs</strong>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      position: relative;
      overflow: hidden;
    }
    
    .login-bg {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }
    
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.5;
      animation: float 20s ease-in-out infinite;
    }
    
    .orb-1 {
      width: 400px;
      height: 400px;
      background: var(--color-primary);
      top: -100px;
      left: -100px;
    }
    
    .orb-2 {
      width: 300px;
      height: 300px;
      background: var(--color-secondary);
      bottom: -50px;
      right: -50px;
      animation-delay: -5s;
    }
    
    .orb-3 {
      width: 200px;
      height: 200px;
      background: var(--color-accent);
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: -10s;
    }
    
    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      25% { transform: translate(30px, -30px) scale(1.1); }
      50% { transform: translate(-20px, 20px) scale(0.95); }
      75% { transform: translate(20px, 30px) scale(1.05); }
    }
    
    .login-card {
      background: rgba(26, 26, 46, 0.85);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      padding: 48px;
      width: 100%;
      max-width: 420px;
      position: relative;
      z-index: 1;
      box-shadow: var(--shadow-lg);
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 40px;
    }
    
    .logo {
      width: 70px;
      height: 70px;
      margin: 0 auto 20px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 40px rgba(108, 92, 231, 0.5);
      
      svg {
        width: 36px;
        height: 36px;
        color: white;
      }
    }
    
    .login-header h1 {
      font-family: var(--font-display);
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 8px;
      background: linear-gradient(135deg, var(--text-primary), var(--color-primary-light));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .subtitle {
      color: var(--text-secondary);
      font-size: 0.95rem;
    }
    
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .form-group label {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-secondary);
    }
    
    .input-with-icon {
      position: relative;
      
      > svg:first-child {
        position: absolute;
        left: 16px;
        top: 50%;
        transform: translateY(-50%);
        width: 20px;
        height: 20px;
        color: var(--text-muted);
        pointer-events: none;
      }
      
      .input {
        padding-left: 50px;
        padding-right: 50px;
      }
    }
    
    .btn-toggle-password {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color var(--transition-fast);
      
      svg {
        width: 20px;
        height: 20px;
      }
      
      &:hover {
        color: var(--text-primary);
      }
    }
    
    .error-message {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      background: rgba(255, 118, 117, 0.1);
      border: 1px solid rgba(255, 118, 117, 0.3);
      border-radius: var(--border-radius);
      color: var(--color-error);
      font-size: 0.9rem;
      
      svg {
        width: 20px;
        height: 20px;
        flex-shrink: 0;
      }
    }
    
    .btn-login {
      width: 100%;
      padding: 16px 24px;
      font-size: 1rem;
      margin-top: 8px;
      
      svg {
        width: 20px;
        height: 20px;
      }
    }
    
    .spinner-small {
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    
    .login-footer {
      margin-top: 36px;
      text-align: center;
    }
    
    .powered-by {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 0.85rem;
      color: var(--text-muted);
      
      strong {
        color: var(--color-primary-light);
        font-weight: 600;
      }
    }
    
    @media (max-width: 480px) {
      .login-card {
        padding: 32px 24px;
      }
      
      .login-header h1 {
        font-size: 1.75rem;
      }
    }
  `]
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  
  username = '';
  password = '';
  
  showPassword = signal(false);
  isLoading = signal(false);
  error = signal<string | null>(null);
  
  onLogin() {
    if (!this.username || !this.password) {
      this.error.set('Por favor completa todos los campos');
      return;
    }
    
    this.isLoading.set(true);
    this.error.set(null);
    
    // Simular un pequeño delay para mejor UX
    setTimeout(() => {
      const result = this.authService.login(this.username, this.password);
      
      this.isLoading.set(false);
      
      if (result.success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.error.set(result.error || 'Error al iniciar sesión');
      }
    }, 500);
  }
}
