package com.pdh.payment.dto;

import com.pdh.payment.model.enums.PaymentGateway;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * Request DTO for creating payment intents (primarily for Stripe)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentIntentRequest {
    
    @NotNull(message = "Booking ID is required")
    private UUID bookingId;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    @NotBlank(message = "Currency is required")
    private String currency;
    
    @NotNull(message = "Payment gateway is required")
    private PaymentGateway gateway;
    
    private String customerEmail;
    private String customerName;
    private String description;
    private String returnUrl;
    private String cancelUrl;
    
    // Stripe-specific fields
    private String[] paymentMethodTypes;
    private boolean automaticPaymentMethodsEnabled;
    
    // Additional metadata
    private Map<String, Object> metadata;
    
    // VietQR specific fields for QR generation
    private String bankCode;
    private String accountNumber;
    private String accountName;
}
