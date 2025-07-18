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
 * Payment Process Request DTO for REST API
 * Used by frontend and other services to initiate payments
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentProcessRequest {
    
    @NotNull(message = "Booking ID is required")
    private UUID bookingId;
    
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
    
    // Payment method details
    private String paymentMethodId; // For existing payment methods
    private String paymentMethodToken; // For new payment methods (Stripe)
    
    // Customer information will be fetched from customer service
    
    // Gateway-specific fields
    private String returnUrl;
    private String cancelUrl;
    
    // VietQR specific
    private String bankCode;
    private String accountNumber;
    private String accountName;
    
    // Additional data
    private Map<String, Object> additionalData;
    
    /**
     * Convert to PaymentRequest for strategy processing
     * Note: userId and customer data will be populated from JWT and customer service
     */
    public PaymentRequest toPaymentRequest(UUID userId) {
        return PaymentRequest.builder()
                .bookingId(bookingId)
                .userId(userId)
                .amount(amount)
                .currency(currency)
                .gateway(gateway)
                .paymentMethodType(paymentMethodType)
                .sagaId(sagaId)
                .description(description)
                .paymentMethodId(paymentMethodId)
                .returnUrl(returnUrl)
                .cancelUrl(cancelUrl)
                .bankCode(bankCode)
                .accountNumber(accountNumber)
                .accountName(accountName)
                .metadata(additionalData)
                .build();
    }
}
