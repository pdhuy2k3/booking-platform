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
    private Long aircraftId;
    private String status;
    
    // Enhanced fields for backoffice management
    private FlightDto flight;          // Complete flight information
    private AircraftDto aircraft;      // Complete aircraft information
    private Long durationMinutes;      // Calculated duration
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
