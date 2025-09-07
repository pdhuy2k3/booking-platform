package com.pdh.flight.dto.response;

import lombok.*;
import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * DTO for flight schedule information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightScheduleDto {
    private UUID scheduleId;
    private Long flightId;
    private ZonedDateTime departureTime;
    private ZonedDateTime arrivalTime;
    private String aircraftType;
    private String status;
}
