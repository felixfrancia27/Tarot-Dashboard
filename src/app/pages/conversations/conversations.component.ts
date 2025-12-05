import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../../components/layout/layout.component';
import { ElevenLabsService } from '../../services/elevenlabs.service';
import { AuthService } from '../../services/auth.service';
import { I18nService } from '../../services/i18n.service';
import { ConversationListItem } from '../../models/conversation.model';

@Component({
  selector: 'app-conversations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="conversations-page animate-fade-in">
        <header class="page-header">
          <div>
            <h1>{{ t().conversations_title }}</h1>
            <p class="text-secondary">{{ subtitulo() }}</p>
          </div>
          <div class="header-actions">
            <div class="search-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                type="text" 
                class="input search-input"
                [placeholder]="t().conversations_search"
                [(ngModel)]="terminoBusqueda"
                (input)="aplicarFiltros()"
              />
            </div>
            <button class="btn btn-secondary" (click)="cargarConversaciones()" [disabled]="cargando()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [class.animate-spin]="cargando()">
                <path d="M23 4v6h-6"/>
                <path d="M1 20v-6h6"/>
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
              </svg>
            </button>
          </div>
        </header>
        
        <!-- Filtros -->
        <div class="filters">
          <button 
            class="filter-btn"
            [class.active]="filtroEstado() === null"
            (click)="cambiarFiltroEstado(null)"
          >
            {{ t().conversations_filter_all }}
          </button>
          <button 
            class="filter-btn"
            [class.active]="filtroEstado() === 'done'"
            (click)="cambiarFiltroEstado('done')"
          >
            <span class="dot dot-success"></span>
            {{ etiquetaExitosas() }}
          </button>
          <button 
            class="filter-btn"
            [class.active]="filtroEstado() === 'processing'"
            (click)="cambiarFiltroEstado('processing')"
          >
            <span class="dot dot-warning"></span>
            {{ etiquetaProcesando() }}
          </button>
          <button 
            class="filter-btn"
            [class.active]="filtroEstado() === 'failed'"
            (click)="cambiarFiltroEstado('failed')"
          >
            <span class="dot dot-error"></span>
            {{ etiquetaFallidas() }}
          </button>
        </div>
        
        @if (cargando()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>{{ t().common_loading }}</p>
          </div>
        } @else if (conversacionesFiltradas().length === 0) {
          <div class="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <h3>{{ t().conversations_no_results }}</h3>
            <p>{{ mensajeVacio() }}</p>
          </div>
        } @else {
          <div class="conversations-table-container">
            <table class="conversations-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{{ encabezadoFecha() }}</th>
                  <th>{{ t().conversations_duration }}</th>
                  <th>{{ t().conversations_messages }}</th>
                  <th>{{ t().detail_status }}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                @for (conv of conversacionesFiltradas(); track conv.conversation_id) {
                  <tr class="table-row" [routerLink]="['/conversation', conv.conversation_id]">
                    <td>
                      <div class="conv-id-cell">
                        <span class="conv-id">{{ conv.conversation_id | slice:0:12 }}...</span>
                        @if (conv.user_id) {
                          <span class="user-id">{{ textoUsuario() }}: {{ conv.user_id | slice:0:10 }}...</span>
                        }
                      </div>
                    </td>
                    <td>
                      <div class="date-cell">
                        <span class="date">{{ formatearFecha(conv.start_time_unix_secs) }}</span>
                        <span class="time">{{ formatearHora(conv.start_time_unix_secs) }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="duration">{{ formatearDuracion(conv.call_duration_secs) }}</span>
                    </td>
                    <td>
                      <span class="messages">{{ conv.message_count }}</span>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="obtenerClaseEstado(conv.status)">
                        {{ obtenerEtiquetaEstado(conv.status) }}
                      </span>
                    </td>
                    <td>
                      <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="9 18 15 12 9 6"/>
                      </svg>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          
          <!-- Info de paginación -->
          <div class="pagination-info">
            <span>{{ textoPaginacion() }}</span>
            @if (hayMas()) {
              <button class="btn btn-secondary btn-sm" (click)="cargarMas()">
                {{ textoCargarMas() }}
              </button>
            }
          </div>
        }
      </div>
    </app-layout>
  `,
  styles: [`
    .conversations-page {
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      
      h1 {
        font-family: var(--font-display);
        font-size: 2rem;
        font-weight: 600;
        margin-bottom: 4px;
      }
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
    }
    
    .search-box {
      position: relative;
      
      svg {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        color: var(--text-muted);
      }
    }
    
    .search-input {
      padding-left: 44px;
      width: 280px;
    }
    
    .filters {
      display: flex;
      gap: 8px;
      margin-bottom: 24px;
    }
    
    .filter-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      font-family: var(--font-primary);
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--text-secondary);
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: 20px;
      cursor: pointer;
      transition: all var(--transition-fast);
      
      &:hover {
        border-color: var(--color-primary);
        color: var(--text-primary);
      }
      
      &.active {
        background: var(--color-primary);
        border-color: var(--color-primary);
        color: white;
      }
    }
    
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      
      &-success { background: var(--color-success); }
      &-warning { background: var(--color-warning); }
      &-error { background: var(--color-error); }
    }
    
    .loading-state, .empty-state {
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
        color: var(--text-muted);
        opacity: 0.5;
        margin-bottom: 16px;
      }
      
      h3 {
        font-size: 1.1rem;
        margin-bottom: 8px;
      }
      
      p {
        color: var(--text-secondary);
      }
    }
    
    .conversations-table-container {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-lg);
      overflow: hidden;
    }
    
    .conversations-table {
      width: 100%;
      border-collapse: collapse;
      
      th, td {
        padding: 16px 20px;
        text-align: left;
      }
      
      th {
        font-size: 0.8rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--text-muted);
        background: var(--bg-input);
        border-bottom: 1px solid var(--border-color);
      }
    }
    
    .table-row {
      cursor: pointer;
      transition: background var(--transition-fast);
      
      &:hover {
        background: var(--bg-card-hover);
        
        .arrow {
          transform: translateX(4px);
          color: var(--color-primary);
        }
      }
      
      &:not(:last-child) {
        border-bottom: 1px solid var(--border-color);
      }
    }
    
    .conv-id-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .conv-id {
      font-family: monospace;
      font-size: 0.9rem;
      font-weight: 500;
    }
    
    .user-id {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .date-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .date {
      font-size: 0.9rem;
    }
    
    .time {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    
    .duration {
      font-weight: 500;
      font-family: monospace;
    }
    
    .messages {
      font-weight: 500;
    }
    
    .arrow {
      width: 20px;
      height: 20px;
      color: var(--text-muted);
      transition: all var(--transition-fast);
    }
    
    .pagination-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-top: none;
      border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
      
      span {
        font-size: 0.85rem;
        color: var(--text-secondary);
      }
    }
    
    .btn-sm {
      padding: 8px 16px;
      font-size: 0.85rem;
    }
    
    @media (max-width: 1024px) {
      .page-header {
        flex-direction: column;
        gap: 16px;
      }
      
      .header-actions {
        width: 100%;
      }
      
      .search-input {
        width: 100%;
      }
    }
    
    @media (max-width: 768px) {
      .filters {
        flex-wrap: wrap;
      }
      
      .conversations-table {
        display: block;
        overflow-x: auto;
      }
    }
  `]
})
export class ConversationsComponent implements OnInit {
  private servicioElevenLabs = inject(ElevenLabsService);
  private servicioAuth = inject(AuthService);
  private i18n = inject(I18nService);
  
  // Datos
  todasLasConversaciones = signal<ConversationListItem[]>([]);
  
  // Estados de la UI
  cargando = signal(false);
  hayMas = signal(false);
  filtroEstado = signal<string | null>(null);
  terminoBusqueda = '';
  
  private cursor: string | undefined;
  
  // i18n
  t = computed(() => this.i18n.t());
  
  subtitulo = computed(() => {
    const lang = this.i18n.language();
    return lang === 'es' ? 'Historial completo de llamadas' : 'Complete call history';
  });
  
  etiquetaExitosas = computed(() => {
    return this.i18n.language() === 'es' ? 'Exitosas' : 'Successful';
  });
  
  etiquetaProcesando = computed(() => {
    return this.i18n.language() === 'es' ? 'En proceso' : 'Processing';
  });
  
  etiquetaFallidas = computed(() => {
    return this.i18n.language() === 'es' ? 'Fallidas' : 'Failed';
  });
  
  mensajeVacio = computed(() => {
    const lang = this.i18n.language();
    return lang === 'es' 
      ? 'No se encontraron conversaciones con los filtros seleccionados' 
      : 'No conversations found with the selected filters';
  });
  
  encabezadoFecha = computed(() => {
    return this.i18n.language() === 'es' ? 'Fecha' : 'Date';
  });
  
  textoUsuario = computed(() => {
    return this.i18n.language() === 'es' ? 'Usuario' : 'User';
  });
  
  textoPaginacion = computed(() => {
    const lang = this.i18n.language();
    const filtradas = this.conversacionesFiltradas().length;
    const total = this.todasLasConversaciones().length;
    
    return lang === 'es' 
      ? `Mostrando ${filtradas} de ${total} conversaciones`
      : `Showing ${filtradas} of ${total} conversations`;
  });
  
  textoCargarMas = computed(() => {
    return this.i18n.language() === 'es' ? 'Cargar más' : 'Load more';
  });
  
  // Conversaciones filtradas (calculado automáticamente)
  conversacionesFiltradas = computed(() => {
    let lista = this.todasLasConversaciones();
    
    // Aplicar filtro por estado
    const estado = this.filtroEstado();
    if (estado) {
      lista = lista.filter(conv => conv.status === estado);
    }
    
    // Aplicar filtro por búsqueda
    if (this.terminoBusqueda) {
      const termino = this.terminoBusqueda.toLowerCase();
      lista = lista.filter(conv => 
        conv.conversation_id.toLowerCase().includes(termino) ||
        (conv.user_id && conv.user_id.toLowerCase().includes(termino))
      );
    }
    
    return lista;
  });
  
  ngOnInit() {
    this.cargarConversaciones();
  }
  
  cargarConversaciones() {
    this.cargando.set(true);
    this.cursor = undefined;
    
    const idAgente = this.servicioAuth.getAgentId();
    
    this.servicioElevenLabs.getConversations({
      agentId: idAgente || undefined,
      pageSize: 50
    }).subscribe({
      next: (respuesta) => {
        console.log('Conversaciones cargadas:', respuesta);
        this.todasLasConversaciones.set(respuesta.conversations || []);
        this.hayMas.set(respuesta.has_more || false);
        this.cursor = respuesta.next_cursor;
        this.cargando.set(false);
      },
      error: (error) => {
        console.error('Error al cargar conversaciones:', error);
        this.cargando.set(false);
      }
    });
  }
  
  cargarMas() {
    if (!this.cursor) return;
    
    const idAgente = this.servicioAuth.getAgentId();
    
    this.servicioElevenLabs.getConversations({
      agentId: idAgente || undefined,
      pageSize: 50,
      cursor: this.cursor
    }).subscribe({
      next: (respuesta) => {
        const nuevasConversaciones = [...this.todasLasConversaciones(), ...(respuesta.conversations || [])];
        this.todasLasConversaciones.set(nuevasConversaciones);
        this.hayMas.set(respuesta.has_more || false);
        this.cursor = respuesta.next_cursor;
      },
      error: (error) => {
        console.error('Error al cargar más conversaciones:', error);
      }
    });
  }
  
  cambiarFiltroEstado(estado: string | null) {
    this.filtroEstado.set(estado);
  }
  
  aplicarFiltros() {
    // Los filtros se aplican automáticamente gracias a computed()
    // Esta función existe para el evento (input) del buscador
  }
  
  formatearFecha(timestampUnix: number): string {
    const locale = this.i18n.language() === 'es' ? 'es-ES' : 'en-US';
    return new Date(timestampUnix * 1000).toLocaleDateString(locale, {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }
  
  formatearHora(timestampUnix: number): string {
    const locale = this.i18n.language() === 'es' ? 'es-ES' : 'en-US';
    return new Date(timestampUnix * 1000).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    });
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
    const lang = this.i18n.language();
    switch (estado) {
      case 'done': return lang === 'es' ? 'Exitoso' : 'Success';
      case 'processing': return lang === 'es' ? 'En proceso' : 'Processing';
      case 'failed': return lang === 'es' ? 'Fallido' : 'Failed';
      case 'initiated': return lang === 'es' ? 'Iniciado' : 'Initiated';
      case 'timeout': return lang === 'es' ? 'Tiempo agotado' : 'Timeout';
      default: return estado;
    }
  }
}
