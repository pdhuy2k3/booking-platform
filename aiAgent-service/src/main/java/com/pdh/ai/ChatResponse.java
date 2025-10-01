package com.pdh.ai;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private String userMessage;
    private String aiResponse;
    private String conversationId;
    private String userId;
    private LocalDateTime timestamp;
    private String error;
}