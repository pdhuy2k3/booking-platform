package com.pdh.common.kafka.cdc.message.keys;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FlightMsgKey {
    private Long flightId;
}
