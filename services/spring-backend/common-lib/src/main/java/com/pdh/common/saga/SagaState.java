package com.pdh.common.saga;

/**
 * Saga States for Booking Flow
 * Defines all possible states in the booking saga orchestration
 */
public enum SagaState {
    // Main Booking Flow States
    BOOKING_INITIATED,
    
    // Flight Reservation States
    FLIGHT_RESERVATION_PENDING,
    FLIGHT_RESERVED,
    
    // Hotel Reservation States
    HOTEL_RESERVATION_PENDING,
    HOTEL_RESERVED,
    
    // Payment States
    PAYMENT_PENDING,
    PAYMENT_COMPLETED,
    
    // Final States
    BOOKING_COMPLETED,
    BOOKING_CANCELLED,
    
    // Compensation States (Reverse Order)
    COMPENSATION_PAYMENT_REFUND,
    COMPENSATION_HOTEL_CANCEL,
    COMPENSATION_FLIGHT_CANCEL,
    COMPENSATION_BOOKING_CANCEL,
    
    // Legacy states for compatibility
    @Deprecated
    INVENTORY_RESERVED,
    @Deprecated
    INVENTORY_RESERVATION_FAILED,
    @Deprecated
    PAYMENT_PROCESSING,
    @Deprecated
    PAYMENT_FAILED,
    @Deprecated
    BOOKING_CONFIRMED,
    @Deprecated
    BOOKING_CONFIRMATION_FAILED,
    @Deprecated
    NOTIFICATION_SENT,
    @Deprecated
    COMPLETED,
    @Deprecated
    COMPENSATING,
    @Deprecated
    PAYMENT_REFUNDED,
    @Deprecated
    INVENTORY_RELEASED,
    @Deprecated
    COMPENSATION_COMPLETED,
    @Deprecated
    FAILED
}
