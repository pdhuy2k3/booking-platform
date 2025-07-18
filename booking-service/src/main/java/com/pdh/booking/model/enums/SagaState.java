package com.pdh.booking.model.enums;

/**
 * Saga State Enum for Booking Process
 * Represents the different states in the booking saga workflow
 */
public enum SagaState {
    // Initial state
    BOOKING_INITIATED,
    
    // Flight reservation states
    FLIGHT_RESERVATION_PENDING,
    FLIGHT_RESERVED,
    
    // Hotel reservation states  
    HOTEL_RESERVATION_PENDING,
    HOTEL_RESERVED,
    
    // Payment states
    PAYMENT_PENDING,
    PAYMENT_PROCESSED,
    PAYMENT_COMPLETED,
    
    // Completion states
    COMPLETED,
    BOOKING_COMPLETED,
    
    // Compensation states (for rollback)
    COMPENSATION_INITIATED,
    COMPENSATION_FLIGHT_CANCEL,
    COMPENSATION_HOTEL_CANCEL,
    COMPENSATION_PAYMENT_REFUND,
    COMPENSATED,
    
    // Cancellation states
    BOOKING_CANCELLED,
    COMPENSATION_BOOKING_CANCEL,
    
    // Failure states
    FAILED
}
