package com.pdh.common.kafka.cdc.message.keys;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Room Type message key for Kafka CDC
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeMsgKey {
    private Long roomTypeId;
}