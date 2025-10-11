import { apiClient } from '@/lib/api-client';
import { 
  ChatResponse, 
  ChatContext, 
  ChatHistoryResponse,
  ChatMessageRequest,
  StructuredChatPayload
} from '../types';

class AiChatService {
  private baseUrl = '/ai';

  private generateConversationId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  private mapPayloadToChatResponse(
    payload: StructuredChatPayload,
    overrides?: { userMessage?: string; conversationId?: string }
  ): ChatResponse {
    const suggestionsRaw = payload.nextRequestSuggestions ?? payload.next_request_suggestions;
    const suggestions = Array.isArray(suggestionsRaw) ? suggestionsRaw : [];
    const conversationId = overrides?.conversationId || this.generateConversationId();
    return {
      userMessage: overrides?.userMessage ?? '',
      aiResponse: payload.message ?? '',
      conversationId,
      timestamp: new Date().toISOString(),
      results: payload.results ?? [],
      nextRequestSuggestions: suggestions,
      requiresConfirmation: payload.requiresConfirmation,
      confirmationContext: payload.confirmationContext
    };
  }

  /**
   * Send a message to the AI chatbot (Synchronous - waits for complete response)
   * Uses REST API with Agentic Workflow Orchestration (Routing + Parallelization + Evaluation)
   * Note: userId is automatically extracted from JWT token on backend
   */
  async sendMessage(
    message: string, 
    context?: ChatContext
  ): Promise<ChatResponse> {
    try {
      const request: ChatMessageRequest = {
        message: message.trim(),
        conversationId: context?.conversationId,
        // userId is extracted from JWT token on backend - no need to send
      };

      const payload = await apiClient.post<StructuredChatPayload>(
        `${this.baseUrl}/chat/message`,
        request
      );

      return this.mapPayloadToChatResponse(payload, {
        userMessage: message,
        conversationId: request.conversationId
      });
    } catch (error: any) {
      console.error('AI Chat Service Error:', error);
      
      // Return a fallback response
      return {
        userMessage: message,
        aiResponse: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau.',
        conversationId: context?.conversationId || this.generateConversationId(),
        timestamp: new Date().toISOString(),
        error: error.message || 'Không thể kết nối với AI service'
      };
    }
  }

  /**
   * Get chat history for a conversation
   */
  async getChatHistory(conversationId: string): Promise<ChatHistoryResponse> {
    try {
      const response = await apiClient.get<ChatHistoryResponse>(
        `${this.baseUrl}/chat/history/${conversationId}`
      );
      return response;
    } catch (error: any) {
      console.error('Error getting chat history:', error);
      return {
        conversationId,
        messages: [],
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * List user's conversations
   */
  async listConversations(): Promise<string[]> {
    try {
      const response = await apiClient.get<string[]>(
        `${this.baseUrl}/chat/conversations`
      );
      return response;
    } catch (error) {
      console.error('Error listing conversations:', error);
      return [];
    }
  }

  /**
   * Clear chat history for a conversation
   */
  async clearChatHistory(conversationId: string): Promise<boolean> {
    try {
      await apiClient.delete(`${this.baseUrl}/chat/history/${conversationId}`);
      return true;
    } catch (error) {
      console.error('Error clearing chat history:', error);
      return false;
    }
  }

  /**
   * Get chat suggestions based on current context
   */
  async getChatSuggestions(context?: ChatContext): Promise<string[]> {
    try {
      return [
        "Tìm chuyến bay từ Hồ Chí Minh đến Đà Nẵng",
        "Gợi ý khách sạn 4 sao tại Đà Nẵng", 
        "Lập kế hoạch du lịch 3 ngày 2 đêm",
        "Tìm địa điểm ăn uống ngon tại Hội An"
      ];
    } catch (error) {
      console.error('Error getting chat suggestions:', error);
      return [];
    }
  }

  async getDefaultDestinations(): Promise<ChatResponse> {
    try {
      const payload = await apiClient.get<StructuredChatPayload>(
        `${this.baseUrl}/explore/default`
      );
      return this.mapPayloadToChatResponse(payload, {
        conversationId: `explore-${this.generateConversationId()}`
      });
    } catch (error: any) {
      console.error('Get Default Destinations Error:', error);
      return this.mapPayloadToChatResponse({
        message: 'Xin lỗi, tôi không thể tải gợi ý du lịch lúc này.',
        results: [],
        next_request_suggestions: []
      }, { conversationId: `explore-${this.generateConversationId()}` });
    }
  }

  async exploreDestinations(query: string, userCountry?: string): Promise<ChatResponse> {
    try {
      const params: any = { query };
      if (userCountry) {
        params.userCountry = userCountry;
      }
      const payload = await apiClient.get<StructuredChatPayload>(
        `${this.baseUrl}/explore`,
        { params }
      );
      return this.mapPayloadToChatResponse(payload, {
        userMessage: query,
        conversationId: `explore-${this.generateConversationId()}`
      });
    } catch (error: any) {
      console.error('Explore Destinations Error:', error);
      return this.mapPayloadToChatResponse({
        message: 'Xin lỗi, tôi không thể tìm kiếm địa điểm lúc này. Vui lòng thử lại sau.',
        results: [],
        next_request_suggestions: []
      }, {
        userMessage: query,
        conversationId: `explore-${this.generateConversationId()}`
      });
    }
  }

  async getTrendingDestinations(userCountry?: string): Promise<ChatResponse> {
    try {
      const params: any = {};
      if (userCountry) {
        params.userCountry = userCountry;
      }
      const payload = await apiClient.get<StructuredChatPayload>(
        `${this.baseUrl}/explore/trending`,
        { params }
      );
      return this.mapPayloadToChatResponse(payload, {
        userMessage: 'Gợi ý điểm đến thịnh hành',
        conversationId: `explore-${this.generateConversationId()}`
      });
    } catch (error: any) {
      console.error('Get Trending Destinations Error:', error);
      return this.mapPayloadToChatResponse({
        message: 'Xin lỗi, tôi không thể tải điểm đến phổ biến lúc này.',
        results: [],
        next_request_suggestions: []
      }, {
        userMessage: 'Gợi ý điểm đến thịnh hành',
        conversationId: `explore-${this.generateConversationId()}`
      });
    }
  }

  async getSeasonalDestinations(season?: string, userCountry?: string): Promise<ChatResponse> {
    try {
      const params: any = {};
      if (season) {
        params.season = season;
      }
      if (userCountry) {
        params.userCountry = userCountry;
      }
      const payload = await apiClient.get<StructuredChatPayload>(
        `${this.baseUrl}/explore/seasonal`,
        { params }
      );
      const userMessage = season
        ? `Gợi ý điểm đến phù hợp mùa ${season}`
        : 'Gợi ý điểm đến theo mùa';
      return this.mapPayloadToChatResponse(payload, {
        userMessage,
        conversationId: `explore-${this.generateConversationId()}`
      });
    } catch (error: any) {
      console.error('Get Seasonal Destinations Error:', error);
      const userMessage = season
        ? `Gợi ý điểm đến phù hợp mùa ${season}`
        : 'Gợi ý điểm đến theo mùa';
      return this.mapPayloadToChatResponse({
        message: 'Xin lỗi, tôi không thể tải gợi ý theo mùa lúc này.',
        results: [],
        next_request_suggestions: []
      }, {
        userMessage,
        conversationId: `explore-${this.generateConversationId()}`
      });
    }
  }
}

export const aiChatService = new AiChatService();
export default aiChatService;
