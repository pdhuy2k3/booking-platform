package com.pdh.ai.service;

import com.pdh.ai.model.dto.ChatConversationSummaryDto;
import com.pdh.ai.model.dto.ChatHistoryResponse;
import com.pdh.ai.model.dto.StructuredChatPayload;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface AiService {
    // Synchronous methods for regular chat and history operations
    ChatHistoryResponse getChatHistory(String conversationId, String username);
    void clearChatHistory(String conversationId, String username);
    java.util.List<ChatConversationSummaryDto> getUserConversations(String username);

    // Streaming structured method (with streaming)
    Flux<StructuredChatPayload> processStreamStructured(String message, String conversationId, String username);
}
