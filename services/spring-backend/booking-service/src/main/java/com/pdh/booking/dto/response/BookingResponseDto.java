package com.pdh.booking.dto.response;

import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.model.enums.SagaState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

/**
 * DTO for booking response (Backoffice/Admin)
 * Used for internal admin operations and backoffice management
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponseDto {
    
    /**
     * Unique booking identifier
     */
    private UUID bookingId;
    
    /**
     * Human-readable booking reference
     */
    private String bookingReference;
    
    /**
     * Saga instance identifier for tracking
     */
    private String sagaId;
    
    /**
     * Current booking status
     */
    private String status;
    
    /**
     * Current saga state
     */
    private SagaState sagaState;
    
    /**
     * Confirmation number (available after completion)
     */
    private String confirmationNumber;
}
