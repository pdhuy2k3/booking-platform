import { useState, useCallback, useEffect, useRef } from 'react';
import { aiChatService } from '../service';
import { ChatMessage, ChatContext, ChatStructuredResult, ChatMessageResponse } from '../types';
import { useAuth } from '@/contexts/auth-context';

interface UseAiChatOptions {
  conversationId?: string;
  loadHistoryOnMount?: boolean;
  context?: ChatContext;
  onError?: (error: string) => void;
  mode?: 'stream' | 'sync'; // Processing mode
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
  mode: 'stream' | 'sync';
  setMode: (mode: 'stream' | 'sync') => void;
}

interface ParsedStructuredPayload {
  message: string;
  results: ChatStructuredResult[];
  suggestions: string[];
}

const parseStructuredPayload = (raw?: string | null): ParsedStructuredPayload | null => {
  if (!raw) {
    return null;
  }

  let content = raw.trim();
  if (!content) {
    return null;
  }

  console.log('🔍 Parsing structured payload, raw length:', content.length);
  console.log('🔍 First 200 chars:', content.substring(0, 200));

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
      const result = JSON.parse(value);
      console.log('✅ Parse successful:', Object.keys(result));
      return result;
    } catch (err) {
      console.log('❌ Parse failed:', err);
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

  const rawSuggestions = parsed.next_request_suggestions ?? parsed.nextRequestSuggestions ?? [];
  const suggestionArray = Array.isArray(rawSuggestions)
    ? rawSuggestions
    : rawSuggestions && typeof rawSuggestions === 'object'
      ? Object.values(rawSuggestions as Record<string, unknown>)
      : [];

  const suggestions: string[] = suggestionArray
    .map((item: unknown) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object' && 'value' in item && typeof (item as { value: unknown }).value === 'string') {
        return ((item as { value: string }).value).trim();
      }
      return String(item ?? '').trim();
    })
    .filter((item: string) => item.length > 0);

  return { message, results, suggestions };
};

const createConversationId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const createMessageId = (prefix: 'user' | 'assistant'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export function useAiChat(options: UseAiChatOptions = {}): UseAiChatReturn {
  const { 
    conversationId: initialConversationId, 
    loadHistoryOnMount = false, 
    context, 
    onError,
    mode: initialMode = 'sync' // Default to sync mode
  } = options;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Xin chào! Tôi có thể giúp bạn tìm kiếm chuyến bay, khách sạn hoặc lên kế hoạch du lịch. Bạn muốn đi đâu?',
      isUser: false,
      timestamp: new Date(),
      results: [], // Make sure results is initialized
      suggestions: [],
    },
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [mode, setMode] = useState<'stream' | 'sync'>(initialMode);
  const { user, refreshChatConversations } = useAuth();
  const pendingMessageRef = useRef<string | null>(null);
  const currentAssistantMessageIdRef = useRef<string | null>(null);
  const conversationIdRef = useRef(conversationId);
  const onErrorRef = useRef(onError);

  // Keep refs updated
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);



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
            results: [...(parsed?.results ?? [])], // Create new array to ensure change detection
            suggestions: [...(parsed?.suggestions ?? [])], // Create new array to ensure change detection
          };
        });
        
        setMessages(historyMessages);
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
    }
  }, [conversationId]);

  const sendMessage = useCallback(async (messageContent: string) => {
    const trimmedMessage = messageContent.trim();
    if (!trimmedMessage || isLoading) {
      return;
    }

    const effectiveConversationId = conversationId || context?.conversationId || createConversationId();
    const userMessageId = createMessageId('user');
    const assistantMessageId = createMessageId('assistant');

    const userMessage: ChatMessage = {
      id: userMessageId,
      content: trimmedMessage,
      isUser: true,
      timestamp: new Date(),
      results: [],
      suggestions: [],
    };

    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      content: '',
      isUser: false,
      timestamp: new Date(),
      results: [],
      suggestions: [],
    };

    setMessages(prev => [...prev, userMessage, assistantPlaceholder]);
    setIsLoading(true);
    setError(null);

    if (!conversationId) {
      setConversationId(effectiveConversationId);
    }

    currentAssistantMessageIdRef.current = assistantMessageId;

    try {
      const chatContext: ChatContext = {
        ...context,
        conversationId: effectiveConversationId,
      };

      const response = await aiChatService.sendMessage(trimmedMessage, chatContext);

      const shouldRefreshConversations = !conversationId || response.conversationId !== conversationId;

      if (response.conversationId && response.conversationId !== conversationId) {
        setConversationId(response.conversationId);
      }

      if (shouldRefreshConversations) {
        refreshChatConversations().catch((err) => {
          console.error('Failed to refresh conversations:', err);
        });
      }

      if (response.error) {
        setError(response.error);
        onError?.(response.error);
      }

      // Parse structured response
      const parsedResponse = parseStructuredPayload(response.aiResponse);
      const finalResults = parsedResponse?.results ?? response.results ?? [];
      const finalSuggestions = response.nextRequestSuggestions ?? parsedResponse?.suggestions ?? [];

      setMessages(prev => {
        // Create a new array to ensure React detects the change
        const newMessages = [...prev];
        const messageIndex = newMessages.findIndex(msg => msg.id === assistantMessageId);
        
        if (messageIndex !== -1) {
          newMessages[messageIndex] = {
            ...newMessages[messageIndex],
            content: parsedResponse?.message ?? response.aiResponse,
            results: [...finalResults], // ensure change detection
            timestamp: new Date(response.timestamp || Date.now()),
            suggestions: [...finalSuggestions],
          };
        }
        
        return newMessages;
      });

      // Clear the assistant message reference when using REST API
      currentAssistantMessageIdRef.current = null;
    } catch (err) {
      const errorMessage = 'Không thể gửi tin nhắn. Vui lòng thử lại.';
      setError(errorMessage);
      onError?.(errorMessage);

      setMessages(prev => {
        // Create a new array to ensure React detects the change
        const newMessages = [...prev];
        const messageIndex = newMessages.findIndex(msg => msg.id === assistantMessageId);
        
        if (messageIndex !== -1) {
          newMessages[messageIndex] = {
            ...newMessages[messageIndex],
            content: errorMessage,
            results: [],
            timestamp: new Date(),
            suggestions: [],
          };
        }
        
        return newMessages;
      });

      // Clear the assistant message reference on error
      currentAssistantMessageIdRef.current = null;
    } finally {
      // Always set loading to false after the operation completes
      setIsLoading(false);
    }
  }, [isLoading, conversationId, context, refreshChatConversations, onError, user]);

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
        suggestions: [],
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
    mode,
    setMode,
  };
}
