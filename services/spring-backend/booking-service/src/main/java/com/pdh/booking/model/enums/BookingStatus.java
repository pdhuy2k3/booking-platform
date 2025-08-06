package com.pdh.booking.model.enums;

public enum BookingStatus {
    VALIDATION_PENDING,  // NEW: Waiting for inventory validation
    PENDING,             // Validation passed, saga started
    CONFIRMED,
    CANCELLED,
    FAILED,
    VALIDATION_FAILED    // NEW: Inventory validation failed
}
