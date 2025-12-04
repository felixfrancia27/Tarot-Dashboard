import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LayoutComponent } from '../../components/layout/layout.component';
import { ElevenLabsService } from '../../services/elevenlabs.service';
import { Conversation, TranscriptTurn } from '../../models/conversation.model';

@Component({
  selector: 'app-conversation-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="detail-page animate-fade-in">
        <!-- Back Button -->
        <a routerLink="/conversations" class="back-link">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Volver a conversaciones
        </a>
        
        @if (isLoading()) {
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
            <button class="btn btn-primary" (click)="loadConversation()">Reintentar</button>
          </div>
        } @else if (conversation()) {
          <!-- Header -->
          <header class="detail-header">
            <div class="header-info">
              <h1>Conversación</h1>
              <div class="conv-id-wrapper">
                <code class="conv-id">{{ conversation()!.conversation_id }}</code>
                <button class="btn-copy" (click)="copyId()" [title]="copied() ? 'Copiado!' : 'Copiar ID'">
                  @if (copied()) {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  } @else {
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                    </svg>
                  }
                </button>
              </div>
            </div>
            <div class="header-actions">
              @if (conversation()!.has_audio) {
                <button class="btn btn-secondary" (click)="playAudio()">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Reproducir audio
                </button>
              }
            </div>
          </header>
          
          <!-- Stats Cards -->
          <div class="stats-row">
            <div class="stat-mini">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <div class="stat-content">
                <span class="value">{{ formatDuration(conversation()!.metadata.call_duration_secs) }}</span>
                <span class="label">Duración</span>
              </div>
            </div>
            
            <div class="stat-mini">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <div class="stat-content">
                <span class="value">{{ conversation()!.transcript?.length || 0 }}</span>
                <span class="label">Mensajes</span>
              </div>
            </div>
            
            <div class="stat-mini">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <div class="stat-content">
                <span class="value">{{ formatDateTime(conversation()!.metadata.start_time_unix_secs) }}</span>
                <span class="label">Fecha</span>
              </div>
            </div>
            
            <div class="stat-mini">
              <span class="badge" [ngClass]="getStatusClass(conversation()!.status)">
                {{ getStatusLabel(conversation()!.status) }}
              </span>
              <div class="stat-content">
                <span class="value">{{ conversation()!.metadata.termination_reason || 'Normal' }}</span>
                <span class="label">Estado final</span>
              </div>
            </div>
          </div>
          
          <!-- Main Content Grid -->
          <div class="content-grid">
            <!-- Transcript Section -->
            <section class="transcript-section">
              <h2>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Transcripción
              </h2>
              
              <div class="transcript-container">
                @for (turn of conversation()!.transcript; track $index) {
                  <div class="message" [class.user]="turn.role === 'user'" [class.agent]="turn.role === 'agent'">
                    <div class="message-header">
                      <span class="role">{{ turn.role === 'user' ? 'Usuario' : 'Agente' }}</span>
                      <span class="time">{{ formatSeconds(turn.time_in_call_secs) }}</span>
                    </div>
                    <div class="message-content">
                      {{ turn.message }}
                    </div>
                    @if (turn.tool_calls && turn.tool_calls.length > 0) {
                      <div class="tool-calls">
                        <span class="tool-label">Tools:</span>
                        @for (tool of turn.tool_calls; track $index) {
                          <span class="tool-name">{{ tool.tool_name }}</span>
                        }
                      </div>
                    }
                  </div>
                }
              </div>
            </section>
            
            <!-- Sidebar with Analysis & Metadata -->
            <aside class="detail-sidebar">
              <!-- Analysis -->
              @if (conversation()!.analysis) {
                <div class="sidebar-card">
                  <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                    Análisis
                  </h3>
                  
                  @if (conversation()!.analysis?.transcript_summary) {
                    <div class="analysis-item">
                      <span class="analysis-label">Resumen</span>
                      <p class="analysis-value summary">{{ conversation()!.analysis!.transcript_summary }}</p>
                    </div>
                  }
                  
                  @if (conversation()!.analysis?.call_successful) {
                    <div class="analysis-item">
                      <span class="analysis-label">Resultado</span>
                      <span class="badge" [ngClass]="conversation()!.analysis!.call_successful === 'success' ? 'badge-success' : 'badge-warning'">
                        {{ conversation()!.analysis!.call_successful }}
                      </span>
                    </div>
                  }
                </div>
              }
              
              <!-- Metadata -->
              <div class="sidebar-card">
                <h3>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="16" x2="12" y2="12"/>
                    <line x1="12" y1="8" x2="12.01" y2="8"/>
                  </svg>
                  Metadatos
                </h3>
                
                <div class="metadata-list">
                  <div class="metadata-item">
                    <span class="meta-label">Agent ID</span>
                    <code class="meta-value">{{ conversation()!.agent_id | slice:0:20 }}...</code>
                  </div>
                  
                  @if (conversation()!.user_id) {
                    <div class="metadata-item">
                      <span class="meta-label">User ID</span>
                      <code class="meta-value">{{ conversation()!.user_id }}</code>
                    </div>
                  }
                  
                  @if (conversation()!.metadata.cost !== undefined) {
                    <div class="metadata-item">
                      <span class="meta-label">Costo</span>
                      <span class="meta-value cost">\${{ conversation()!.metadata.cost!.toFixed(4) }}</span>
                    </div>
                  }
                  
                  @if (conversation()!.metadata.charging?.credits_used !== undefined) {
                    <div class="metadata-item">
                      <span class="meta-label">Créditos</span>
                      <span class="meta-value">{{ conversation()!.metadata.charging!.credits_used }}</span>
                    </div>
                  }
                  
                  @if (conversation()!.metadata.authorization_method) {
                    <div class="metadata-item">
                      <span class="meta-label">Auth</span>
                      <span class="meta-value">{{ conversation()!.metadata.authorization_method }}</span>
                    </div>
                  }
                </div>
              </div>
              
              <!-- Dynamic Variables -->
              @if (conversation()!.conversation_initiation_client_data?.dynamic_variables) {
                <div class="sidebar-card">
                  <h3>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="4 17 10 11 4 5"/>
                      <line x1="12" y1="19" x2="20" y2="19"/>
                    </svg>
                    Variables
                  </h3>
                  <div class="metadata-list">
                    @for (item of getDynamicVariables(); track item.key) {
                      <div class="metadata-item">
                        <span class="meta-label">{{ item.key }}</span>
                        <span class="meta-value">{{ item.value }}</span>
                      </div>
                    }
                  </div>
                </div>
              }
            </aside>
          </div>
          
          <!-- Audio Player (hidden, controlled programmatically) -->
          @if (audioUrl()) {
            <audio #audioPlayer [src]="audioUrl()" style="display: none;"></audio>
          }
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
      
      h1 {
        font-family: var(--font-display);
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 8px;
      }
    }
    
    .conv-id-wrapper {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .conv-id {
      font-size: 0.85rem;
      padding: 6px 12px;
      background: var(--bg-input);
      border-radius: var(--border-radius);
      color: var(--text-secondary);
    }
    
    .btn-copy {
      background: transparent;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color var(--transition-fast);
      
      svg {
        width: 18px;
        height: 18px;
      }
      
      &:hover {
        color: var(--color-primary);
      }
    }
    
    .header-actions {
      display: flex;
      gap: 12px;
      
      svg {
        width: 18px;
        height: 18px;
      }
    }
    
    .stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
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
      }
      
      .label {
        font-size: 0.75rem;
        color: var(--text-muted);
        margin-top: 2px;
      }
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
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
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
    
    .tool-calls {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid var(--border-color);
    }
    
    .tool-label {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .tool-name {
      font-size: 0.75rem;
      padding: 4px 8px;
      background: var(--bg-card);
      border-radius: 4px;
      color: var(--color-warning);
      font-family: monospace;
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
        font-size: 0.9rem;
        font-weight: 600;
        margin-bottom: 16px;
        
        svg {
          width: 18px;
          height: 18px;
          color: var(--color-primary);
        }
      }
    }
    
    .analysis-item {
      margin-bottom: 14px;
      
      &:last-child {
        margin-bottom: 0;
      }
    }
    
    .analysis-label {
      display: block;
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .analysis-value {
      font-size: 0.9rem;
      
      &.summary {
        line-height: 1.5;
        color: var(--text-secondary);
      }
    }
    
    .metadata-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .metadata-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
    }
    
    .meta-label {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    
    .meta-value {
      font-size: 0.85rem;
      text-align: right;
      
      &.cost {
        color: var(--color-success);
        font-weight: 600;
      }
    }
    
    code.meta-value {
      font-size: 0.75rem;
      padding: 4px 8px;
      background: var(--bg-input);
      border-radius: 4px;
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
  private elevenLabsService = inject(ElevenLabsService);
  
  conversation = signal<Conversation | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  copied = signal(false);
  audioUrl = signal<string | null>(null);
  
  private conversationId = '';
  
  ngOnInit() {
    this.conversationId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.conversationId) {
      this.router.navigate(['/conversations']);
      return;
    }
    this.loadConversation();
  }
  
  loadConversation() {
    this.isLoading.set(true);
    this.error.set(null);
    
    this.elevenLabsService.getConversationDetails(this.conversationId).subscribe({
      next: (conversation) => {
        this.conversation.set(conversation);
        this.isLoading.set(false);
        
        // Preparar URL de audio si está disponible
        if (conversation.has_audio) {
          this.audioUrl.set(
            this.elevenLabsService.getConversationAudioUrl(this.conversationId)
          );
        }
      },
      error: (err) => {
        console.error('Error loading conversation:', err);
        this.error.set(
          err.status === 404 
            ? 'Conversación no encontrada' 
            : 'Error al cargar la conversación'
        );
        this.isLoading.set(false);
      }
    });
  }
  
  copyId() {
    navigator.clipboard.writeText(this.conversation()?.conversation_id || '');
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }
  
  playAudio() {
    const url = this.audioUrl();
    if (url) {
      window.open(url, '_blank');
    }
  }
  
  getDynamicVariables(): { key: string; value: string }[] {
    const vars = this.conversation()?.conversation_initiation_client_data?.dynamic_variables;
    if (!vars) return [];
    return Object.entries(vars).map(([key, value]) => ({ key, value }));
  }
  
  formatDuration(secs: number): string {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
  
  formatSeconds(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
  
  formatDateTime(unixSecs: number): string {
    return new Date(unixSecs * 1000).toLocaleString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  getStatusClass(status: string): string {
    switch (status) {
      case 'done': return 'badge-success';
      case 'processing': return 'badge-warning';
      case 'failed': return 'badge-error';
      default: return 'badge-info';
    }
  }
  
  getStatusLabel(status: string): string {
    switch (status) {
      case 'done': return 'Exitoso';
      case 'processing': return 'En proceso';
      case 'failed': return 'Fallido';
      case 'initiated': return 'Iniciado';
      default: return status;
    }
  }
}

