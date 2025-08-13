package com.pdh.booking.model.enums;

public enum BookingStatus {
    VALIDATION_PENDING,  // NEW: Waiting for inventory validation
    PENDING,             // Validation passed, saga started
    CONFIRMED,           // Booking confirmed, ready for payment
    PAYMENT_PENDING,     // Payment is being processed
    PAID,                // Payment completed successfully
    PAYMENT_FAILED,      // Payment processing failed
    CANCELLED,
    FAILED,
    VALIDATION_FAILED    // NEW: Inventory validation failed
}
