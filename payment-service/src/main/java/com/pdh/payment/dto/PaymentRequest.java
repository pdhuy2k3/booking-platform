package com.pdh.payment.dto;

import com.pdh.payment.model.enums.PaymentGateway;
import com.pdh.payment.model.enums.PaymentMethodType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * Payment Request DTO for Strategy Pattern
 * Contains all necessary information for processing payments across different gateways
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {
    
    @NotNull(message = "Booking ID is required")
    private UUID bookingId;
    
    @NotNull(message = "User ID is required")
    private UUID userId;
    
    private UUID customerId;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    @NotBlank(message = "Currency is required")
    private String currency;
    
    @NotNull(message = "Payment gateway is required")
    private PaymentGateway gateway;
    
    @NotNull(message = "Payment method type is required")
    private PaymentMethodType paymentMethodType;
    
    private String sagaId;
    
    private String description;
    
    // Gateway-specific data
    private String paymentMethodId; // For Stripe: payment method ID
    private String returnUrl;
    private String cancelUrl;
    
    // Customer information
    private String customerEmail;
    private String customerName;
    private String customerPhone;
    
    // Billing address
    private String billingAddressLine1;
    private String billingAddressLine2;
    private String billingCity;
    private String billingState;
    private String billingCountry;
    private String billingPostalCode;
    
    // Additional metadata
    private Map<String, Object> metadata;
    
    // VietQR specific fields
    private String bankCode;
    private String accountNumber;
    private String accountName;
    
    /**
     * Validate request based on gateway requirements
     */
    public void validate() {
        if (gateway == PaymentGateway.STRIPE) {
            validateStripeRequest();
        } else if (gateway == PaymentGateway.VIETQR) {
            validateVietQRRequest();
        }
    }
    
    private void validateStripeRequest() {
        if (paymentMethodId == null || paymentMethodId.trim().isEmpty()) {
            throw new IllegalArgumentException("Payment method ID is required for Stripe payments");
        }
        if (customerEmail == null || customerEmail.trim().isEmpty()) {
            throw new IllegalArgumentException("Customer email is required for Stripe payments");
        }
    }
    
    private void validateVietQRRequest() {
        if (bankCode == null || bankCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Bank code is required for VietQR payments");
        }
        if (accountNumber == null || accountNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Account number is required for VietQR payments");
        }
    }
    
    /**
     * Get gateway-specific reference
     */
    public String getGatewayReference() {
        return gateway.getCode() + "-" + bookingId.toString().substring(0, 8);
    }
    
    /**
     * Check if request is for test environment
     */
    public boolean isTestMode() {
        return gateway == PaymentGateway.MOCK || 
               (metadata != null && Boolean.TRUE.equals(metadata.get("test_mode")));
    }
}
