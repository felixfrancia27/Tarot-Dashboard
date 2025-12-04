import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutComponent } from '../../components/layout/layout.component';
import { ElevenLabsService } from '../../services/elevenlabs.service';
import { AuthService } from '../../services/auth.service';
import { ConversationListItem } from '../../models/conversation.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="dashboard animate-fade-in">
        <header class="page-header">
          <div>
            <h1>Dashboard</h1>
            <p class="text-secondary">Resumen de actividad de tu agente</p>
          </div>
          <button class="btn btn-secondary" (click)="cargarDatos()" [disabled]="cargando()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [class.animate-spin]="cargando()">
              <path d="M23 4v6h-6"/>
              <path d="M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            Actualizar
          </button>
        </header>
        
        @if (cargando()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando estadísticas...</p>
          </div>
        } @else {
          <!-- Tarjetas de Estadísticas -->
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon stat-icon-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ totalLlamadas() }}</span>
                <span class="stat-label">Total Llamadas</span>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon stat-icon-success">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ tiempoTotalMinutos() }} min</span>
                <span class="stat-label">Tiempo Total</span>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon stat-icon-info">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ totalMensajes() }}</span>
                <span class="stat-label">Total Mensajes</span>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon stat-icon-warning">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ tasaExito() }}%</span>
                <span class="stat-label">Tasa de Éxito</span>
              </div>
            </div>
          </div>
          
          <!-- Estadísticas Secundarias -->
          <div class="secondary-stats">
            <div class="secondary-stat">
              <span class="secondary-value">{{ llamadasHoy() }}</span>
              <span class="secondary-label">Llamadas hoy</span>
            </div>
            <div class="divider"></div>
            <div class="secondary-stat">
              <span class="secondary-value">{{ llamadasEstaSemana() }}</span>
              <span class="secondary-label">Esta semana</span>
            </div>
            <div class="divider"></div>
            <div class="secondary-stat">
              <span class="secondary-value">{{ duracionPromedio() }} min</span>
              <span class="secondary-label">Duración promedio</span>
            </div>
          </div>
          
          <!-- Conversaciones Recientes -->
          <section class="recent-section">
            <div class="section-header">
              <h2>Conversaciones Recientes</h2>
              <a routerLink="/conversations" class="view-all">
                Ver todas
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </a>
            </div>
            
            @if (conversacionesRecientes().length === 0) {
              <div class="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p>No hay conversaciones recientes</p>
              </div>
            } @else {
              <div class="conversations-list">
                @for (conv of conversacionesRecientes(); track conv.conversation_id) {
                  <a [routerLink]="['/conversation', conv.conversation_id]" class="conversation-item">
                    <div class="conv-avatar">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <div class="conv-info">
                      <span class="conv-id">{{ conv.conversation_id | slice:0:20 }}...</span>
                      <span class="conv-time">{{ formatearFecha(conv.start_time_unix_secs) }}</span>
                    </div>
                    <div class="conv-stats">
                      <span class="conv-duration">{{ formatearDuracion(conv.call_duration_secs) }}</span>
                      <span class="conv-messages">{{ conv.message_count }} msgs</span>
                    </div>
                    <span class="badge" [ngClass]="obtenerClaseEstado(conv.status)">
                      {{ obtenerEtiquetaEstado(conv.status) }}
                    </span>
                    <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="9 18 15 12 9 6"/>
                    </svg>
                  </a>
                }
              </div>
            }
          </section>
        }
      </div>
    </app-layout>
  `,
  styles: [`
    .dashboard {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 32px;
      
      h1 {
        font-family: var(--font-display);
        font-size: 2rem;
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      .btn svg {
        width: 18px;
        height: 18px;
      }
    }
    
    .loading-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      
      .spinner {
        margin-bottom: 16px;
      }
      
      p {
        color: var(--text-secondary);
      }
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin-bottom: 24px;
    }
    
    .stat-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      padding: 24px;
      display: flex;
      align-items: center;
      gap: 20px;
      transition: all var(--transition-normal);
      
      &:hover {
        border-color: var(--color-primary);
        transform: translateY(-2px);
        box-shadow: var(--shadow-glow);
      }
    }
    
    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      
      svg {
        width: 28px;
        height: 28px;
      }
      
      &-primary {
        background: rgba(108, 92, 231, 0.15);
        color: var(--color-primary);
      }
      
      &-success {
        background: rgba(0, 184, 148, 0.15);
        color: var(--color-success);
      }
      
      &-info {
        background: rgba(116, 185, 255, 0.15);
        color: var(--color-info);
      }
      
      &-warning {
        background: rgba(253, 203, 110, 0.15);
        color: var(--color-warning);
      }
    }
    
    .stat-content {
      display: flex;
      flex-direction: column;
    }
    
    .stat-value {
      font-size: 1.75rem;
      font-weight: 700;
      line-height: 1.2;
    }
    
    .stat-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: 4px;
    }
    
    .secondary-stats {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 40px;
      padding: 20px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      margin-bottom: 32px;
    }
    
    .secondary-stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    
    .secondary-value {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-primary-light);
    }
    
    .secondary-label {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 4px;
    }
    
    .divider {
      width: 1px;
      height: 40px;
      background: var(--border-color);
    }
    
    .recent-section {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      padding: 24px;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      
      h2 {
        font-size: 1.1rem;
        font-weight: 600;
      }
    }
    
    .view-all {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.9rem;
      color: var(--color-primary-light);
      
      svg {
        width: 16px;
        height: 16px;
      }
      
      &:hover {
        color: var(--color-primary);
      }
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 40px;
      color: var(--text-muted);
      
      svg {
        width: 48px;
        height: 48px;
        margin-bottom: 12px;
        opacity: 0.5;
      }
    }
    
    .conversations-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .conversation-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
      background: var(--bg-input);
      border-radius: var(--border-radius);
      transition: all var(--transition-fast);
      
      &:hover {
        background: var(--bg-card-hover);
        
        .arrow {
          transform: translateX(4px);
          color: var(--color-primary);
        }
      }
    }
    
    .conv-avatar {
      width: 44px;
      height: 44px;
      background: var(--bg-card);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      
      svg {
        width: 22px;
        height: 22px;
        color: var(--text-secondary);
      }
    }
    
    .conv-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    
    .conv-id {
      font-size: 0.9rem;
      font-weight: 500;
      font-family: monospace;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .conv-time {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 2px;
    }
    
    .conv-stats {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
    }
    
    .conv-duration {
      font-size: 0.85rem;
      font-weight: 500;
    }
    
    .conv-messages {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .arrow {
      width: 20px;
      height: 20px;
      color: var(--text-muted);
      transition: all var(--transition-fast);
    }
    
    @media (max-width: 1200px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
    
    @media (max-width: 768px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }
      
      .secondary-stats {
        flex-direction: column;
        gap: 16px;
      }
      
      .divider {
        width: 100%;
        height: 1px;
      }
      
      .page-header {
        flex-direction: column;
        gap: 16px;
        
        .btn {
          width: 100%;
        }
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private servicioElevenLabs = inject(ElevenLabsService);
  private servicioAuth = inject(AuthService);
  
  // Lista completa de conversaciones para calcular estadísticas
  private todasLasConversaciones = signal<ConversationListItem[]>([]);
  
  // Estados de la UI
  cargando = signal(false);
  
  // Conversaciones recientes (las últimas 5)
  conversacionesRecientes = computed(() => {
    return this.todasLasConversaciones().slice(0, 5);
  });
  
  // ========== ESTADÍSTICAS CALCULADAS ==========
  
  // Total de llamadas
  totalLlamadas = computed(() => {
    return this.todasLasConversaciones().length;
  });
  
  // Tiempo total en minutos
  tiempoTotalMinutos = computed(() => {
    const totalSegundos = this.todasLasConversaciones().reduce((suma, conv) => {
      return suma + (conv.call_duration_secs || 0);
    }, 0);
    return Math.round(totalSegundos / 60);
  });
  
  // Total de mensajes
  totalMensajes = computed(() => {
    return this.todasLasConversaciones().reduce((suma, conv) => {
      return suma + (conv.message_count || 0);
    }, 0);
  });
  
  // Tasa de éxito (conversaciones exitosas / total)
  tasaExito = computed(() => {
    const total = this.todasLasConversaciones().length;
    if (total === 0) return 0;
    
    const exitosas = this.todasLasConversaciones().filter(
      conv => conv.status === 'done'
    ).length;
    
    return Math.round((exitosas / total) * 100);
  });
  
  // Llamadas de hoy
  llamadasHoy = computed(() => {
    const ahora = Math.floor(Date.now() / 1000);
    const hace24Horas = ahora - 86400; // 86400 segundos = 24 horas
    
    return this.todasLasConversaciones().filter(
      conv => conv.start_time_unix_secs >= hace24Horas
    ).length;
  });
  
  // Llamadas esta semana
  llamadasEstaSemana = computed(() => {
    const ahora = Math.floor(Date.now() / 1000);
    const hace7Dias = ahora - 604800; // 604800 segundos = 7 días
    
    return this.todasLasConversaciones().filter(
      conv => conv.start_time_unix_secs >= hace7Dias
    ).length;
  });
  
  // Duración promedio en minutos
  duracionPromedio = computed(() => {
    const total = this.todasLasConversaciones().length;
    if (total === 0) return 0;
    
    const totalSegundos = this.todasLasConversaciones().reduce((suma, conv) => {
      return suma + (conv.call_duration_secs || 0);
    }, 0);
    
    const promedioSegundos = totalSegundos / total;
    return Math.round(promedioSegundos / 60 * 10) / 10; // Redondear a 1 decimal
  });
  
  ngOnInit() {
    this.cargarDatos();
  }
  
  cargarDatos() {
    this.cargando.set(true);
    
    const idAgente = this.servicioAuth.getAgentId();
    
    // Cargar todas las conversaciones (máximo 100 para estadísticas)
    this.servicioElevenLabs.getConversations({ 
      agentId: idAgente || undefined,
      pageSize: 100 
    }).subscribe({
      next: (respuesta) => {
        console.log('Conversaciones cargadas:', respuesta);
        const conversaciones = respuesta.conversations || [];
        this.todasLasConversaciones.set(conversaciones);
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar conversaciones:', error);
        this.todasLasConversaciones.set([]);
        this.cargando.set(false);
      }
    });
  }
  
  formatearFecha(timestampUnix: number): string {
    const fecha = new Date(timestampUnix * 1000);
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);
    
    if (minutos < 60) {
      return `Hace ${minutos} min`;
    } else if (horas < 24) {
      return `Hace ${horas} horas`;
    } else if (dias < 7) {
      return `Hace ${dias} días`;
    } else {
      return fecha.toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
  
  formatearDuracion(segundos: number): string {
    if (!segundos || segundos === 0) return '0:00';
    const mins = Math.floor(segundos / 60);
    const segs = Math.round(segundos % 60);
    return `${mins}:${segs.toString().padStart(2, '0')}`;
  }
  
  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'done': return 'badge-success';
      case 'processing': return 'badge-warning';
      case 'failed': return 'badge-error';
      default: return 'badge-info';
    }
  }
  
  obtenerEtiquetaEstado(estado: string): string {
    switch (estado) {
      case 'done': return 'Exitoso';
      case 'processing': return 'En proceso';
      case 'failed': return 'Fallido';
      case 'initiated': return 'Iniciado';
      case 'timeout': return 'Tiempo agotado';
      default: return estado;
    }
  }
}
