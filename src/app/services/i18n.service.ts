import { Injectable, signal, computed } from '@angular/core';

export type Language = 'es' | 'en';

const STORAGE_KEY = 'tarot_dashboard_language';

export interface Translations {
  // Login
  login_title: string;
  login_subtitle: string;
  login_username: string;
  login_username_placeholder: string;
  login_password: string;
  login_password_placeholder: string;
  login_button: string;
  login_loading: string;
  login_error_empty: string;
  login_error_user_not_found: string;
  login_error_wrong_password: string;
  login_powered_by: string;
  login_select_language: string;
  
  // Sidebar
  sidebar_dashboard: string;
  sidebar_conversations: string;
  sidebar_logout: string;
  
  // Dashboard
  dashboard_title: string;
  dashboard_total_calls: string;
  dashboard_total_duration: string;
  dashboard_total_messages: string;
  dashboard_success_rate: string;
  dashboard_calls_today: string;
  dashboard_calls_week: string;
  dashboard_avg_duration: string;
  dashboard_recent_calls: string;
  dashboard_view_all: string;
  dashboard_no_calls: string;
  dashboard_loading: string;
  dashboard_error: string;
  
  // Conversations
  conversations_title: string;
  conversations_search: string;
  conversations_filter_all: string;
  conversations_filter_completed: string;
  conversations_filter_pending: string;
  conversations_no_results: string;
  conversations_duration: string;
  conversations_messages: string;
  conversations_view_detail: string;
  
  // Conversation Detail
  detail_back: string;
  detail_call_of: string;
  detail_listen_recording: string;
  detail_coming_soon: string;
  detail_copy_id: string;
  detail_copied: string;
  detail_duration: string;
  detail_messages: string;
  detail_status: string;
  detail_termination: string;
  detail_transcription: string;
  detail_agent_card_title: string;
  detail_agent_card_subtitle: string;
  detail_agent_card_note: string;
  detail_analysis_title: string;
  detail_analysis_summary: string;
  detail_analysis_result: string;
  detail_analysis_auto_generated: string;
  detail_status_completed: string;
  detail_status_pending: string;
  detail_status_failed: string;
  detail_result_success: string;
  detail_result_failed: string;
  detail_result_user_ended: string;
  detail_result_agent_ended: string;
  detail_result_timeout: string;
  detail_result_unknown: string;
  detail_termination_remote: string;
  detail_termination_agent: string;
  detail_termination_timeout: string;
  detail_termination_error: string;
  detail_termination_normal: string;
  
  // Common
  common_loading: string;
  common_error: string;
  common_retry: string;
  common_client: string;
  common_agent: string;
  common_minutes: string;
  common_seconds: string;
}

