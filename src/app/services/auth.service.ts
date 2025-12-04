import { Injectable, signal, computed } from '@angular/core';

const STORAGE_KEY = 'tarot_dashboard_session';

// Usuarios preconfigurados con sus credenciales de ElevenLabs
// En producción, esto vendría de una API/base de datos
const USERS_DB: Record<string, UserConfig> = {
  'felix': {
    password: '123',
    clientId: 'sandbox',
    clientName: 'Felix Francia',
    agentName: 'Luz - Lectura de Tarot',
    elevenLabsApiKey: '3083c451919ed7a5f2b2e1d251ed0a6f510b2e3420abceee8ba364ef5f5f122e',
    agentId: 'agent_8801kamsbht7f9y8cfsz18mbs6j5'
  }
  // Agregar más usuarios aquí para otros clientes
};

export interface UserConfig {
  password: string;
  clientId: string;
  clientName: string;
  agentName: string;
  elevenLabsApiKey: string;
  agentId: string;
}

export interface SessionData {
  username: string;
  clientId: string;
  clientName: string;
  agentName: string;
  elevenLabsApiKey: string;
  agentId: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private session = signal<SessionData | null>(null);
  
  readonly isLoggedIn = computed(() => this.session() !== null);
  readonly currentClient = computed(() => this.session());
  
  constructor() {
    this.loadFromStorage();
  }
  
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SessionData;
        if (parsed.elevenLabsApiKey && parsed.agentId) {
          this.session.set(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading session from storage:', e);
      localStorage.removeItem(STORAGE_KEY);
    }
  }
  
  /**
   * Intenta hacer login con usuario y contraseña
   * @returns true si el login fue exitoso, false si falló
   */
  login(username: string, password: string): { success: boolean; error?: string } {
    const normalizedUsername = username.toLowerCase().trim();
    const user = USERS_DB[normalizedUsername];
    
    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }
    
    if (user.password !== password) {
      return { success: false, error: 'Contraseña incorrecta' };
    }
    
    // Crear sesión
    const sessionData: SessionData = {
      username: normalizedUsername,
      clientId: user.clientId,
      clientName: user.clientName,
      agentName: user.agentName,
      elevenLabsApiKey: user.elevenLabsApiKey,
      agentId: user.agentId
    };
    
    this.session.set(sessionData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    
    return { success: true };
  }
  
  logout(): void {
    this.session.set(null);
    localStorage.removeItem(STORAGE_KEY);
  }
  
  isAuthenticated(): boolean {
    return this.isLoggedIn();
  }
  
  getCredentials(): SessionData | null {
    return this.session();
  }
  
  getApiKey(): string | null {
    return this.session()?.elevenLabsApiKey ?? null;
  }
  
  getAgentId(): string | null {
    return this.session()?.agentId ?? null;
  }
}
