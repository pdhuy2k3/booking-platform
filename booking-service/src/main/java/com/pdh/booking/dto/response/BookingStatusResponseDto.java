package com.pdh.booking.dto.response;

import com.pdh.booking.model.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for booking status polling response
 * Used by frontend to check async validation and processing progress
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusResponseDto {
    
    /**
     * Unique booking identifier as string (frontend-compatible)
     */
    private String bookingId;
    
    /**
     * Human-readable booking reference
     */
    private String bookingReference;
    
    /**
     * Current booking status
     */
    private BookingStatus status;
    
    /**
     * Status message for user display
     */
    private String message;
    
    /**
     * Estimated completion time (for pending operations)
     */
    private String estimatedCompletion;
    
    /**
     * Last update timestamp as string (frontend-compatible)
     */
    private String lastUpdated;
    
    /**
     * Progress percentage (0-100) for UI progress bars
     */
    private Integer progressPercentage;
    
    /**
     * Checks if the booking is in a final state (no more updates expected)
     */
    public boolean isFinalState() {
        return status == BookingStatus.CONFIRMED || 
               status == BookingStatus.CANCELLED || 
               status == BookingStatus.FAILED ||
               status == BookingStatus.VALIDATION_FAILED;
    }
    
    /**
     * Checks if the booking is still processing
     */
    public boolean isProcessing() {
        return status == BookingStatus.VALIDATION_PENDING || 
               status == BookingStatus.PENDING;
    }
}
