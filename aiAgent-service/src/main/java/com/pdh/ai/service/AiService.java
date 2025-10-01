package com.pdh.ai.service;

import com.pdh.ai.ChatHistoryResponse;

public interface AiService {
    String complete(String message);
    String completeWithConversation(String message, String conversationId, String userId);
    ChatHistoryResponse getChatHistory(String conversationId, String userId);
    void clearChatHistory(String conversationId, String userId);
    java.util.List<String> getUserConversations(String userId);
}
