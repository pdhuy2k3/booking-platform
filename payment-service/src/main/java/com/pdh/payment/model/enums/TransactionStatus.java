package com.pdh.payment.model.enums;

public enum TransactionStatus {
    INITIATED,
    PENDING_GATEWAY,
    SUCCESS,
    FAILED,
    REFUNDED,
    REFUND_FAILED
}
