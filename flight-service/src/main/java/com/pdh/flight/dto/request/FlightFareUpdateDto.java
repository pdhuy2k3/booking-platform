package com.pdh.flight.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for updating existing flight fares
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightFareUpdateDto {
    
    @Pattern(regexp = "^(ECONOMY|PREMIUM_ECONOMY|BUSINESS|FIRST)$", 
            message = "Fare class must be ECONOMY, PREMIUM_ECONOMY, BUSINESS, or FIRST")
    private String fareClass;
    
    @DecimalMin(value = "0.00", message = "Price must be non-negative")
    @DecimalMax(value = "999999999.99", message = "Price is too large")
    @Digits(integer = 9, fraction = 2, message = "Price must have at most 9 integer digits and 2 decimal places")
    private BigDecimal price;
    
    @Min(value = 0, message = "Available seats must be non-negative")
    @Max(value = 1000, message = "Available seats cannot exceed 1000")
    private Integer availableSeats;
}
