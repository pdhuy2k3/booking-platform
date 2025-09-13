package com.pdh.flight.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for creating new flight fares
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightFareCreateDto {
    
    @NotNull(message = "Schedule ID is required")
    private UUID scheduleId;
    
    @NotBlank(message = "Fare class is required")
    @Pattern(regexp = "^(ECONOMY|PREMIUM_ECONOMY|BUSINESS|FIRST)$", 
            message = "Fare class must be ECONOMY, PREMIUM_ECONOMY, BUSINESS, or FIRST")
    private String fareClass;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.00", message = "Price must be non-negative")
    @DecimalMax(value = "999999999.99", message = "Price is too large")
    @Digits(integer = 9, fraction = 2, message = "Price must have at most 9 integer digits and 2 decimal places")
    private BigDecimal price;
    
    @NotNull(message = "Available seats is required")
    @Min(value = 0, message = "Available seats must be non-negative")
    @Max(value = 1000, message = "Available seats cannot exceed 1000")
    private Integer availableSeats;
}
