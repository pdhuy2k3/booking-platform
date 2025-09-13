package com.pdh.flight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for pricing strategy configuration response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingStrategyConfigResponseDto {
    
    private Long strategyId;
    private String strategyName;
    private String description;
    private BigDecimal baseMultiplier;
    private BigDecimal demandFactor;
    private BigDecimal advanceBookingFactor;
    private BigDecimal seasonalityFactor;
    private Map<String, BigDecimal> fareClassMultipliers;
    private Boolean isActive;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}