package com.pdh.ai.service;

import com.pdh.ai.model.dto.ChatConversationSummaryDto;
import com.pdh.ai.model.dto.ChatHistoryResponse;
import com.pdh.ai.model.dto.StructuredChatPayload;
import reactor.core.publisher.Mono;

public interface AiService {
    // Synchronous methods for regular chat and history operations
    ChatHistoryResponse getChatHistory(String conversationId, String userId);
    void clearChatHistory(String conversationId, String userId);
    java.util.List<ChatConversationSummaryDto> getUserConversations(String userId);
    
    // Synchronous structured method (no streaming)
    Mono<StructuredChatPayload> processSyncStructured(String message, String conversationId, String userId);
}
