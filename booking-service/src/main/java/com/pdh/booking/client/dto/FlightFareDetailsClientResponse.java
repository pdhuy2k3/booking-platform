package com.pdh.booking.client.dto;

import java.math.BigDecimal;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

/**
 * Minimal projection of the flight fare details returned by flight-service.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class FlightFareDetailsClientResponse {

    private UUID fareId;
    private UUID scheduleId;
    private Long flightId;
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

    @JsonProperty("flightId")
    public void setFlightId(Object value) {
        if (value instanceof Number number) {
            this.flightId = number.longValue();
        } else if (value instanceof String str && !str.isBlank()) {
            try {
                this.flightId = Long.parseLong(str);
            } catch (NumberFormatException ignored) {
                this.flightId = null;
            }
        }
    }

    public void setFlightId(Long value) {
        this.flightId = value;
    }
}
