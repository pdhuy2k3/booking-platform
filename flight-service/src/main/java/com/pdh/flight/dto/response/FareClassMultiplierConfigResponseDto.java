package com.pdh.flight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for fare class multiplier configuration response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FareClassMultiplierConfigResponseDto {
    
    private String fareClass;
    private BigDecimal multiplier;
    private String description;
    private Boolean isActive;
}