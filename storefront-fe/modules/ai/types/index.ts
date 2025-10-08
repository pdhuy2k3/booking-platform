// ==================== TEXT CHAT TYPES (WebSocket) ====================

export interface ChatMessageRequest {
  userId: string;
  conversationId?: string;
  message: string;
  timestamp?: number;
  mode?: 'stream' | 'sync'; // Processing mode selection
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
  nextRequestSuggestions?: string[];
  next_request_suggestions?: string[]; // Support both naming conventions
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
  nextRequestSuggestions?: string[];
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  results?: ChatStructuredResult[];
  suggestions?: string[];
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
  ids?: Record<string, string>; // Map of identifiers (flightId, scheduleId, fareId, hotelId, roomTypeId, etc.)
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

// ==================== EXPLORE TYPES ====================

/**
 * Explore API response structure
 * Matches backend ExploreResponse.java
 */
export interface ExploreResponse {
  /** Natural language introduction message */
  message: string;
  /** Array of destination recommendations */
  results: ExploreDestination[];
}

export interface ExploreDestination {
  /** Always 'info' for destination cards */
  type: string;
  /** Destination name (e.g., 'Đà Nẵng', 'Hạ Long Bay') */
  title: string;
  /** Brief compelling description of the destination */
  subtitle: string;
  /** Detailed destination information */
  metadata: DestinationMetadata;
}

export interface DestinationMetadata {
  /** Full location string (e.g., 'Đà Nẵng, Việt Nam') */
  location: string;
  /** Latitude coordinate (decimal degrees) */
  latitude: number;
  /** Longitude coordinate (decimal degrees) */
  longitude: number;
  /** URL to destination image from Brave image search */
  image_url: string;
  /** Alternative field name for image URL (for compatibility) */
  imageUrl?: string;
  /** Array of key attractions or features */
  highlights: string[];
  /** Best time to visit (e.g., 'Tháng 3-8', 'April to October') */
  best_time: string;
  /** Estimated daily cost range (e.g., '2-5 triệu VND/ngày') */
  estimated_cost: string;
}
