package com.pdh.flight.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

/**
 * DTO for creating new flight schedules
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightScheduleCreateDto {
    
    @NotNull(message = "Flight ID is required")
    private Long flightId;
    
    @NotNull(message = "Departure time is required")
    @Future(message = "Departure time must be in the future")
    private ZonedDateTime departureTime;
    
    @NotNull(message = "Arrival time is required")
    @Future(message = "Arrival time must be in the future")
    private ZonedDateTime arrivalTime;
    
    @NotNull(message = "Aircraft ID is required")
    private Long aircraftId;
    
    @Pattern(regexp = "^(SCHEDULED|ACTIVE|DELAYED|CANCELLED|COMPLETED)$", 
            message = "Status must be SCHEDULED, ACTIVE, DELAYED, CANCELLED, or COMPLETED")
    private String status = "SCHEDULED";
    
    @AssertTrue(message = "Arrival time must be after departure time")
    public boolean isArrivalTimeAfterDepartureTime() {
        if (departureTime == null || arrivalTime == null) {
            return true; // Let @NotNull handle null validation
        }
        return arrivalTime.isAfter(departureTime);
    }
    
    @AssertTrue(message = "Flight duration must be reasonable (between 30 minutes and 20 hours)")
    public boolean isReasonableFlightDuration() {
        if (departureTime == null || arrivalTime == null) {
            return true; // Let @NotNull handle null validation
        }
        long durationMinutes = java.time.Duration.between(departureTime, arrivalTime).toMinutes();
        return durationMinutes >= 30 && durationMinutes <= 1200; // 30 minutes to 20 hours
    }
}
