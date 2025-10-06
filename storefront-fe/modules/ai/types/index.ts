// ==================== TEXT CHAT TYPES (WebSocket) ====================

export interface ChatMessageRequest {
  userId: string;
  conversationId?: string;
  message: string;
  timestamp?: number;
}

export type ChatResponseType = 'PROCESSING' | 'RESPONSE' | 'ERROR';

export interface ChatMessageResponse {
  type: ChatResponseType;
  userId: string;
  conversationId: string;
  userMessage: string;
  aiResponse?: string;
  results?: ChatStructuredResult[];
  status?: string;
  error?: string;
  timestamp: string;
  processingTimeMs?: number;
}

// Legacy REST API types (kept for backward compatibility)
export interface ChatRequest {
  message: string;
  conversationId?: string;
  userId?: string; // Optional - backend automatically extracts from JWT token if not provided
}

export interface ChatResponse {
  userMessage: string;
  aiResponse: string;
  conversationId: string;
  userId: string; // Populated by backend from JWT token
  timestamp: string;
  error?: string;
  results?: ChatStructuredResult[];
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  results?: ChatStructuredResult[];
}

export interface ChatHistoryMessage {
  content: string;
  role: string; // "user" or "assistant"
  timestamp: string;
}

export interface ChatHistoryResponse {
  conversationId: string;
  messages: ChatHistoryMessage[];
  createdAt: string;
  lastUpdated: string;
}

export interface ChatConversationSummary {
  id: string;
  title: string;
  lastUpdated?: string;
}

export interface ChatContext {
  conversationId?: string;
  userId?: string; // Optional - backend automatically extracts from JWT token
  previousMessages?: ChatMessage[];
  userPreferences?: {
    language?: string;
    currency?: string;
    location?: string;
  };
}

export interface ChatStructuredResult {
  type?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  metadata?: Record<string, unknown>;
}

// ==================== VOICE CHAT TYPES ====================

export interface VoiceMessageRequest {
  userId: string;
  conversationId?: string;
  audioData: string; // base64 encoded audio
  audioFormat: string; // e.g., 'audio/mp3', 'audio/wav', 'audio/webm'
  language?: string; // e.g., 'vi', 'en'
  durationMs?: number; // optional recording duration
}

export type VoiceResponseType = 'TRANSCRIPTION' | 'PROCESSING' | 'RESPONSE' | 'ERROR';

export interface VoiceMessageResponse {
  type: VoiceResponseType;
  userId: string;
  conversationId: string;
  transcribedText?: string; // Available in TRANSCRIPTION stage
  aiResponse?: string; // Available in RESPONSE stage
  results?: ChatStructuredResult[]; // Available in RESPONSE stage
  status?: string; // Status message (e.g., "Đang nhận dạng...", "Đang xử lý...")
  error?: string; // Available in ERROR stage
  timestamp: string;
  processingTimeMs?: number; // Total processing time
}

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  duration: number; // in milliseconds
  error: string | null;
}
