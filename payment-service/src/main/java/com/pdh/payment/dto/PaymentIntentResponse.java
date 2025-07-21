package com.pdh.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Response DTO for payment intent creation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentIntentResponse {
    
    private String paymentIntentId;
    private String clientSecret;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String gateway;
    
    // Stripe-specific fields
    private String[] paymentMethodTypes;
    
    // VietQR specific fields
    private String qrCodeUrl;
    private String qrCodeData;
    private String transferInfo;
    
    // Common fields
    private String description;
    private Map<String, Object> metadata;
    private String createdAt;
}
