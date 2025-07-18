package com.pdh.common.kafka.cdc.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Hotel Outbox CDC Message for Debezium events
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelOutboxCdcMessage {
    private Operation op;
    private HotelOutboxEvent before;
    private HotelOutboxEvent after;
    private String ts_ms;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HotelOutboxEvent {
        private String id;
        private String aggregate_type;
        private String aggregate_id;
        private String event_type;
        private String payload;
        private String created_at;
    }
}
