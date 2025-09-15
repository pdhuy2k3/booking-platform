package com.pdh.flight.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * DTO for flight search requests
 * Used for both storefront and backoffice flight searches
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightSearchRequestDto {
    
    /**
     * Origin airport code (IATA)
     */
    @NotBlank(message = "Origin airport is required")
    @Size(min = 3, max = 3, message = "Origin must be 3-character IATA code")
    private String origin;
    
    /**
     * Destination airport code (IATA)
     */
    @NotBlank(message = "Destination airport is required")
    @Size(min = 3, max = 3, message = "Destination must be 3-character IATA code")
    private String destination;
    
    /**
     * Departure date
     */
    @NotNull(message = "Departure date is required")
    @Future(message = "Departure date must be in the future")
    private LocalDate departureDate;
    
    /**
     * Return date (optional for one-way flights)
     */
    private LocalDate returnDate;
    
    /**
     * Number of passengers
     */
    @NotNull(message = "Number of passengers is required")
    @Min(value = 1, message = "At least 1 passenger is required")
    private Integer passengers;
    
    /**
     * Seat class preference
     */
    @NotBlank(message = "Seat class is required")
    private String seatClass;
    
    // Optional search filters
    
    /**
     * Minimum price filter
     */
    private Double minPrice;
    
    /**
     * Maximum price filter
     */
    private Double maxPrice;
    
    /**
     * Preferred airlines (comma-separated)
     */
    private String airlines;
    
    /**
     * Origin airport filter (comma-separated IATA codes)
     */
    private String originAirports;
    
    /**
     * Destination airport filter (comma-separated IATA codes)
     */
    private String destinationAirports;
    
    /**
     * Maximum number of stops
     */
    private Integer maxStops;
    
    /**
     * Maximum flight duration in minutes
     */
    private Integer maxDuration;
    
    /**
     * Departure time range start (HH:mm)
     */
    private String departureTimeStart;
    
    /**
     * Departure time range end (HH:mm)
     */
    private String departureTimeEnd;
    
    /**
     * Arrival time range start (HH:mm)
     */
    private String arrivalTimeStart;
    
    /**
     * Arrival time range end (HH:mm)
     */
    private String arrivalTimeEnd;
    
    /**
     * Sort by criteria (price, duration, departure, arrival)
     */
    @Builder.Default
    private String sortBy = "price";
    
    /**
     * Sort order (asc, desc)
     */
    @Builder.Default
    private String sortOrder = "asc";
    
    /**
     * Page number for pagination
     */
    @Builder.Default
    private Integer page = 1;
    
    /**
     * Number of results per page
     */
    @Builder.Default
    private Integer limit = 20;
}
