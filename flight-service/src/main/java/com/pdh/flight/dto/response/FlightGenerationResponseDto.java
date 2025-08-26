package com.pdh.flight.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for flight data generation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightGenerationResponseDto {
    private String message;
    private int generatedFlights;
    private String dateRange;
    
    /**
     * Create generation response
     */
    public static FlightGenerationResponseDto of(String message, int generatedFlights, String dateRange) {
        return FlightGenerationResponseDto.builder()
                .message(message)
                .generatedFlights(generatedFlights)
                .dateRange(dateRange)
                .build();
    }
}
