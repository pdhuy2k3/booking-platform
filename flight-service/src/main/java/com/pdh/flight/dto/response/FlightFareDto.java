package com.pdh.flight.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

/**
 * DTO for flight fare information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightFareDto {
    private UUID fareId;
    private UUID scheduleId;
    private String fareClass; // ECONOMY, BUSINESS, FIRST
    private BigDecimal price;
    private Integer availableSeats;
}
