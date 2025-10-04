package com.pdh.ai.service;

import com.pdh.ai.model.dto.ChatHistoryResponse;
import com.pdh.ai.model.dto.StructuredChatPayload;

public interface AiService {
    StructuredChatPayload complete(String message);
    StructuredChatPayload completeWithConversation(String message, String conversationId, String userId);
    ChatHistoryResponse getChatHistory(String conversationId, String userId);
    void clearChatHistory(String conversationId, String userId);
    java.util.List<String> getUserConversations(String userId);
}
