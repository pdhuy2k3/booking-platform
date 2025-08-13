package com.pdh.booking.model.viewmodel;

import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.model.enums.BookingType;
import com.pdh.common.saga.SagaState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.format.DateTimeFormatter;

/**
 * ViewModel for Storefront booking display
 * Contains computed fields and formatted data for UI consumption
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorefrontBookingViewModel {
    
    /**
     * Unique booking identifier
     */
    private String bookingId;
    
    /**
     * Human-readable booking reference
     */
    private String bookingReference;
    
    /**
     * Saga instance identifier
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
     * Confirmation number
     */
    private String confirmationNumber;
    
    /**
     * Total amount
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
     * Creation timestamp
     */
    private String createdAt;
    
    /**
     * Last update timestamp
     */
    private String updatedAt;
    
    // Computed fields for UI
    
    /**
     * Formatted total amount with currency symbol
     */
    private String formattedAmount;
    
    /**
     * User-friendly status description
     */
    private String statusDescription;
    
    /**
     * Progress percentage based on saga state
     */
    private Integer progressPercentage;
    
    /**
     * Whether the booking can be cancelled
     */
    private Boolean canCancel;
    
    /**
     * Whether the booking is in a final state
     */
    private Boolean isFinal;
    
    /**
     * Next expected action for the user
     */
    private String nextAction;
    
    /**
     * Estimated completion time
     */
    private String estimatedCompletion;
    
    /**
     * Helper method to calculate progress percentage based on saga state
     */
    public Integer calculateProgressPercentage() {
        if (sagaState == null) return 0;
        
        return switch (sagaState) {
            case BOOKING_INITIATED -> 10;
            case FLIGHT_RESERVATION_PENDING -> 25;
            case FLIGHT_RESERVED -> 40;
            case HOTEL_RESERVATION_PENDING -> 55;
            case HOTEL_RESERVED -> 70;
            case PAYMENT_PENDING -> 85;
            case PAYMENT_COMPLETED -> 95;
            case BOOKING_COMPLETED -> 100;
            case BOOKING_CANCELLED -> 0;
            default -> 50;
        };
    }
    
    /**
     * Helper method to determine if booking can be cancelled
     */
    public Boolean calculateCanCancel() {
        if (status == null || sagaState == null) return false;
        
        return status == BookingStatus.PENDING && 
               sagaState != SagaState.PAYMENT_COMPLETED &&
               sagaState != SagaState.BOOKING_COMPLETED;
    }
    
    /**
     * Helper method to determine if booking is in final state
     */
    public Boolean calculateIsFinal() {
        if (status == null) return false;
        
        return status == BookingStatus.CONFIRMED ||
               status == BookingStatus.CANCELLED ||
               status == BookingStatus.FAILED;
    }
}
