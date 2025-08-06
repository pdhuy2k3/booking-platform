package com.pdh.payment.service.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Refund Request DTO
 * Used for refund processing requests
 */
@Data
public class RefundRequest {
    
    private UUID paymentId;
    private String sagaId;
    private BigDecimal amount; // null for full refund
    private String reason;
    private String requestedBy;
    private String metadata; // JSON format
    
    /**
     * Create full refund request
     */
    public static RefundRequest fullRefund(UUID paymentId, String sagaId, String reason) {
        RefundRequest request = new RefundRequest();
        request.setPaymentId(paymentId);
        request.setSagaId(sagaId);
        request.setReason(reason);
        return request;
    }
    
    /**
     * Create partial refund request
     */
    public static RefundRequest partialRefund(UUID paymentId, String sagaId, 
                                            BigDecimal amount, String reason) {
        RefundRequest request = new RefundRequest();
        request.setPaymentId(paymentId);
        request.setSagaId(sagaId);
        request.setAmount(amount);
        request.setReason(reason);
        return request;
    }
    
    /**
     * Validate request
     */
    public boolean isValid() {
        return paymentId != null && 
               sagaId != null && 
               reason != null && !reason.trim().isEmpty() &&
               (amount == null || amount.compareTo(BigDecimal.ZERO) > 0);
    }
    
    /**
     * Check if this is a full refund request
     */
    public boolean isFullRefund() {
        return amount == null;
    }
}
