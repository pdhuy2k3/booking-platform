package com.pdh.common.kafka.cdc.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Room Availability CDC Message for Debezium events
 * Captures changes to hotel room availability which frequently changes
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomAvailabilityCdcMessage {
    private Operation op;
    private RoomAvailability before;
    private RoomAvailability after;
    private String ts_ms;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomAvailability {
        private String id;
        private String hotelId;
        private String roomType;
        private String date;
        private Integer availableRooms;
        private Double pricePerNight;
        private String currency;
        private String createdAt;
        private String updatedAt;
    }
}