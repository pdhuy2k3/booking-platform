package com.pdh.common.kafka.cdc.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Flight Fare CDC Message for Debezium events
 * Captures changes to flight fares which frequently change based on demand
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightFareCdcMessage {
    private Operation op;
    private FlightFare before;
    private FlightFare after;
    private String ts_ms;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FlightFare {
        private String id;
        private String scheduleId; // Needed to trace back to flight
        private String flightNumber;
        private String origin;
        private String destination;
        private String travelDate;
        private String classType; // economy, business, first
        private Double price;
        private String currency;
        private Integer availability; // number of seats available
        private String createdAt;
        private String updatedAt;
    }
}