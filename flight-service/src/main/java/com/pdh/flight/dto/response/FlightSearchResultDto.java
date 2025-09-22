package com.pdh.flight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;

/**
 * DTO for individual flight search result
 * Frontend-compatible with string IDs and double prices
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightSearchResultDto {
    
    /**
     * Flight identifier (string for frontend compatibility)
     */
    private String flightId;
    
    /**
     * Airline information
     */
    private String airline;
    private String airlineCode;
    private String airlineLogo;
    
    
    /**
     * Flight number
     */
    private String flightNumber;
    
    /**
     * Route information
     */
    private String origin;
    private String destination;
    private String originName;
    private String destinationName;
    private Double originLatitude;
    private Double originLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;
    
    /**
     * Schedule information
     */
    private String departureTime; // HH:mm format for display
    private String arrivalTime;   // HH:mm format for display
    private ZonedDateTime departureDateTime; // Full datetime for processing
    private ZonedDateTime arrivalDateTime;   // Full datetime for processing
    
    /**
     * Duration information
     */
    private String duration; // Formatted duration (e.g., "2h 30m")
    private Integer durationMinutes; // Duration in minutes for calculations
    
    /**
     * Pricing information (frontend-compatible)
     */
    private Double price;
    private String currency;
    private String formattedPrice; // Formatted price with currency symbol
    
    /**
     * Seat information
     */
    private String seatClass;
    private Integer availableSeats;
    private Integer totalSeats;
    
    /**
     * Aircraft information
     */
    private String aircraft;
    private String aircraftType;
    
    /**
     * Additional flight details
     */
    private Integer stops;
    private List<String> stopAirports;
    private String terminal;
    private String gate;
    
    /**
     * Service information
     */
    private List<String> amenities;
    private String mealService;
    private Boolean wifiAvailable;
    private Boolean entertainmentAvailable;
    
    /**
     * Booking information
     */
    private String bookingClass;
    private String fareType; // Economy, Premium Economy, Business, First
    private Boolean refundable;
    private Boolean changeable;
    
    /**
     * Baggage information
     */
    private BaggageInfo baggage;
    
    /**
     * Nested class for baggage information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BaggageInfo {
        private String cabinBaggage; // e.g., "7kg"
        private String checkedBaggage; // e.g., "20kg"
        private Boolean additionalBaggageAvailable;
        private Double additionalBaggagePrice;
    }
}
