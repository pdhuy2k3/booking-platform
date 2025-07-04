package com.pdh.booking.model.enums;

public enum SagaStatus {
    STARTED,
    PROCESSING_FLIGHT,
    PROCESSING_HOTEL,
    AWAITING_PAYMENT,
    COMPENSATING_FLIGHT,
    COMPLETED,
    FAILED
}
