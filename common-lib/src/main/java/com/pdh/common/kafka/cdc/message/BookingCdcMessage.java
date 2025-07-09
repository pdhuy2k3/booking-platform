package com.pdh.common.kafka.cdc.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Booking CDC Message
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCdcMessage {
    private Operation op;
    private Booking before;
    private Booking after;
    private String ts_ms;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Booking {
        private String id;
        private String customerId;
        private String status;
        private String bookingType;
        private Double totalAmount;
        private String createdAt;
        private String updatedAt;
    }
}
