package com.pdh.flight.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for flight reservation requests (internal service communication)
 * Used when booking service calls flight service to reserve flights
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightReservationRequestDto {
    
    /**
     * Booking ID from booking service
     */
    @NotBlank(message = "Booking ID is required")
    private String bookingId;
    
    /**
     * Saga ID for tracking
     */
    @NotBlank(message = "Saga ID is required")
    private String sagaId;
    
    /**
     * Customer ID
     */
    @NotBlank(message = "Customer ID is required")
    private String customerId;
    
    /**
     * Flight ID to reserve
     */
    @NotBlank(message = "Flight ID is required")
    private String flightId;
    
    /**
     * Departure date
     */
    @NotNull(message = "Departure date is required")
    private LocalDate departureDate;
    
    /**
     * Return date (optional)
     */
    private LocalDate returnDate;
    
    /**
     * Passenger information
     */
    @NotNull(message = "Passenger information is required")
    private List<PassengerDto> passengers;
    
    /**
     * Seat class
     */
    @NotBlank(message = "Seat class is required")
    private String seatClass;
    
    /**
     * Special requests or notes
     */
    private String specialRequests;
    
    /**
     * Nested DTO for passenger information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassengerDto {
        
        @NotBlank(message = "First name is required")
        private String firstName;
        
        @NotBlank(message = "Last name is required")
        private String lastName;
        
        @NotNull(message = "Date of birth is required")
        private LocalDate dateOfBirth;
        
        private String passportNumber;
        
        @NotBlank(message = "Nationality is required")
        private String nationality;
        
        private String title; // Mr, Mrs, Ms, Dr, etc.
        
        private String specialAssistance;
        
        private String mealPreference;
        
        private String seatPreference;
    }
}