const translations: Record<Language, Translations> = {
  es: {
    // Login
    login_title: 'Tarot Dashboard',
    login_subtitle: 'Panel de control de llamadas',
    login_username: 'Usuario',
    login_username_placeholder: 'Ingresa tu usuario',
    login_password: 'Contraseña',
    login_password_placeholder: 'Ingresa tu contraseña',
    login_button: 'Ingresar',
    login_loading: 'Ingresando...',
    login_error_empty: 'Por favor completa todos los campos',
    login_error_user_not_found: 'Usuario no encontrado',
    login_error_wrong_password: 'Contraseña incorrecta',
    login_powered_by: 'Conectado con',
    login_select_language: 'Idioma',
    
    // Sidebar
    sidebar_dashboard: 'Dashboard',
    sidebar_conversations: 'Conversaciones',
    sidebar_logout: 'Cerrar sesión',
    
    // Dashboard
    dashboard_title: 'Panel de Control',
    dashboard_total_calls: 'Total Llamadas',
    dashboard_total_duration: 'Duración Total',
    dashboard_total_messages: 'Mensajes Totales',
    dashboard_success_rate: 'Tasa de Éxito',
    dashboard_calls_today: 'Llamadas Hoy',
    dashboard_calls_week: 'Esta Semana',
    dashboard_avg_duration: 'Duración Promedio',
    dashboard_recent_calls: 'Llamadas Recientes',
    dashboard_view_all: 'Ver todas',
    dashboard_no_calls: 'No hay llamadas registradas aún.',
    dashboard_loading: 'Cargando estadísticas...',
    dashboard_error: 'Error al cargar datos',
    
    // Conversations
    conversations_title: 'Conversaciones',
    conversations_search: 'Buscar conversaciones...',
    conversations_filter_all: 'Todas',
    conversations_filter_completed: 'Completadas',
    conversations_filter_pending: 'Pendientes',
    conversations_no_results: 'No se encontraron conversaciones.',
    conversations_duration: 'Duración',
    conversations_messages: 'Mensajes',
    conversations_view_detail: 'Ver detalle',
    
    // Conversation Detail
    detail_back: 'Volver a conversaciones',
    detail_call_of: 'Llamada del',
    detail_listen_recording: 'Escuchar grabación',
    detail_coming_soon: 'Próximamente',
    detail_copy_id: 'Copiar ID',
    detail_copied: '¡Copiado!',
    detail_duration: 'Duración',
    detail_messages: 'Mensajes',
    detail_status: 'Estado',
    detail_termination: 'Finalización',
    detail_transcription: 'Transcripción de la llamada',
    detail_agent_card_title: 'Agente de esta llamada',
    detail_agent_card_subtitle: 'Agente de esta llamada',
    detail_agent_card_note: 'Puedes tener múltiples agentes configurados.',
    detail_analysis_title: 'Resumen de la llamada',
    detail_analysis_summary: 'Resumen',
    detail_analysis_result: 'Resultado de la llamada',
    detail_analysis_auto_generated: '📝 Resumen generado automáticamente por IA',
    detail_status_completed: 'COMPLETADA',
    detail_status_pending: 'PENDIENTE',
    detail_status_failed: 'FALLIDA',
    detail_result_success: '✅ Exitosa',
    detail_result_failed: '❌ Fallida',
    detail_result_user_ended: 'El cliente finalizó',
    detail_result_agent_ended: 'El agente finalizó',
    detail_result_timeout: 'Tiempo agotado',
    detail_result_unknown: 'Desconocido',
    detail_termination_remote: 'El cliente finalizó la llamada',
    detail_termination_agent: 'El agente finalizó la llamada',
    detail_termination_timeout: 'Tiempo agotado',
    detail_termination_error: 'Error técnico',
    detail_termination_normal: 'Normal',
    
    // Common
    common_loading: 'Cargando...',
    common_error: 'Error',
    common_retry: 'Reintentar',
    common_client: 'Cliente',
    common_agent: 'Agente',
    common_minutes: 'min',
    common_seconds: 'seg',
  },
  
  en: {
    // Login
    login_title: 'Tarot Dashboard',
    login_subtitle: 'Call control panel',
    login_username: 'Username',
    login_username_placeholder: 'Enter your username',
    login_password: 'Password',
    login_password_placeholder: 'Enter your password',
    login_button: 'Sign In',
    login_loading: 'Signing in...',
    login_error_empty: 'Please fill in all fields',
    login_error_user_not_found: 'User not found',
    login_error_wrong_password: 'Incorrect password',
    login_powered_by: 'Powered by',
    login_select_language: 'Language',
    
    // Sidebar
    sidebar_dashboard: 'Dashboard',
    sidebar_conversations: 'Conversations',
    sidebar_logout: 'Sign out',
    
    // Dashboard
    dashboard_title: 'Dashboard',
    dashboard_total_calls: 'Total Calls',
    dashboard_total_duration: 'Total Duration',
    dashboard_total_messages: 'Total Messages',
    dashboard_success_rate: 'Success Rate',
    dashboard_calls_today: 'Calls Today',
    dashboard_calls_week: 'This Week',
    dashboard_avg_duration: 'Avg Duration',
    dashboard_recent_calls: 'Recent Calls',
    dashboard_view_all: 'View all',
    dashboard_no_calls: 'No calls recorded yet.',
    dashboard_loading: 'Loading statistics...',
    dashboard_error: 'Error loading data',
    
    // Conversations
    conversations_title: 'Conversations',
    conversations_search: 'Search conversations...',
    conversations_filter_all: 'All',
    conversations_filter_completed: 'Completed',
    conversations_filter_pending: 'Pending',
    conversations_no_results: 'No conversations found.',
    conversations_duration: 'Duration',
    conversations_messages: 'Messages',
    conversations_view_detail: 'View detail',
    
    // Conversation Detail
    detail_back: 'Back to conversations',
    detail_call_of: 'Call from',
    detail_listen_recording: 'Listen recording',
    detail_coming_soon: 'Coming soon',
    detail_copy_id: 'Copy ID',
    detail_copied: 'Copied!',
    detail_duration: 'Duration',
    detail_messages: 'Messages',
    detail_status: 'Status',
    detail_termination: 'Termination',
    detail_transcription: 'Call transcription',
    detail_agent_card_title: 'Call agent',
    detail_agent_card_subtitle: 'Agent for this call',
    detail_agent_card_note: 'You can have multiple agents configured.',
    detail_analysis_title: 'Call Summary',
    detail_analysis_summary: 'Summary',
    detail_analysis_result: 'Call result',
    detail_analysis_auto_generated: '📝 Summary auto-generated by AI',
    detail_status_completed: 'COMPLETED',
    detail_status_pending: 'PENDING',
    detail_status_failed: 'FAILED',
    detail_result_success: '✅ Successful',
    detail_result_failed: '❌ Failed',
    detail_result_user_ended: 'Client ended',
    detail_result_agent_ended: 'Agent ended',
    detail_result_timeout: 'Timed out',
    detail_result_unknown: 'Unknown',
    detail_termination_remote: 'Client ended the call',
    detail_termination_agent: 'Agent ended the call',
    detail_termination_timeout: 'Timed out',
    detail_termination_error: 'Technical error',
    detail_termination_normal: 'Normal',
    
    // Common
    common_loading: 'Loading...',
    common_error: 'Error',
    common_retry: 'Retry',
    common_client: 'Client',
    common_agent: 'Agent',
    common_minutes: 'min',
    common_seconds: 'sec',
  }
};

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLang = signal<Language>('es');
  
  readonly language = computed(() => this.currentLang());
  readonly t = computed(() => translations[this.currentLang()]);
  
  constructor() {
    this.loadFromStorage();
  }
  
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language;
      if (stored && (stored === 'es' || stored === 'en')) {
        this.currentLang.set(stored);
      }
    } catch (e) {
      console.error('Error loading language from storage:', e);
    }
  }
  
  setLanguage(lang: Language): void {
    this.currentLang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }
  
  getLanguage(): Language {
    return this.currentLang();
  }
  
  get(key: keyof Translations): string {
    return translations[this.currentLang()][key];
  }
}

