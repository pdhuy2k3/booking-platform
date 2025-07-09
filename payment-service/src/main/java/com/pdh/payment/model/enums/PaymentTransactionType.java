package com.pdh.payment.model.enums;

/**
 * Payment Transaction Type Enum
 */
public enum PaymentTransactionType {
    // Primary transactions
    PAYMENT("Payment transaction"),
    
    // Compensation transactions
    REFUND("Refund transaction"),
    PARTIAL_REFUND("Partial refund transaction"),
    
    // Saga compensation
    COMPENSATION("Compensation transaction for failed saga"),
    
    // Administrative
    CHARGEBACK("Chargeback transaction"),
    ADJUSTMENT("Payment adjustment"),
    
    // Verification
    AUTHORIZATION("Payment authorization"),
    CAPTURE("Payment capture"),
    VOID("Void transaction"),
    
    // Fees
    PROCESSING_FEE("Processing fee"),
    SERVICE_FEE("Service fee");
    
    private final String description;
    
    PaymentTransactionType(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    /**
     * Check if transaction type is a compensation
     */
    public boolean isCompensation() {
        return this == REFUND || this == PARTIAL_REFUND || this == COMPENSATION;
    }
    
    /**
     * Check if transaction type is a debit (money going out)
     */
    public boolean isDebit() {
        return isCompensation() || this == CHARGEBACK;
    }
    
    /**
     * Check if transaction type is a credit (money coming in)
     */
    public boolean isCredit() {
        return this == PAYMENT || this == PROCESSING_FEE || this == SERVICE_FEE;
    }
}
