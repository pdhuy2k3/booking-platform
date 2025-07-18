package com.pdh.booking.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for return flight details (round trip)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnFlightDetailsDto {
    
    /**
     * Return flight ID
     */
    @NotBlank(message = "Return flight ID is required")
    private String flightId;
    
    /**
     * Return flight number
     */
    @NotBlank(message = "Return flight number is required")
    private String flightNumber;
    
    /**
     * Return departure date and time
     */
    @NotNull(message = "Return departure date is required")
    private LocalDateTime departureDateTime;
    
    /**
     * Return arrival date and time
     */
    @NotNull(message = "Return arrival date is required")
    private LocalDateTime arrivalDateTime;
    
    /**
     * Return flight price per passenger
     */
    @NotNull(message = "Return flight price is required")
    @Min(value = 0, message = "Return flight price must be positive")
    private Double pricePerPassenger;
    
    /**
     * Selected return seats
     */
    private List<String> selectedSeats;
}
