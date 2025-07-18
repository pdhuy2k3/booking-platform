package com.pdh.booking.dto.response;

import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.model.enums.BookingType;
import com.pdh.booking.model.enums.SagaState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for booking response from Storefront
 * Uses frontend-compatible data types (String for IDs, double for amounts)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorefrontBookingResponseDto {
    
    /**
     * Unique booking identifier as string (frontend-compatible)
     */
    private String bookingId;
    
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
    private BookingStatus status;
    
    /**
     * Current saga state
     */
    private SagaState sagaState;
    
    /**
     * Confirmation number (available after completion)
     */
    private String confirmationNumber;
    
    /**
     * Total amount as double (frontend-compatible)
     */
    private Double totalAmount;
    
    /**
     * Currency code
     */
    private String currency;
    
    /**
     * Type of booking
     */
    private BookingType bookingType;
    
    /**
     * Creation timestamp as string (frontend-compatible)
     */
    private String createdAt;
    
    /**
     * Last update timestamp as string (frontend-compatible)
     */
    private String updatedAt;
}
