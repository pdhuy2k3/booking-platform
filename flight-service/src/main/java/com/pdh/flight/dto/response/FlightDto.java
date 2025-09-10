package com.pdh.flight.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for flight data transfer
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightDto {
    
    private Long flightId;
    
    private String flightNumber;
    
    private Integer baseDurationMinutes;
    
    private String aircraftType;
    
    private String status;
    
    private BigDecimal basePrice;
    
    private Boolean isActive;
    
    // Airline information
    private Long airlineId;
    private String airlineName;
    private String airlineIataCode;
    
    // Departure airport information
    private Long departureAirportId;
    private String departureAirportName;
    private String departureAirportIataCode;
    private String departureAirportCity;
    private String departureAirportCountry;
    
    // Arrival airport information
    private Long arrivalAirportId;
    private String arrivalAirportName;
    private String arrivalAirportIataCode;
    private String arrivalAirportCity;
    private String arrivalAirportCountry;
    
    // Flight scheduling and timing information
    private List<FlightScheduleDto> schedules;
    
    // Pricing information
    private List<FlightFareDto> fares;
    
    // Audit information
    private LocalDateTime createdAt;
    private String createdBy;
    private LocalDateTime updatedAt;
    private String updatedBy;
    
    // Statistics (for list view)
    private Long totalSchedules;
    private Long activeSchedules;
    private Long totalBookings;
    
    // Media information fetched from media-service
    private List<MediaInfo> images;
    private MediaInfo primaryImage;
    private Boolean hasMedia;
    private Long mediaCount;
}
