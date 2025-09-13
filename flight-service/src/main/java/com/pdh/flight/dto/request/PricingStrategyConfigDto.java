package com.pdh.flight.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * DTO for pricing strategy configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingStrategyConfigDto {
    
    private Long strategyId;
    
    @NotNull(message = "Strategy name is required")
    private String strategyName;
    
    private String description;
    
    @DecimalMin(value = "0.1", message = "Base multiplier must be at least 0.1")
    @DecimalMax(value = "5.0", message = "Base multiplier cannot exceed 5.0")
    private BigDecimal baseMultiplier;
    
    // Demand-based pricing factors
    @DecimalMin(value = "0.0", message = "Demand factor must be non-negative")
    @DecimalMax(value = "2.0", message = "Demand factor cannot exceed 2.0")
    private BigDecimal demandFactor;
    
    // Time-based pricing factors
    @DecimalMin(value = "0.0", message = "Advance booking factor must be non-negative")
    @DecimalMax(value = "2.0", message = "Advance booking factor cannot exceed 2.0")
    private BigDecimal advanceBookingFactor;
    
    // Seasonality factors
    @DecimalMin(value = "0.0", message = "Seasonality factor must be non-negative")
    @DecimalMax(value = "2.0", message = "Seasonality factor cannot exceed 2.0")
    private BigDecimal seasonalityFactor;
    
    // Custom fare class multipliers
    private Map<String, BigDecimal> fareClassMultipliers;
    
    private Boolean isActive;
}