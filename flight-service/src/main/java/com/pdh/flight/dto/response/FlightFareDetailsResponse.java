package com.pdh.flight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightFareDetailsResponse {

    private UUID fareId;
    private UUID scheduleId;
    private String seatClass;
    private BigDecimal price;
    private String currency;
    private Integer availableSeats;

    private String departureTime;
    private String arrivalTime;
    private String flightNumber;
    private String airline;
    private String originAirport;
    private String destinationAirport;
    private String aircraftType;

    private String duration;
    private String airlineLogo;

    private Double originLatitude;
    private Double originLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;
}
