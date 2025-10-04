package com.pdh.ai.model.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatRequest {
    private String message;
    private String conversationId; // Optional - if not provided, service will generate one
    private String userId; // User ID for user-specific conversations
}
