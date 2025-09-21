package com.pdh.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Stripe PaymentIntent Response DTO
 * Contains client secret and payment information for frontend integration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StripePaymentIntentResponse {
    
    private String paymentIntentId;
    private String clientSecret;
    private String status;
    private BigDecimal amount;
    private String currency;
    private String description;
    private UUID transactionId;
    
    // Payment method information
    private String paymentMethodId;
    private String customerId;
    
    // Next action for 3D Secure
    private StripeNextActionDto nextAction;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Error information
    private StripeErrorDto error;
    
    // Additional data
    private Map<String, Object> metadata;
    
    /**
     * Nested DTO for next action (3D Secure, redirects, etc.)
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StripeNextActionDto {
        private String type; // redirect_to_url, use_stripe_sdk, etc.
        private StripeRedirectToUrlDto redirectToUrl;
        private StripeUseStripeSdkDto useStripeSdk;
    }
    
    /**
     * Nested DTO for redirect URL
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StripeRedirectToUrlDto {
        private String url;
        private String returnUrl;
    }
    
    /**
     * Nested DTO for Stripe SDK usage
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StripeUseStripeSdkDto {
        private String type;
        private String token;
    }
    
    /**
     * Nested DTO for error information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StripeErrorDto {
        private String type;
        private String code;
        private String message;
        private String declineCode;
        private String param;
    }
}
