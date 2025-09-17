package com.pdh.booking.command;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * Command to cancel a booking
 * This command triggers the compensation saga
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancelBookingCommand {
    
    @NotNull(message = "Booking ID is required")
    private UUID bookingId;
    
    @NotNull(message = "Saga ID is required")
    private String sagaId;
    
    @NotNull(message = "User ID is required")
    private UUID userId;
    
    @NotNull(message = "Cancellation reason is required")
    private String cancellationReason;
    
    private String correlationId;
}
