package com.pdh.payment.service.dto;

import com.pdh.payment.model.Payment;
import com.pdh.payment.model.PaymentTransaction;
import lombok.Data;

/**
 * Payment Processing Result DTO
 * Represents the result of payment processing operations
 */
@Data
public class PaymentProcessingResult {
    
    private boolean success;
    private String errorMessage;
    private String errorCode;
    private Payment payment;
    private PaymentTransaction transaction;
    
    private PaymentProcessingResult(boolean success) {
        this.success = success;
    }
    
    /**
     * Create successful result
     */
    public static PaymentProcessingResult success(Payment payment, PaymentTransaction transaction) {
        PaymentProcessingResult result = new PaymentProcessingResult(true);
        result.setPayment(payment);
        result.setTransaction(transaction);
        return result;
    }
    
    /**
     * Create failure result
     */
    public static PaymentProcessingResult failure(String errorMessage, String errorCode) {
        PaymentProcessingResult result = new PaymentProcessingResult(false);
        result.setErrorMessage(errorMessage);
        result.setErrorCode(errorCode);
        return result;
    }
    
    /**
     * Check if processing was successful
     */
    public boolean isSuccess() {
        return success;
    }
    
    /**
     * Check if processing failed
     */
    public boolean isFailure() {
        return !success;
    }
    
    /**
     * Get payment ID if available
     */
    public String getPaymentId() {
        return payment != null ? payment.getPaymentId().toString() : null;
    }
    
    /**
     * Get transaction ID if available
     */
    public String getTransactionId() {
        return transaction != null ? transaction.getTransactionId().toString() : null;
    }
    
    /**
     * Get payment status if available
     */
    public String getPaymentStatus() {
        return payment != null ? payment.getStatus().toString() : null;
    }
    
    /**
     * Get transaction status if available
     */
    public String getTransactionStatus() {
        return transaction != null ? transaction.getStatus().toString() : null;
    }
}
