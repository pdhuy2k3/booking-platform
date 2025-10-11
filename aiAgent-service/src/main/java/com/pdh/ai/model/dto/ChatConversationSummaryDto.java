package com.pdh.ai.model.dto;

import java.time.Instant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatConversationSummaryDto {
    private String id;
    private String title;
    private Instant createdAt;
    private Instant lastUpdated;
}
