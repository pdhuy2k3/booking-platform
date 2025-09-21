package com.pdh.booking.query;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Query to get booking by ID
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GetBookingByIdQuery {
    
    @NotNull(message = "Booking ID is required")
    private UUID bookingId;
    
    private UUID userId; // Optional: for authorization
}
