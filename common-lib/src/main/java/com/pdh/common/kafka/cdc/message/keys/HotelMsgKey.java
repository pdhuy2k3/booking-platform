package com.pdh.common.kafka.cdc.message.keys;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Hotel message key for Kafka CDC
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelMsgKey {
    private Long hotelId;
}