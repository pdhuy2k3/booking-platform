package com.pdh.payment.dto;

import com.pdh.payment.model.enums.PaymentMethodType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * Stripe PaymentIntent Request DTO
 * Used for creating PaymentIntents with Stripe Elements integration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StripePaymentIntentRequest {
    
    @NotNull(message = "Booking ID is required")
    private UUID bookingId;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be 3 characters")
    private String currency;
    
    @NotNull(message = "Payment method type is required")
    private PaymentMethodType paymentMethodType;
    
    private String description;
    private String sagaId;
    
    // Stripe-specific fields
    private String paymentMethodId; // For existing payment methods
    private String customerId; // Stripe customer ID
    
    // 3D Secure and confirmation
    private String returnUrl;
    private String cancelUrl;
    @Builder.Default
    private Boolean confirmPayment = false;
    
    // Customer information
    private String customerEmail;
    private String customerName;
    private String customerPhone;
    
    // Billing address
    private StripeAddressDto billingAddress;
    
    // Additional metadata
    private Map<String, String> metadata;
    
    /**
     * Nested DTO for billing address
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StripeAddressDto {
        private String line1;
        private String line2;
        private String city;
        private String state;
        private String postalCode;
        private String country;
    }
}
