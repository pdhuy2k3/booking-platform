package com.pdh.common.kafka.cdc.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Flight CDC Message for Debezium events
 * Captures changes to flights including airline and airport information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightCdcMessage {
    private Operation op;
    private Flight before;
    private Flight after;
    private String ts_ms;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Flight {
        private String id;
        private String flightNumber;
        private String aircraftType;
        private String status;
        private String basePrice;
        private String airlineName;
        private String airlineCode;
        private String departureAirportName;
        private String departureAirportCode;
        private String departureCity;
        private String departureCountry;
        private String arrivalAirportName;
        private String arrivalAirportCode;
        private String arrivalCity;
        private String arrivalCountry;
        private String createdAt;
        private String updatedAt;
    }
}