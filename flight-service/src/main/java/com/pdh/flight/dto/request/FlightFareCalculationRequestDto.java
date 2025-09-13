package com.pdh.flight.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * DTO for flight fare calculation requests
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightFareCalculationRequestDto {
    
    @NotNull(message = "Schedule IDs are required")
    private List<UUID> scheduleIds;
    
    @NotNull(message = "Fare class is required")
    private String fareClass;
    
    @NotNull(message = "Departure date is required")
    private LocalDate departureDate;
    
    @NotNull(message = "Passenger count is required")
    private Integer passengerCount;
    
    // Optional: Override base price for calculation
    private BigDecimal basePrice;
    
    // Optional: Override aircraft type for calculation
    private String aircraftType;
}