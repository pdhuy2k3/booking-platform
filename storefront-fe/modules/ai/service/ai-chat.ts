import { apiClient } from '@/lib/api-client';
import { 
  ChatResponse, 
  ChatContext, 
  ChatHistoryResponse,
  ChatMessageRequest,
  ExploreResponse
} from '../types';

class AiChatService {
  private baseUrl = '/ai';

  private generateConversationId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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

      // Call the REST endpoint that returns StructuredChatPayload
      const response = await apiClient.post<{message: string; results: any[]}>(
        `${this.baseUrl}/chat/message`,
        request
      );

      // Convert StructuredChatPayload to ChatResponse format
      return {
        userMessage: message,
        aiResponse: response.message,
        conversationId: request.conversationId || this.generateConversationId(),
        timestamp: new Date().toISOString(),
        results: response.results
      };
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

  async getDefaultDestinations(): Promise<ExploreResponse> {
    try {
      const response = await apiClient.get<ExploreResponse>(
        `${this.baseUrl}/explore/default`
      );
      return response;
    } catch (error: any) {
      console.error('Get Default Destinations Error:', error);
      return {
        message: 'Xin lỗi, tôi không thể tải gợi ý du lịch lúc này.',
        results: []
      };
    }
  }

  async exploreDestinations(query: string, userCountry?: string): Promise<ExploreResponse> {
    try {
      const params: any = { query };
      if (userCountry) {
        params.userCountry = userCountry;
      }
      const response = await apiClient.get<ExploreResponse>(
        `${this.baseUrl}/explore`,
        { params }
      );
      return response;
    } catch (error: any) {
      console.error('Explore Destinations Error:', error);
      return {
        message: 'Xin lỗi, tôi không thể tìm kiếm địa điểm lúc này. Vui lòng thử lại sau.',
        results: []
      };
    }
  }

  async getTrendingDestinations(userCountry?: string): Promise<ExploreResponse> {
    try {
      const params: any = {};
      if (userCountry) {
        params.userCountry = userCountry;
      }
      const response = await apiClient.get<ExploreResponse>(
        `${this.baseUrl}/explore/trending`,
        { params }
      );
      return response;
    } catch (error: any) {
      console.error('Get Trending Destinations Error:', error);
      return {
        message: 'Xin lỗi, tôi không thể tải điểm đến phổ biến lúc này.',
        results: []
      };
    }
  }

  async getSeasonalDestinations(season?: string, userCountry?: string): Promise<ExploreResponse> {
    try {
      const params: any = {};
      if (season) {
        params.season = season;
      }
      if (userCountry) {
        params.userCountry = userCountry;
      }
      const response = await apiClient.get<ExploreResponse>(
        `${this.baseUrl}/explore/seasonal`,
        { params }
      );
      return response;
    } catch (error: any) {
      console.error('Get Seasonal Destinations Error:', error);
      return {
        message: 'Xin lỗi, tôi không thể tải gợi ý theo mùa lúc này.',
        results: []
      };
    }
  }
}

export const aiChatService = new AiChatService();
export default aiChatService;
