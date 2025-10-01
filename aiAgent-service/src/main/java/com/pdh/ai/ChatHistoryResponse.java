package com.pdh.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatHistoryResponse {
    private String conversationId;
    private List<ChatMessage> messages;
    private LocalDateTime createdAt;
    private LocalDateTime lastUpdated;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ChatMessage {
        private String content;
        private String role; // "user" or "assistant"
        private LocalDateTime timestamp;
    }
}