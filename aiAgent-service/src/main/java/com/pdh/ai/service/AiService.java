package com.pdh.ai.service;

import com.pdh.ai.model.dto.ChatConversationSummaryDto;
import com.pdh.ai.model.dto.ChatHistoryResponse;
import com.pdh.ai.model.dto.StructuredChatPayload;

public interface AiService {
    // Synchronous methods for regular chat and history operations
    ChatHistoryResponse getChatHistory(String conversationId, String username);
    void clearChatHistory(String conversationId, String username);
    java.util.List<ChatConversationSummaryDto> getUserConversations(String username);

    // Synchronous structured method (without streaming)
    StructuredChatPayload processStructured(String message, String conversationId, String username);
}
