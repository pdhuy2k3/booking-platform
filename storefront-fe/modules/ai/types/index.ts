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
