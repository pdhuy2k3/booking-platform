package com.pdh.booking.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for flight booking details
 * Contains all information about the selected flight and passengers
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightBookingDetailsDto {
    
    /**
     * Selected flight ID from flight service
     */
    @NotBlank(message = "Flight ID is required")
    private String flightId;
    
    /**
     * Flight number (e.g., VN123)
     */
    @NotBlank(message = "Flight number is required")
    private String flightNumber;
    
    /**
     * Airline code (e.g., VN for Vietnam Airlines)
     */
    @NotBlank(message = "Airline is required")
    private String airline;
    
    /**
     * Origin airport code (e.g., HAN)
     */
    @NotBlank(message = "Origin airport is required")
    @Size(min = 3, max = 3, message = "Airport code must be 3 characters")
    private String originAirport;
    
    /**
     * Destination airport code (e.g., SGN)
     */
    @NotBlank(message = "Destination airport is required")
    @Size(min = 3, max = 3, message = "Airport code must be 3 characters")
    private String destinationAirport;
    
    /**
     * Departure date and time
     */
    @NotNull(message = "Departure date is required")
    private LocalDateTime departureDateTime;
    
    /**
     * Arrival date and time
     */
    @NotNull(message = "Arrival date is required")
    private LocalDateTime arrivalDateTime;
    
    /**
     * Seat class (ECONOMY, BUSINESS, FIRST)
     */
    @NotBlank(message = "Seat class is required")
    private String seatClass;
    
    /**
     * Number of passengers
     */
    @NotNull(message = "Number of passengers is required")
    @Min(value = 1, message = "At least 1 passenger is required")
    private Integer passengerCount;
    
    /**
     * Passenger details
     */
    @NotNull(message = "Passenger details are required")
    @Size(min = 1, message = "At least 1 passenger is required")
    private List<PassengerDetailsDto> passengers;
    
    /**
     * Selected seat numbers (optional)
     */
    private List<String> selectedSeats;
    
    /**
     * Flight price per passenger
     */
    @NotNull(message = "Flight price is required")
    @Min(value = 0, message = "Flight price must be positive")
    private Double pricePerPassenger;
    
    /**
     * Total flight price (price * passengers)
     */
    @NotNull(message = "Total flight price is required")
    @Min(value = 0, message = "Total flight price must be positive")
    private Double totalFlightPrice;
    
    /**
     * Return flight details (for round trip)
     */
    private ReturnFlightDetailsDto returnFlight;
    
    /**
     * Additional flight services (meals, baggage, etc.)
     */
    private List<FlightServiceDto> additionalServices;
    
    /**
     * Special requests or notes
     */
    private String specialRequests;
}
