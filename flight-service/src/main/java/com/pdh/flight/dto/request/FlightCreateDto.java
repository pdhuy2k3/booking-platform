package com.pdh.flight.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for creating new flights
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightCreateDto {
    
    @NotBlank(message = "Flight number is required")
    @Size(max = 20, message = "Flight number cannot exceed 20 characters")
    @Pattern(regexp = "^[A-Z0-9]{2,20}$", message = "Flight number must contain only uppercase letters and numbers")
    private String flightNumber;
    
    @NotNull(message = "Airline is required")
    @Positive(message = "Airline ID must be positive")
    private Long airlineId;
    
    @NotNull(message = "Departure airport is required")
    @Positive(message = "Departure airport ID must be positive")
    private Long departureAirportId;
    
    @NotNull(message = "Arrival airport is required")
    @Positive(message = "Arrival airport ID must be positive")
    private Long arrivalAirportId;
    
    @Min(value = 30, message = "Duration must be at least 30 minutes")
    @Max(value = 1440, message = "Duration cannot exceed 1440 minutes (24 hours)")
    private Integer baseDurationMinutes;
    
    @Size(max = 50, message = "Aircraft type cannot exceed 50 characters")
    private String aircraftType;
    
    @NotBlank(message = "Status is required")
    @Pattern(regexp = "^(ACTIVE|CANCELLED|DELAYED)$", message = "Status must be ACTIVE, CANCELLED, or DELAYED")
    private String status = "ACTIVE";
    
    @DecimalMin(value = "0.00", message = "Base price must be non-negative")
    @DecimalMax(value = "999999999.99", message = "Base price is too large")
    @Digits(integer = 9, fraction = 2, message = "Base price must have at most 9 integer digits and 2 decimal places")
    private BigDecimal basePrice;
    
    // Images field for frontend MediaSelector compatibility
    private List<String> images;
    
    @AssertTrue(message = "Departure and arrival airports cannot be the same")
    private boolean isDifferentAirports() {
        if (departureAirportId == null || arrivalAirportId == null) {
            return true; // Let @NotNull handle null validation
        }
        return !departureAirportId.equals(arrivalAirportId);
    }
}
