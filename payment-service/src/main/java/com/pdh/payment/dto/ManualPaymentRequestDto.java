package com.pdh.payment.dto;

import com.pdh.payment.model.enums.PaymentMethodType;
import com.pdh.payment.model.enums.PaymentProvider;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for manual payment processing in backoffice
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManualPaymentRequestDto {
    
    @NotNull(message = "Booking ID is required")
    private UUID bookingId;
    
    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;
    
    @NotBlank(message = "Currency is required")
    @Size(min = 3, max = 3, message = "Currency must be 3 characters")
    private String currency;
    
    private String description;
    
    @NotNull(message = "Payment method type is required")
    private PaymentMethodType methodType;
    
    @NotNull(message = "Payment provider is required")
    private PaymentProvider provider;
    
    private Map<String, Object> additionalData;
}