package com.pdh.payment.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO for payment processing response
 * Used for both storefront and internal payment responses
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDto {
    
    /**
     * Payment transaction ID
     */
    private String paymentId;
    
    /**
     * Booking ID associated with this payment
     */
    private String bookingId;
    
    /**
     * Saga ID for tracking
     */
    private String sagaId;
    
    /**
     * Payment status
     */
    private String status; // PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED, REFUNDED
    
    /**
     * Payment amount
     */
    private BigDecimal amount;
    
    /**
     * Currency code
     */
    private String currency;
    
    /**
     * Formatted amount for display
     */
    private String formattedAmount;
    
    /**
     * Payment method used
     */
    private String paymentMethod;
    
    /**
     * Gateway response information
     */
    private GatewayResponseDto gatewayResponse;
    
    /**
     * Transaction timestamps
     */
    private LocalDateTime createdAt;
    private LocalDateTime processedAt;
    private LocalDateTime completedAt;
    
    /**
     * Additional response data
     */
    private Map<String, Object> metadata;
    
    /**
     * Error information (if payment failed)
     */
    private ErrorInfoDto errorInfo;
    
    /**
     * Nested DTO for gateway response
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GatewayResponseDto {
        
        private String gatewayName; // VNPAY, MOMO, STRIPE, etc.
        private String gatewayTransactionId;
        private String gatewayStatus;
        private String gatewayMessage;
        private String authorizationCode;
        private String receiptNumber;
        private Map<String, Object> rawResponse;
    }
    
    /**
     * Nested DTO for error information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ErrorInfoDto {
        
        private String errorCode;
        private String errorMessage;
        private String errorDescription;
        private String suggestedAction;
        private Boolean retryable;
    }
}
