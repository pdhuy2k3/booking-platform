package com.pdh.flight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for flight fare calculation results
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightFareCalculationResultDto {
    
    private UUID scheduleId;
    private String flightNumber;
    private String origin;
    private String destination;
    private String aircraftType;
    private String fareClass;
    private BigDecimal calculatedPrice;
    private Integer availableSeats;
    private String currency;
    private Double demandMultiplier;
    private Double timeMultiplier;
    private Double seasonalityMultiplier;
    private Double fareClassMultiplier;
}