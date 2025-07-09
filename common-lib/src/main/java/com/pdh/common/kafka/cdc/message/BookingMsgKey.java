package com.pdh.common.kafka.cdc.message;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Booking message key for Kafka CDC
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingMsgKey {
    private String id;
}
