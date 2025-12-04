import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LayoutComponent } from '../../components/layout/layout.component';
import { ElevenLabsService } from '../../services/elevenlabs.service';
import { AuthService } from '../../services/auth.service';
import { Conversation } from '../../models/conversation.model';

@Component({
  selector: 'app-conversation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="detail-page animate-fade-in">
        <!-- Botón Volver -->
        <a routerLink="/conversations" class="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Volver a conversaciones
        </a>
        
        @if (cargando()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Cargando conversación...</p>
          </div>
        } @else if (error()) {
          <div class="error-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h3>Error al cargar la conversación</h3>
            <p>{{ error() }}</p>
            <button class="btn btn-primary" (click)="cargarConversacion()">Reintentar</button>
          </div>
        } @else if (conversacion()) {
          <!-- Encabezado -->
          <header class="detail-header">
            <div class="header-info">
              <div class="agent-badge">
                <span class="agent-icon">🔮</span>
                <span class="agent-name">{{ nombreAgente }}</span>
              </div>
              <h1>{{ nombreLlamada() }}</h1>
              <p class="fecha-llamada">{{ fechaCompleta() }}</p>
            </div>
            <div class="header-actions">
              <button class="btn btn-secondary btn-disabled" disabled title="Disponible próximamente">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                Escuchar grabación
                <span class="coming-soon">Próximamente</span>
              </button>
            </div>
          </header>
          
          <!-- Tarjetas de Estadísticas -->
          <div class="stats-row">
            <div class="stat-mini">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <div class="stat-content">
                <span class="value">{{ formatearDuracion(conversacion()!.metadata.call_duration_secs) }}</span>
                <span class="label">Duración</span>
              </div>
            </div>
            
            <div class="stat-mini">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <div class="stat-content">
                <span class="value">{{ conversacion()!.transcript?.length || 0 }}</span>
                <span class="label">Mensajes</span>
              </div>
            </div>
            
            <div class="stat-mini">
              <span class="badge badge-lg" [ngClass]="obtenerClaseEstado(conversacion()!.status)">
                {{ obtenerEtiquetaEstado(conversacion()!.status) }}
              </span>
              <div class="stat-content">
                <span class="value">{{ traducirRazonFinalizacion(conversacion()!.metadata.termination_reason) }}</span>
                <span class="label">Finalización</span>
              </div>
            </div>
            
            @if (conversacion()!.metadata.cost !== undefined) {
              <div class="stat-mini">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                <div class="stat-content">
                  <span class="value cost">\${{ conversacion()!.metadata.cost!.toFixed(4) }}</span>
                  <span class="label">Costo</span>
                </div>
              </div>
            }
          </div>
          
          <!-- Contenido Principal -->
          <div class="content-grid">
            <!-- Sección de Transcripción -->
            <section class="transcript-section">
              <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Transcripción de la llamada
              </h2>
              
              <div class="transcript-container">
                @for (turno of conversacion()!.transcript; track $index) {
                  <div class="message" [class.user]="turno.role === 'user'" [class.agent]="turno.role === 'agent'">
                    <div class="message-header">
                      <span class="role">{{ turno.role === 'user' ? '👤 Cliente' : '🔮 ' + nombreAgente }}</span>
                      <span class="time">{{ formatearSegundos(turno.time_in_call_secs) }}</span>
                    </div>
                    <div class="message-content">
                      {{ turno.message }}
                    </div>
                  </div>
                }
              </div>
            </section>
            
            <!-- Barra lateral con Análisis -->
            <aside class="detail-sidebar">
              <!-- Agente que atendió -->
              <div class="sidebar-card agent-card">
                <div class="agent-header">
                  <div class="agent-avatar">🔮</div>
                  <div class="agent-info-sidebar">
                    <span class="agent-name-big">{{ nombreAgente }}</span>
                    <span class="agent-role">Agente de esta llamada</span>
                  </div>
                </div>
                <p class="agent-note">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  Puedes tener múltiples agentes configurados
                </p>
              </div>
              
              <!-- Análisis / Resumen -->
              @if (conversacion()!.analysis) {
                <div class="sidebar-card">
                  <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Resumen de la llamada
                  </h3>
                  
                  @if (conversacion()!.analysis?.transcript_summary) {
                    <div class="analysis-item">
                      <p class="analysis-value summary">{{ conversacion()!.analysis!.transcript_summary }}</p>
                      <p class="auto-generated-note">
                        <small>📝 Resumen generado automáticamente por IA</small>
                      </p>
                    </div>
                  }
                  
                  @if (conversacion()!.analysis?.call_successful) {
                    <div class="analysis-item resultado">
                      <span class="analysis-label">Resultado de la llamada</span>
                      <span class="badge badge-lg" [ngClass]="conversacion()!.analysis!.call_successful === 'success' ? 'badge-success' : 'badge-warning'">
                        {{ traducirResultado(conversacion()!.analysis!.call_successful) }}
                      </span>
                    </div>
                  }
                </div>
              }
              
              <!-- Info adicional simple -->
              <div class="sidebar-card info-card">
                <div class="info-item">
                  <span class="info-icon">📅</span>
                  <div class="info-content">
                    <span class="info-label">Fecha</span>
                    <span class="info-value">{{ fechaCorta() }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <span class="info-icon">🕐</span>
                  <div class="info-content">
                    <span class="info-label">Hora</span>
                    <span class="info-value">{{ horaLlamada() }}</span>
                  </div>
                </div>
                <div class="info-item">
                  <span class="info-icon">⏱️</span>
                  <div class="info-content">
                    <span class="info-label">Duración</span>
                    <span class="info-value">{{ duracionLegible() }}</span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        }
      </div>
    </app-layout>
  `,
  styles: [`
    .detail-page {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin-bottom: 24px;
      
      svg {
        width: 18px;
        height: 18px;
      }
      
      &:hover {
        color: var(--color-primary-light);
      }
    }
    
    .loading-state, .error-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      
      .spinner {
        margin-bottom: 16px;
      }
      
      svg {
        width: 64px;
        height: 64px;
        color: var(--color-error);
        margin-bottom: 16px;
      }
      
      h3 {
        font-size: 1.1rem;
        margin-bottom: 8px;
      }
      
      p {
        color: var(--text-secondary);
        margin-bottom: 20px;
      }
    }
    
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }
    
    .agent-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: rgba(108, 92, 231, 0.15);
      border: 1px solid rgba(108, 92, 231, 0.3);
      border-radius: 20px;
      margin-bottom: 12px;
      
      .agent-icon {
        font-size: 1rem;
      }
      
      .agent-name {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--color-primary-light);
      }
    }
    
    .header-info {
      h1 {
        font-family: var(--font-display);
        font-size: 1.75rem;
        font-weight: 600;
        margin-bottom: 6px;
      }
    }
    
    .fecha-llamada {
      font-size: 0.95rem;
      color: var(--text-secondary);
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
      
      svg {
        width: 18px;
        height: 18px;
      }
    }
    
    .btn-disabled {
      opacity: 0.6;
      cursor: not-allowed;
      position: relative;
      
      &:hover {
        transform: none;
        box-shadow: none;
      }
    }
    
    .coming-soon {
      font-size: 0.65rem;
      padding: 2px 6px;
      background: var(--color-warning);
      color: var(--bg-primary);
      border-radius: 4px;
      margin-left: 8px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .stat-mini {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      
      > svg {
        width: 28px;
        height: 28px;
        color: var(--color-primary);
        flex-shrink: 0;
      }
      
      .stat-content {
        display: flex;
        flex-direction: column;
      }
      
      .value {
        font-size: 1rem;
        font-weight: 600;
        
        &.cost {
          color: var(--color-success);
        }
      }
      
      .label {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 2px;
      }
    }
    
    .badge-lg {
      padding: 8px 14px;
      font-size: 0.85rem;
    }
    
    .content-grid {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 24px;
    }
    
    .transcript-section {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      
      h2 {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 20px 24px;
        font-size: 1rem;
        font-weight: 600;
        border-bottom: 1px solid var(--border-color);
        
        svg {
          width: 20px;
          height: 20px;
          color: var(--color-primary);
        }
      }
    }
    
    .transcript-container {
      padding: 24px;
      max-height: 600px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .message {
      padding: 16px;
      border-radius: var(--border-radius);
      max-width: 85%;
      
      &.user {
        background: var(--bg-input);
        margin-left: auto;
        
        .role {
          color: var(--color-info);
        }
      }
      
      &.agent {
        background: rgba(108, 92, 231, 0.1);
        border: 1px solid rgba(108, 92, 231, 0.2);
        
        .role {
          color: var(--color-primary-light);
        }
      }
    }
    
    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .role {
      font-size: 0.85rem;
      font-weight: 600;
    }
    
    .time {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: monospace;
    }
    
    .message-content {
      font-size: 0.95rem;
      line-height: 1.6;
    }
    
    .detail-sidebar {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .sidebar-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      padding: 20px;
      
      h3 {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.95rem;
        font-weight: 600;
        margin-bottom: 16px;
        
        svg {
          width: 18px;
          height: 18px;
          color: var(--color-primary);
        }
      }
    }
    
    .agent-card {
      background: linear-gradient(135deg, rgba(108, 92, 231, 0.1), rgba(162, 155, 254, 0.05));
      border-color: rgba(108, 92, 231, 0.3);
    }
    
    .agent-header {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 14px;
    }
    
    .agent-avatar {
      width: 50px;
      height: 50px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-accent));
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    
    .agent-info-sidebar {
      display: flex;
      flex-direction: column;
    }
    
    .agent-name-big {
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .agent-role {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    
    .agent-note {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: var(--text-secondary);
      padding: 10px 12px;
      background: rgba(0, 0, 0, 0.2);
      border-radius: var(--border-radius);
      
      svg {
        width: 14px;
        height: 14px;
        flex-shrink: 0;
      }
    }
    
    .analysis-item {
      margin-bottom: 16px;
      
      &:last-child {
        margin-bottom: 0;
      }
      
      &.resultado {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 16px;
        border-top: 1px solid var(--border-color);
      }
    }
    
    .analysis-label {
      font-size: 0.85rem;
      color: var(--text-secondary);
    }
    
    .analysis-value {
      font-size: 0.95rem;
      
      &.summary {
        line-height: 1.6;
        color: var(--text-primary);
      }
    }
    
    .auto-generated-note {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed var(--border-color);
      
      small {
        color: var(--text-muted);
        font-size: 0.75rem;
      }
    }
    
    .info-card {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    
    .info-icon {
      font-size: 1.5rem;
    }
    
    .info-content {
      display: flex;
      flex-direction: column;
    }
    
    .info-label {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .info-value {
      font-size: 0.95rem;
      font-weight: 500;
    }
    
    @media (max-width: 1200px) {
      .content-grid {
        grid-template-columns: 1fr;
      }
      
      .detail-sidebar {
        order: -1;
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      }
    }
    
    @media (max-width: 768px) {
      .stats-row {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .detail-header {
        flex-direction: column;
        gap: 16px;
      }
      
      .header-actions {
        width: 100%;
        
        .btn {
          flex: 1;
        }
      }
    }
  `]
})
export class ConversationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private servicioElevenLabs = inject(ElevenLabsService);
  private servicioAuth = inject(AuthService);
  
  conversacion = signal<Conversation | null>(null);
  cargando = signal(false);
  error = signal<string | null>(null);
  
  private idConversacion = '';
  
  // Nombre del agente (viene de la configuración del cliente)
  nombreAgente = 'Luz';
  
  ngOnInit() {
    // Obtener nombre del agente desde la sesión
    const credenciales = this.servicioAuth.getCredentials();
    if (credenciales?.agentName) {
      // Extraer solo el primer nombre del agente
      this.nombreAgente = credenciales.agentName.split(' - ')[0].split('-')[0].trim();
    }
    
    this.idConversacion = this.route.snapshot.paramMap.get('id') || '';
    if (!this.idConversacion) {
      this.router.navigate(['/conversations']);
      return;
    }
    this.cargarConversacion();
  }
  
  cargarConversacion() {
    this.cargando.set(true);
    this.error.set(null);
    
    this.servicioElevenLabs.getConversationDetails(this.idConversacion).subscribe({
      next: (conversacion) => {
        this.conversacion.set(conversacion);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar conversación:', err);
        this.error.set(
          err.status === 404 
            ? 'Conversación no encontrada' 
            : 'Error al cargar la conversación'
        );
        this.cargando.set(false);
      }
    });
  }
  
  // ========== FORMATEO DE NOMBRES AMIGABLES ==========
  
  nombreLlamada(): string {
    const conv = this.conversacion();
    if (!conv) return 'Llamada';
    
    const fecha = new Date(conv.metadata.start_time_unix_secs * 1000);
    const dia = fecha.getDate();
    const mes = fecha.toLocaleDateString('es-ES', { month: 'long' });
    return `Llamada del ${dia} de ${mes}`;
  }
  
  fechaCompleta(): string {
    const conv = this.conversacion();
    if (!conv) return '';
    
    return new Date(conv.metadata.start_time_unix_secs * 1000).toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  fechaCorta(): string {
    const conv = this.conversacion();
    if (!conv) return '';
    
    return new Date(conv.metadata.start_time_unix_secs * 1000).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
  
  horaLlamada(): string {
    const conv = this.conversacion();
    if (!conv) return '';
    
    return new Date(conv.metadata.start_time_unix_secs * 1000).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  duracionLegible(): string {
    const conv = this.conversacion();
    if (!conv) return '';
    
    const secs = conv.metadata.call_duration_secs;
    const mins = Math.floor(secs / 60);
    const segs = Math.round(secs % 60);
    
    if (mins === 0) {
      return `${segs} segundos`;
    } else if (mins === 1) {
      return segs > 0 ? `1 minuto ${segs} seg` : '1 minuto';
    } else {
      return segs > 0 ? `${mins} minutos ${segs} seg` : `${mins} minutos`;
    }
  }
  
  formatearDuracion(secs: number): string {
    const mins = Math.floor(secs / 60);
    const segs = Math.round(secs % 60);
    return `${mins}:${segs.toString().padStart(2, '0')}`;
  }
  
  formatearSegundos(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
  
  // ========== TRADUCCIONES ==========
  
  traducirRazonFinalizacion(razon: string | undefined): string {
    if (!razon) return 'Normal';
    
    const traducciones: Record<string, string> = {
      'user_ended': 'El cliente finalizó',
      'agent_ended': 'El agente finalizó',
      'timeout': 'Tiempo agotado',
      'error': 'Error en la llamada',
      'user_hangup': 'El cliente colgó',
      'agent_hangup': 'El agente colgó',
      'normal': 'Finalización normal',
      'completed': 'Llamada completada',
      'no_answer': 'Sin respuesta',
      'busy': 'Línea ocupada',
      'failed': 'Llamada fallida',
      'call ended by remote party': 'El cliente finalizó la llamada',
      'call_ended_by_remote_party': 'El cliente finalizó la llamada'
    };
    
    return traducciones[razon.toLowerCase()] || razon;
  }
  
  traducirResultado(resultado: string): string {
    const traducciones: Record<string, string> = {
      'success': '✅ Exitosa',
      'failure': '❌ No exitosa',
      'partial': '⚠️ Parcial',
      'unknown': 'Sin determinar'
    };
    
    return traducciones[resultado.toLowerCase()] || resultado;
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
      case 'done': return '✅ Completada';
      case 'processing': return '⏳ En proceso';
      case 'failed': return '❌ Fallida';
      case 'initiated': return '📞 Iniciada';
      case 'timeout': return '⏱️ Tiempo agotado';
      default: return estado;
    }
  }
}
