package com.pdh.ai.rag.cdc.message;

import com.pdh.common.kafka.cdc.message.Operation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Flight Schedule CDC Message for Debezium events
 * Captures changes to flight schedules which frequently change
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightScheduleCdcMessage {
    private Operation op;
    private FlightSchedule before;
    private FlightSchedule after;
    private String ts_ms;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FlightSchedule {
        private String id;
        private String flightId; // Needed to trace back to flight
        private String flightNumber;
        private String airline;
        private String origin;
        private String destination;
        private String departureDate;
        private String departureTime;
        private String arrivalDate;
        private String arrivalTime;
        private String status; // e.g., on-time, delayed, cancelled
        private String aircraftType;
        private String createdAt;
        private String updatedAt;
    }
}