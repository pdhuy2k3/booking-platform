package com.pdh.payment.dto;

import com.pdh.payment.model.enums.PaymentGateway;
import com.pdh.payment.model.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Refund Result DTO for Strategy Pattern
 * Contains the result of refund processing from any gateway
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundResult {
    
    private boolean success;
    private String message;
    private String errorCode;
    private String errorMessage;
    
    // Refund identifiers
    private String refundId;
    private String refundReference;
    private String externalRefundId; // Gateway-specific refund ID
    
    // Original payment information
    private UUID originalPaymentId;
    private String originalPaymentReference;
    private String originalExternalPaymentId;
    
    // Refund details
    private UUID bookingId;
    private UUID userId;
    private BigDecimal refundAmount;
    private BigDecimal originalAmount;
    private String currency;
    private PaymentGateway gateway;
    private PaymentStatus status;
    private String reason;
    
    // Gateway-specific data
    private String gatewayResponse;
    private String gatewayStatus;
    private BigDecimal gatewayFee;
    private Map<String, Object> gatewayMetadata;
    
    // Timing information
    private LocalDateTime initiatedAt;
    private LocalDateTime processedAt;
    private LocalDateTime completedAt;
    private LocalDateTime expectedCompletionAt;
    
    // Stripe-specific fields
    private String chargeId;
    private String paymentIntentId;
    private String refundStatus; // Stripe refund status
    
    // VietQR-specific fields
    private String bankTransferInfo;
    private String manualProcessingNote;
    private boolean requiresManualProcessing;
    
    // Saga support
    private String sagaId;
    
    /**
     * Create successful refund result
     */
    public static RefundResult success(String refundId, String refundReference, 
                                     String externalRefundId, BigDecimal refundAmount, 
                                     PaymentGateway gateway) {
        return RefundResult.builder()
                .success(true)
                .message("Refund processed successfully")
                .refundId(refundId)
                .refundReference(refundReference)
                .externalRefundId(externalRefundId)
                .refundAmount(refundAmount)
                .gateway(gateway)
                .status(PaymentStatus.REFUND_PROCESSING)
                .processedAt(LocalDateTime.now())
                .build();
    }
    
    /**
     * Create failed refund result
     */
    public static RefundResult failure(String errorCode, String errorMessage, 
                                     BigDecimal refundAmount, PaymentGateway gateway) {
        return RefundResult.builder()
                .success(false)
                .message("Refund failed")
                .errorCode(errorCode)
                .errorMessage(errorMessage)
                .refundAmount(refundAmount)
                .gateway(gateway)
                .status(PaymentStatus.REFUND_FAILED)
                .processedAt(LocalDateTime.now())
                .build();
    }
    
    /**
     * Create pending refund result (for manual processing)
     */
    public static RefundResult pending(String refundId, String refundReference, 
                                     BigDecimal refundAmount, PaymentGateway gateway, 
                                     String processingNote) {
        return RefundResult.builder()
                .success(true)
                .message("Refund initiated, processing manually")
                .refundId(refundId)
                .refundReference(refundReference)
                .refundAmount(refundAmount)
                .gateway(gateway)
                .status(PaymentStatus.REFUND_PENDING)
                .requiresManualProcessing(true)
                .manualProcessingNote(processingNote)
                .initiatedAt(LocalDateTime.now())
                .expectedCompletionAt(LocalDateTime.now().plusDays(3)) // 3 business days
                .build();
    }
    
    /**
     * Check if refund is in final state
     */
    public boolean isFinalState() {
        return status != null && (status == PaymentStatus.REFUND_COMPLETED || 
                                status == PaymentStatus.REFUND_FAILED);
    }
    
    /**
     * Check if refund requires manual intervention
     */
    public boolean needsManualProcessing() {
        return requiresManualProcessing || gateway == PaymentGateway.VIETQR;
    }
    
    /**
     * Get refund processing time estimate in hours
     */
    public long getEstimatedProcessingHours() {
        return switch (gateway) {
            case STRIPE -> 1; // Usually instant to 1 hour
            case VIETQR -> 72; // 3 business days
            case PAYPAL -> 24; // 1 business day
            default -> 48; // 2 business days default
        };
    }
}
