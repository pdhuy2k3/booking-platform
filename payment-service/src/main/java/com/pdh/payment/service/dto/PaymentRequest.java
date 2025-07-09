package com.pdh.payment.service.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * Payment Request DTO
 * Used for payment processing requests
 */
@Data
public class PaymentRequest {
    
    private UUID bookingId;
    private UUID userId;
    private UUID customerId;
    private String sagaId;
    private BigDecimal amount;
    private String currency = "VND";
    private String description;
    private UUID paymentMethodId;
    private String ipAddress;
    private String userAgent;
    private String metadata; // JSON format
    private Map<String, Object> additionalData;
    
    /**
     * Create payment request for booking
     */
    public static PaymentRequest forBooking(UUID bookingId, UUID userId, String sagaId, 
                                          BigDecimal amount, String currency, 
                                          UUID paymentMethodId, String description) {
        PaymentRequest request = new PaymentRequest();
        request.setBookingId(bookingId);
        request.setUserId(userId);
        request.setSagaId(sagaId);
        request.setAmount(amount);
        request.setCurrency(currency);
        request.setPaymentMethodId(paymentMethodId);
        request.setDescription(description);
        return request;
    }
    
    /**
     * Validate request
     */
    public boolean isValid() {
        return bookingId != null && 
               userId != null && 
               sagaId != null && 
               amount != null && amount.compareTo(BigDecimal.ZERO) > 0 &&
               currency != null && 
               paymentMethodId != null;
    }
}
