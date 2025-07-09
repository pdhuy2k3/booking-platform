package com.pdh.payment.service.strategy;

import com.pdh.payment.model.Payment;
import com.pdh.payment.model.PaymentMethod;
import com.pdh.payment.model.PaymentTransaction;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Payment Strategy Interface
 * Implements Strategy Pattern for different payment methods
 */
public interface PaymentStrategy {
    
    /**
     * Process payment
     * @param payment Payment to process
     * @param paymentMethod Payment method to use
     * @param additionalData Additional data required by payment provider
     * @return Payment transaction result
     */
    PaymentTransaction processPayment(Payment payment, PaymentMethod paymentMethod, Map<String, Object> additionalData);
    
    /**
     * Process refund
     * @param originalTransaction Original payment transaction
     * @param refundAmount Amount to refund
     * @param reason Refund reason
     * @return Refund transaction result
     */
    PaymentTransaction processRefund(PaymentTransaction originalTransaction, BigDecimal refundAmount, String reason);
    
    /**
     * Verify payment status
     * @param transaction Transaction to verify
     * @return Updated transaction with current status
     */
    PaymentTransaction verifyPaymentStatus(PaymentTransaction transaction);
    
    /**
     * Cancel payment
     * @param transaction Transaction to cancel
     * @param reason Cancellation reason
     * @return Cancelled transaction
     */
    PaymentTransaction cancelPayment(PaymentTransaction transaction, String reason);
    
    /**
     * Check if strategy supports given payment method
     * @param paymentMethod Payment method to check
     * @return true if supported
     */
    boolean supports(PaymentMethod paymentMethod);
    
    /**
     * Get strategy name
     * @return Strategy identifier
     */
    String getStrategyName();
    
    /**
     * Validate payment method for this strategy
     * @param paymentMethod Payment method to validate
     * @return validation result
     */
    ValidationResult validatePaymentMethod(PaymentMethod paymentMethod);
    
    /**
     * Get processing fee for this strategy
     * @param amount Payment amount
     * @param paymentMethod Payment method
     * @return Processing fee
     */
    BigDecimal getProcessingFee(BigDecimal amount, PaymentMethod paymentMethod);
    
    /**
     * Check if strategy supports refunds
     * @return true if refunds are supported
     */
    boolean supportsRefunds();
    
    /**
     * Check if strategy supports partial refunds
     * @return true if partial refunds are supported
     */
    boolean supportsPartialRefunds();
    
    /**
     * Get maximum refund window in days
     * @return maximum days for refund, -1 if no limit
     */
    int getMaxRefundWindowDays();
    
    /**
     * Validation result class
     */
    class ValidationResult {
        private final boolean valid;
        private final String errorMessage;
        private final String errorCode;
        
        public ValidationResult(boolean valid) {
            this.valid = valid;
            this.errorMessage = null;
            this.errorCode = null;
        }
        
        public ValidationResult(boolean valid, String errorMessage, String errorCode) {
            this.valid = valid;
            this.errorMessage = errorMessage;
            this.errorCode = errorCode;
        }
        
        public static ValidationResult success() {
            return new ValidationResult(true);
        }
        
        public static ValidationResult failure(String errorMessage, String errorCode) {
            return new ValidationResult(false, errorMessage, errorCode);
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public String getErrorMessage() {
            return errorMessage;
        }
        
        public String getErrorCode() {
            return errorCode;
        }
    }
}
