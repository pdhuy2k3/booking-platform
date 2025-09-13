package com.pdh.flight.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for fare class multiplier configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FareClassMultiplierConfigDto {
    
    @NotNull(message = "Fare class is required")
    private String fareClass;
    
    @NotNull(message = "Multiplier is required")
    @DecimalMin(value = "0.1", message = "Multiplier must be at least 0.1")
    private BigDecimal multiplier;
    
    private String description;
}