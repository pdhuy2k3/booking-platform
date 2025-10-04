package com.pdh.ai.model.dto;

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
public class ChatResponse {
    private String userMessage;
    private String aiResponse;
    private String conversationId;
    private String userId;
    private LocalDateTime timestamp;
    private String error;
    private List<StructuredResultItem> results;
}
