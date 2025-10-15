package com.pdh.common.kafka.cdc.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Room Type CDC Message for Debezium events
 * Captures changes to room type information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeCdcMessage {
    private Operation op;
    private RoomType before;
    private RoomType after;
    private String ts_ms;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomType {
        private String id;
        private String hotelId;
        private String name;
        private String description;
        private Integer maxOccupancy;
        private String amenities; // Comma-separated list of room-specific amenities
        private String createdAt;
        private String updatedAt;
    }
}