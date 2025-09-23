package com.pdh.flight.dto.request;

import com.pdh.flight.model.enums.ScheduleStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

/**
 * DTO for updating existing flight schedules
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightScheduleUpdateDto {
    
    @Future(message = "Departure time must be in the future")
    private ZonedDateTime departureTime;
    
    @Future(message = "Arrival time must be in the future") 
    private ZonedDateTime arrivalTime;
    
    private Long aircraftId;
    
    private ScheduleStatus status;
    
    @AssertTrue(message = "Arrival time must be after departure time")
    public boolean isArrivalTimeAfterDepartureTime() {
        if (departureTime == null || arrivalTime == null) {
            return true; // Skip validation if either is null (partial update)
        }
        return arrivalTime.isAfter(departureTime);
    }
    
    @AssertTrue(message = "Flight duration must be reasonable (between 30 minutes and 20 hours)")
    public boolean isReasonableFlightDuration() {
        if (departureTime == null || arrivalTime == null) {
            return true; // Skip validation if either is null (partial update)
        }
        long durationMinutes = java.time.Duration.between(departureTime, arrivalTime).toMinutes();
        return durationMinutes >= 30 && durationMinutes <= 1200; // 30 minutes to 20 hours
    }
}
