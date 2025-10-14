package com.pdh.ai.rag.cdc.message;

import com.pdh.common.kafka.cdc.message.Operation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Hotel CDC Message for Debezium events
 * Captures changes to hotel information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelCdcMessage {
    private Operation op;
    private Hotel before;
    private Hotel after;
    private String ts_ms;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Hotel {
        private String id;
        private String name;
        private String description;
        private String address;
        private String city;
        private String country;
        private Double rating;
        private String amenities; // Comma-separated list of amenities
        private String createdAt;
        private String updatedAt;
    }
}