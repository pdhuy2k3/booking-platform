package com.pdh.flight.dto.response;

import lombok.*;
import java.time.ZonedDateTime;

/**
 * DTO for flight leg information (for multi-leg flights)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightLegDto {
    private Long legId;
    private Long flightId;
    private Short legNumber;
    private ZonedDateTime departureTime;
    private ZonedDateTime arrivalTime;
    
    // Departure airport for this leg
    private Long departureAirportId;
    private String departureAirportName;
    private String departureAirportIataCode;
    private String departureAirportCity;
    private String departureAirportCountry;
    
    // Arrival airport for this leg
    private Long arrivalAirportId;
    private String arrivalAirportName;
    private String arrivalAirportIataCode;
    private String arrivalAirportCity;
    private String arrivalAirportCountry;
}
