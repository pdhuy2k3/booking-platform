import { useState, useCallback, useEffect } from 'react';
import { aiChatService } from '../service';
import { ChatMessage, ChatContext, ChatStructuredResult } from '../types';
import { useAuth } from '@/contexts/auth-context';

interface UseAiChatOptions {
  conversationId?: string;
  loadHistoryOnMount?: boolean;
  context?: ChatContext;
  onError?: (error: string) => void;
}

interface UseAiChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  loadChatHistory: () => Promise<void>;
  suggestions: string[];
  getSuggestions: () => Promise<void>;
}

const parseStructuredPayload = (raw?: string | null): { message: string; results: ChatStructuredResult[] } | null => {
  if (!raw) {
    return null;
  }

  let content = raw.trim();
  if (!content) {
    return null;
  }

  if (content.startsWith('```')) {
    const newlineIndex = content.indexOf('\n');
    if (newlineIndex > 0) {
      content = content.substring(newlineIndex + 1);
    } else {
      content = content.substring(3);
    }
  }

  if (content.endsWith('```')) {
    content = content.substring(0, content.length - 3);
  }

  content = content.trim();

  // Remove optional language identifiers (e.g. "json") that may prefix the payload
  if (content.startsWith('json')) {
    content = content.substring(4).trim();
  }

  const tryParse = (value: string): any => {
    try {
      return JSON.parse(value);
    } catch (err) {
      return null;
    }
  };

  let parsed: any = tryParse(content);

  if (!parsed) {
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      parsed = tryParse(content.substring(start, end + 1));
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    return null;
  }

  const message = typeof parsed.message === 'string' && parsed.message.trim().length > 0
    ? parsed.message
    : raw;

  const results = Array.isArray(parsed.results)
    ? parsed.results.filter(Boolean) as ChatStructuredResult[]
    : [];

  return { message, results };
};

export function useAiChat(options: UseAiChatOptions = {}): UseAiChatReturn {
  const { conversationId: initialConversationId, loadHistoryOnMount = false, context, onError } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Xin chào! Tôi có thể giúp bạn tìm kiếm chuyến bay, khách sạn hoặc lên kế hoạch du lịch. Bạn muốn đi đâu?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const { refreshChatConversations } = useAuth();

  useEffect(() => {
    if (initialConversationId === undefined) {
      return;
    }

    if (initialConversationId !== conversationId) {
      setConversationId(initialConversationId || null);
    }
  }, [initialConversationId, conversationId]);

  // Load chat history on mount if requested
  useEffect(() => {
    if (loadHistoryOnMount && conversationId) {
      loadChatHistory();
    }
  }, [conversationId, loadHistoryOnMount]);

  const loadChatHistory = useCallback(async () => {
    if (!conversationId) return;

    try {
      const historyResponse = await aiChatService.getChatHistory(conversationId);
      
      if (historyResponse.messages && historyResponse.messages.length > 0) {
        const historyMessages: ChatMessage[] = historyResponse.messages.map((msg, index) => {
          const parsed = parseStructuredPayload(msg.content);

          return {
            id: `history-${index}`,
            content: parsed?.message ?? msg.content,
            isUser: msg.role === 'user',
            timestamp: new Date(msg.timestamp),
            results: parsed?.results ?? [],
          };
        });
        
        setMessages(historyMessages);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  }, [conversationId]);

  const sendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageContent.trim(),
      isUser: true,
      timestamp: new Date(),
      results: [],
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const chatContext: ChatContext = {
        conversationId: conversationId || undefined,
        ...context
      };

      const response = await aiChatService.sendMessage(messageContent, chatContext);
      
      // Update conversation ID if it was generated
      if (response.conversationId && response.conversationId !== conversationId) {
        setConversationId(response.conversationId);
        refreshChatConversations().catch((err) => {
          console.error('Failed to refresh conversations:', err);
        });
      }
      
      if (response.error) {
        setError(response.error);
        onError?.(response.error);
      }

      const parsedResponse = parseStructuredPayload(response.aiResponse);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: parsedResponse?.message ?? response.aiResponse,
        isUser: false,
        timestamp: new Date(response.timestamp),
        results:
          (response.results && response.results.length > 0)
            ? response.results
            : parsedResponse?.results ?? [],
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      const errorMessage = 'Không thể gửi tin nhắn. Vui lòng thử lại.';
      setError(errorMessage);
      onError?.(errorMessage);
      
      // Add error message to chat
      const errorAiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: errorMessage,
        isUser: false,
        timestamp: new Date(),
        results: [],
      };
      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, conversationId, context, onError, refreshChatConversations]);

  const clearMessages = useCallback(async () => {
    if (conversationId) {
      try {
        await aiChatService.clearChatHistory(conversationId);
        refreshChatConversations().catch((err) => {
          console.error('Failed to refresh conversations:', err);
        });
      } catch (err) {
        console.error('Failed to clear chat history:', err);
      }
    }
    
    setMessages([
      {
        id: '1',
        content: 'Xin chào! Tôi có thể giúp bạn tìm kiếm chuyến bay, khách sạn hoặc lên kế hoạch du lịch. Bạn muốn đi đâu?',
        isUser: false,
        timestamp: new Date(),
        results: [],
      },
    ]);
    setError(null);
    setConversationId(null);
  }, [conversationId, refreshChatConversations]);

  const getSuggestions = useCallback(async () => {
    try {
      const newSuggestions = await aiChatService.getChatSuggestions({ 
        conversationId: conversationId || undefined, 
        ...context 
      });
      setSuggestions(newSuggestions);
    } catch (err) {
      console.error('Failed to get suggestions:', err);
    }
  }, [conversationId, context]);

  return {
    messages,
    isLoading,
    error,
    conversationId,
    sendMessage,
    clearMessages,
    loadChatHistory,
    suggestions,
    getSuggestions,
  };
}
