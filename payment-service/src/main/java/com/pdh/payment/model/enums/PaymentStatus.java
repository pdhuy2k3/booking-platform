package com.pdh.payment.model.enums;

/**
 * Payment Status Enum
 * Defines all possible payment states in the system
 */
public enum PaymentStatus {
    // Initial states
    PENDING("Payment initiated but not processed"),
    PROCESSING("Payment is being processed"),
    
    // Success states
    COMPLETED("Payment successfully completed"),
    CONFIRMED("Payment confirmed by payment gateway"),
    
    // Failure states
    FAILED("Payment failed"),
    DECLINED("Payment declined by payment gateway"),
    CANCELLED("Payment cancelled by user or system"),
    
    // Refund states
    REFUND_PENDING("Refund initiated"),
    REFUND_PROCESSING("Refund is being processed"),
    REFUND_COMPLETED("Refund completed successfully"),
    REFUND_FAILED("Refund failed"),
    
    // Error states
    TIMEOUT("Payment timed out"),
    ERROR("Payment error occurred"),
    
    // Saga compensation states
    COMPENSATION_PENDING("Compensation transaction pending"),
    COMPENSATION_COMPLETED("Compensation transaction completed"),
    COMPENSATION_FAILED("Compensation transaction failed");
    
    private final String description;
    
    PaymentStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * Check if payment is in a final state (cannot be changed)
     */
    public boolean isFinalState() {
        return this == COMPLETED || this == CONFIRMED || this == FAILED || 
               this == DECLINED || this == CANCELLED || this == REFUND_COMPLETED ||
               this == REFUND_FAILED || this == COMPENSATION_COMPLETED || 
               this == COMPENSATION_FAILED;
    }
    
    /**
     * Check if payment is successful
     */
    public boolean isSuccessful() {
        return this == COMPLETED || this == CONFIRMED;
    }
    
    /**
     * Check if payment is in progress
     */
    public boolean isInProgress() {
        return this == PENDING || this == PROCESSING || this == REFUND_PENDING ||
               this == REFUND_PROCESSING || this == COMPENSATION_PENDING;
    }
}
