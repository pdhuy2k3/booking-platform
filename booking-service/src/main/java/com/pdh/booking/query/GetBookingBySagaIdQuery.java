package com.pdh.booking.query;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Query to get booking by saga ID
 * Used for saga orchestration tracking
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GetBookingBySagaIdQuery {
    
    @NotNull(message = "Saga ID is required")
    private String sagaId;
    
    private String userId; // Optional: for authorization
}
