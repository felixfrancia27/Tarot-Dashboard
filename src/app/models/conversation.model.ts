// Modelos basados en la API de ElevenLabs Conversational AI

export interface ConversationListItem {
  conversation_id: string;
  agent_id: string;
  start_time_unix_secs: number;
  call_duration_secs: number;
  message_count: number;
  status: ConversationStatus;
  user_id?: string | null;
}

export interface ConversationListResponse {
  conversations: ConversationListItem[];
  has_more?: boolean;
  next_cursor?: string;
}

export interface Conversation {
  agent_id: string;
  conversation_id: string;
  status: ConversationStatus;
  user_id?: string | null;
  branch_id?: string | null;
  has_audio?: boolean;
  has_user_audio?: boolean;
  has_response_audio?: boolean;
  transcript: TranscriptTurn[];
  metadata: ConversationMetadata;
  analysis?: ConversationAnalysis | null;
  conversation_initiation_client_data?: ConversationInitData | null;
}

export interface TranscriptTurn {
  role: 'user' | 'agent';
  message: string;
  tool_calls?: ToolCall[] | null;
  tool_results?: ToolResult[] | null;
  feedback?: TurnFeedback | null;
  time_in_call_secs: number;
  conversation_turn_metrics?: TurnMetrics | null;
  rag_retrieval_info?: RagInfo | null;
  llm_usage?: LlmUsage | null;
}

export interface ToolCall {
  tool_name: string;
  parameters: Record<string, unknown>;
}

export interface ToolResult {
  tool_name: string;
  result: unknown;
}

export interface TurnFeedback {
  rating?: number;
  comment?: string;
}

export interface TurnMetrics {
  latency_ms?: number;
  processing_time_ms?: number;
}

export interface RagInfo {
  documents_retrieved?: number;
  relevance_scores?: number[];
}

export interface LlmUsage {
  prompt_tokens?: number;
  completion_tokens?: number;
  total_tokens?: number;
}

export interface ConversationMetadata {
  start_time_unix_secs: number;
  call_duration_secs: number;
  cost?: number;
  deletion_settings?: DeletionSettings;
  feedback?: AggregatedFeedback;
  authorization_method?: string;
  charging?: ChargingInfo;
  termination_reason?: string;
}

export interface DeletionSettings {
  delete_transcript_and_pii?: boolean;
  delete_audio?: boolean;
  deletion_scheduled_at?: number;
}

export interface AggregatedFeedback {
  overall_score?: number;
  likes?: number;
  dislikes?: number;
}

export interface ChargingInfo {
  dev_discount?: boolean;
  credits_used?: number;
}

export interface ConversationAnalysis {
  evaluation_criteria_results?: Record<string, unknown>;
  data_collection_results?: Record<string, unknown>;
  call_successful?: string;
  transcript_summary?: string;
}

export interface ConversationInitData {
  conversation_config_override?: {
    agent?: {
      prompt?: string;
      first_message?: string;
      language?: string;
    };
    tts?: {
      voice_id?: string;
    };
  };
  custom_llm_extra_body?: Record<string, unknown>;
  dynamic_variables?: Record<string, string>;
}

export type ConversationStatus = 
  | 'initiated'
  | 'processing'
  | 'done'
  | 'failed'
  | 'timeout';

// Modelo para agentes
export interface Agent {
  agent_id: string;
  name: string;
  description?: string;
}

// Modelo para credenciales del cliente
export interface ClientCredentials {
  clientId: string;
  clientName: string;
  elevenLabsApiKey: string;
  agentId: string;
  agentName?: string;
}

// Estadísticas del dashboard
export interface DashboardStats {
  totalConversations: number;
  totalDurationMinutes: number;
  avgDurationMinutes: number;
  successRate: number;
  totalMessages: number;
  conversationsToday: number;
  conversationsThisWeek: number;
}

