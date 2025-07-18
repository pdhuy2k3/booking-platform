package com.pdh.flight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for flight reservation response
 * Used for internal service communication
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightReservationResponseDto {
    
    /**
     * Response status
     */
    private String status; // success, failed, pending
    
    /**
     * Response message
     */
    private String message;
    
    /**
     * Reservation details
     */
    private String reservationId;
    private String bookingId;
    private String sagaId;
    private String flightId;
    
    /**
     * Confirmation details
     */
    private String confirmationNumber;
    private LocalDateTime reservationTime;
    private LocalDateTime expirationTime;
    
    /**
     * Flight details
     */
    private FlightDetails flight;
    
    /**
     * Passenger details
     */
    private List<PassengerReservation> passengers;
    
    /**
     * Pricing information
     */
    private Double totalAmount;
    private String currency;
    private List<FareBreakdown> fareBreakdown;
    
    /**
     * Seat assignments (if available)
     */
    private List<SeatAssignment> seatAssignments;
    
    /**
     * Additional services
     */
    private List<AdditionalService> additionalServices;
    
    /**
     * Nested class for flight details
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FlightDetails {
        private String flightNumber;
        private String airline;
        private String origin;
        private String destination;
        private LocalDateTime departureTime;
        private LocalDateTime arrivalTime;
        private String aircraft;
        private String terminal;
        private String gate;
    }
    
    /**
     * Nested class for passenger reservation
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PassengerReservation {
        private String passengerId;
        private String firstName;
        private String lastName;
        private String title;
        private String seatNumber;
        private String ticketNumber;
        private String boardingPass;
    }
    
    /**
     * Nested class for fare breakdown
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FareBreakdown {
        private String description;
        private Double amount;
        private String currency;
        private String type; // base_fare, taxes, fees, etc.
    }
    
    /**
     * Nested class for seat assignment
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SeatAssignment {
        private String passengerId;
        private String seatNumber;
        private String seatType; // window, aisle, middle
        private String seatClass;
        private Double extraCost;
    }
    
    /**
     * Nested class for additional services
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdditionalService {
        private String serviceId;
        private String serviceName;
        private String description;
        private Double price;
        private String currency;
        private Boolean selected;
    }
}
