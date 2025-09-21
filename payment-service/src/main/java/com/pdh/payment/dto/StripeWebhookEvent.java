package com.pdh.payment.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Stripe Webhook Event DTO
 * Represents webhook events from Stripe
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StripeWebhookEvent {
    
    private String id;
    private String object;
    
    @JsonProperty("api_version")
    private String apiVersion;
    
    private LocalDateTime created;
    private Boolean livemode;
    
    @JsonProperty("pending_webhooks")
    private Integer pendingWebhooks;
    
    private StripeRequestDto request;
    private String type;
    private StripeEventDataDto data;
    
    /**
     * Nested DTO for request information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StripeRequestDto {
        private String id;
        private String idempotencyKey;
    }
    
    /**
     * Nested DTO for event data
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StripeEventDataDto {
        private String object;
        private Map<String, Object> previousAttributes;
    }
}
