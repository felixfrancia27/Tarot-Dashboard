import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { AuthService } from './auth.service';
import { 
  ConversationListItem, 
  ConversationListResponse,
  Conversation,
  DashboardStats
} from '../models/conversation.model';

const API_BASE = 'https://api.elevenlabs.io/v1/convai';

@Injectable({
  providedIn: 'root'
})
export class ElevenLabsService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  
  private getHeaders() {
    const apiKey = this.authService.getApiKey();
    return {
      'xi-api-key': apiKey || '',
      'Content-Type': 'application/json'
    };
  }
  
  /**
   * Lista todas las conversaciones
   * GET /v1/convai/conversations
   */
  getConversations(params?: {
    agentId?: string;
    userId?: string;
    pageSize?: number;
    cursor?: string;
  }): Observable<ConversationListResponse> {
    let httpParams = new HttpParams();
    
    if (params?.agentId) {
      httpParams = httpParams.set('agent_id', params.agentId);
    }
    if (params?.userId) {
      httpParams = httpParams.set('user_id', params.userId);
    }
    if (params?.pageSize) {
      httpParams = httpParams.set('page_size', params.pageSize.toString());
    }
    if (params?.cursor) {
      httpParams = httpParams.set('cursor', params.cursor);
    }
    
    return this.http.get<ConversationListResponse>(
      `${API_BASE}/conversations`,
      { 
        headers: this.getHeaders(),
        params: httpParams
      }
    );
  }
  
  /**
   * Obtiene los detalles completos de una conversación
   * GET /v1/convai/conversations/:conversation_id
   */
  getConversationDetails(conversationId: string): Observable<Conversation> {
    return this.http.get<Conversation>(
      `${API_BASE}/conversations/${conversationId}`,
      { headers: this.getHeaders() }
    );
  }
  
  /**
   * Obtiene el audio de una conversación (URL del MP3)
   * GET /v1/convai/conversations/:conversation_id/audio
   */
  getConversationAudioUrl(conversationId: string): string {
    const apiKey = this.authService.getApiKey();
    return `${API_BASE}/conversations/${conversationId}/audio?xi-api-key=${apiKey}`;
  }
  
  /**
   * Descarga el audio de una conversación como Blob
   */
  getConversationAudio(conversationId: string): Observable<Blob> {
    return this.http.get(
      `${API_BASE}/conversations/${conversationId}/audio`,
      { 
        headers: this.getHeaders(),
        responseType: 'blob'
      }
    );
  }
  
  /**
   * Elimina una conversación
   * DELETE /v1/convai/conversations/:conversation_id
   */
  deleteConversation(conversationId: string): Observable<void> {
    return this.http.delete<void>(
      `${API_BASE}/conversations/${conversationId}`,
      { headers: this.getHeaders() }
    );
  }
  
  /**
   * Envía feedback sobre una conversación
   * POST /v1/convai/conversations/:conversation_id/feedback
   */
  sendFeedback(conversationId: string, feedback: {
    rating?: number;
    comment?: string;
  }): Observable<void> {
    return this.http.post<void>(
      `${API_BASE}/conversations/${conversationId}/feedback`,
      feedback,
      { headers: this.getHeaders() }
    );
  }
  
  /**
   * Calcula estadísticas del dashboard a partir de las conversaciones
   */
  getDashboardStats(): Observable<DashboardStats> {
    const agentId = this.authService.getAgentId();
    
    return this.getConversations({ agentId: agentId || undefined, pageSize: 1000 }).pipe(
      map(response => {
        const conversations = response.conversations || [];
        const now = Math.floor(Date.now() / 1000);
        const oneDayAgo = now - 86400;
        const oneWeekAgo = now - 604800;
        
        const totalConversations = conversations.length;
        const totalDurationSecs = conversations.reduce((acc, c) => acc + (c.call_duration_secs || 0), 0);
        const totalMessages = conversations.reduce((acc, c) => acc + (c.message_count || 0), 0);
        const successfulCalls = conversations.filter(c => c.status === 'done').length;
        
        const conversationsToday = conversations.filter(
          c => c.start_time_unix_secs >= oneDayAgo
        ).length;
        
        const conversationsThisWeek = conversations.filter(
          c => c.start_time_unix_secs >= oneWeekAgo
        ).length;
        
        return {
          totalConversations,
          totalDurationMinutes: Math.round(totalDurationSecs / 60),
          avgDurationMinutes: totalConversations > 0 
            ? Math.round((totalDurationSecs / totalConversations) / 60 * 10) / 10 
            : 0,
          successRate: totalConversations > 0 
            ? Math.round((successfulCalls / totalConversations) * 100) 
            : 0,
          totalMessages,
          conversationsToday,
          conversationsThisWeek
        };
      }),
      catchError(() => of({
        totalConversations: 0,
        totalDurationMinutes: 0,
        avgDurationMinutes: 0,
        successRate: 0,
        totalMessages: 0,
        conversationsToday: 0,
        conversationsThisWeek: 0
      }))
    );
  }
}

