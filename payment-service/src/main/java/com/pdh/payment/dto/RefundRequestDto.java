package com.pdh.payment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for refund requests in backoffice
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundRequestDto {
    
    @NotNull(message = "Refund amount is required")
    @DecimalMin(value = "0.01", message = "Refund amount must be greater than 0")
    private BigDecimal amount;
    
    @NotBlank(message = "Reason is required")
    private String reason;
}