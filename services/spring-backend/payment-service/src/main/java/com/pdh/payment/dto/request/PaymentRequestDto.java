package com.pdh.payment.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.util.Map;

/**
 * DTO for payment processing requests
 * Used for both storefront and internal payment processing
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDto {
    
    /**
     * Booking ID associated with this payment
     */
    @NotBlank(message = "Booking ID is required")
    private String bookingId;
    
    /**
     * User ID making the payment
     */
    @NotBlank(message = "User ID is required")
    private String userId;
    
    /**
     * Saga ID for tracking
     */
    @NotBlank(message = "Saga ID is required")
    private String sagaId;
    
    /**
     * Payment amount
     */
    @NotNull(message = "Payment amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Payment amount must be greater than 0")
    private BigDecimal amount;
    
    /**
     * Currency code
     */
    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be 3 characters")
    private String currency;
    
    /**
     * Payment description
     */
    private String description;
    
    /**
     * Payment method information
     */
    @NotNull(message = "Payment method is required")
    private PaymentMethodDto paymentMethod;
    
    /**
     * Customer information for payment processing
     */
    private CustomerInfoDto customerInfo;
    
    /**
     * Additional metadata
     */
    private Map<String, Object> metadata;
    
    /**
     * Nested DTO for payment method
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentMethodDto {
        
        @NotBlank(message = "Payment method type is required")
        private String type; // CREDIT_CARD, DEBIT_CARD, BANK_TRANSFER, E_WALLET
        
        // Credit/Debit Card fields
        private String cardNumber;
        private String cardholderName;
        private String expiryMonth;
        private String expiryYear;
        private String cvv;
        
        // Bank transfer fields
        private String bankCode;
        private String accountNumber;
        private String accountName;
        
        // E-wallet fields
        private String walletType; // MOMO, ZALOPAY, VNPAY, etc.
        private String walletAccount;
        
        // Additional security
        private String securityCode;
        private Boolean saveForFuture;
    }
    
    /**
     * Nested DTO for customer information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerInfoDto {
        
        private String firstName;
        private String lastName;
        private String email;
        private String phone;
        
        // Billing address
        private String billingAddress;
        private String billingCity;
        private String billingState;
        private String billingCountry;
        private String billingPostalCode;
        
        // Additional info for fraud prevention
        private String ipAddress;
        private String userAgent;
        private String deviceFingerprint;
    }
}
