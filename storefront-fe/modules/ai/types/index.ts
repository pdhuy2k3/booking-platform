// ==================== TEXT CHAT TYPES (REST API) ====================

export interface ChatMessageRequest {
  conversationId?: string;
  message: string;
  timestamp?: number;
  // Note: userId is automatically extracted from JWT token on backend
}

export type ChatResponseType = 'PROCESSING' | 'RESPONSE' | 'ERROR';

export interface ChatMessageResponse {
  type: ChatResponseType;
  userId: string; // Populated by backend from JWT
  conversationId: string;
  userMessage: string;
  aiResponse?: string;
  results?: ChatStructuredResult[];
  status?: string;
  error?: string;
  timestamp: string;
  processingTimeMs?: number;
  nextRequestSuggestions?: string[];
  next_request_suggestions?: string[]; // Support both naming conventions
}

// Legacy REST API types (kept for backward compatibility)
export interface ChatRequest {
  message: string;
  conversationId?: string;
  // Note: userId is automatically extracted from JWT token on backend
}

export interface ChatResponse {
  userMessage: string;
  aiResponse: string;
  conversationId: string;
  userId?: string; // Optional - populated by backend from JWT token
  timestamp: string;
  error?: string;
  results?: ChatStructuredResult[];
  nextRequestSuggestions?: string[];
  requiresConfirmation?: boolean; // Whether this response requires user confirmation
  confirmationContext?: ConfirmationContext; // Context for confirmation flow
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  results?: ChatStructuredResult[];
  suggestions?: string[];
  requiresConfirmation?: boolean; // Whether this message requires confirmation
  confirmationContext?: ConfirmationContext; // Context for confirmation UI
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
  // Note: userId is automatically extracted from JWT token on backend
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
  ids?: Record<string, string>; // Map of identifiers (flightId, scheduleId, fareId, hotelId, roomTypeId, etc.)
  metadata?: Record<string, unknown>;
}

export interface StructuredChatPayload {
  message: string;
  results: ChatStructuredResult[];
  nextRequestSuggestions?: string[];
  next_request_suggestions?: string[];
  requiresConfirmation?: boolean;
  confirmationContext?: ConfirmationContext;
}

/**
 * Confirmation context for operations requiring user approval (booking, payment).
 */
export interface ConfirmationContext {
  /** Type of operation: 'create_booking', 'process_payment', 'cancel_booking' */
  operation: string;
  /** Human-readable summary of what will happen if user confirms */
  summary: string;
  /** Data needed to execute the operation (bookingDetails, paymentDetails, etc.) */
  pendingData: Record<string, unknown>;
  /** Conversation ID to resume after confirmation */
  conversationId?: string;
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
  nextRequestSuggestions?: string[];
  next_request_suggestions?: string[]; // Support both naming conventions
}

export interface AudioRecorderState {
  isRecording: boolean;
  isPaused: boolean;
  audioBlob: Blob | null;
  audioUrl: string | null;
  duration: number; // in milliseconds
  error: string | null;
}

