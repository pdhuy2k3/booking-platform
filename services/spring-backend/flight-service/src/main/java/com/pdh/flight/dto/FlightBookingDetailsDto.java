package com.pdh.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for flight booking details (Flight Service local copy)
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
    private String flightId;
    
    /**
     * Flight number (e.g., VN123)
     */
    private String flightNumber;
    
    /**
     * Airline code (e.g., VN for Vietnam Airlines)
     */
    private String airline;
    
    /**
     * Origin airport code (e.g., HAN)
     */
    private String originAirport;
    
    /**
     * Destination airport code (e.g., SGN)
     */
    private String destinationAirport;
    
    /**
     * Departure date and time
     */
    private LocalDateTime departureDateTime;
    
    /**
     * Arrival date and time
     */
    private LocalDateTime arrivalDateTime;
    
    /**
     * Seat class (ECONOMY, BUSINESS, FIRST)
     */
    private String seatClass;
    
    /**
     * Number of passengers
     */
    private Integer passengerCount;
    
    /**
     * Passenger details
     */
    private List<PassengerDetailsDto> passengers;
    
    /**
     * Selected seat numbers (optional)
     */
    private List<String> selectedSeats;
    
    /**
     * Flight price per passenger
     */
    private Double pricePerPassenger;
    
    /**
     * Total flight price (price * passengers)
     */
    private Double totalFlightPrice;
    
    /**
     * Return flight details (for round trip)
     */
    private ReturnFlightDetailsDto returnFlight;
    
    /**
     * Nested class for passenger details
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassengerDetailsDto {
        private String firstName;
        private String lastName;
        private String dateOfBirth;
        private String title;
        private String email;
        private String phone;
        private String nationality;
        private String passportNumber;
        private String specialRequests;
        private Boolean isPrimaryPassenger;
    }
    
    /**
     * Nested class for return flight details
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReturnFlightDetailsDto {
        private String flightId;
        private String flightNumber;
        private LocalDateTime departureDateTime;
        private LocalDateTime arrivalDateTime;
        private String seatClass;
        private List<String> selectedSeats;
        private Double pricePerPassenger;
        private Double totalPrice;
    }
}
