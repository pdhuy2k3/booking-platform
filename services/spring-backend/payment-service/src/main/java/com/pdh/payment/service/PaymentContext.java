package com.pdh.payment.service;

import com.pdh.payment.model.Payment;
import com.pdh.payment.model.PaymentMethod;
import com.pdh.payment.model.PaymentTransaction;
import com.pdh.payment.service.strategy.PaymentStrategy;
import com.pdh.payment.service.strategy.PaymentStrategyFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Payment Context for Strategy Pattern
 * Orchestrates payment operations using appropriate strategies
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentContext {
    
    private final PaymentStrategyFactory strategyFactory;
    
    /**
     * Process payment using appropriate strategy
     */
    public PaymentTransaction processPayment(Payment payment, PaymentMethod paymentMethod, 
                                           Map<String, Object> additionalData) {
        log.info("Processing payment {} using strategy for provider: {}", 
                payment.getPaymentId(), paymentMethod.getProvider());
        
        try {
            PaymentStrategy strategy = strategyFactory.getStrategy(paymentMethod);
            
            // Validate payment method with strategy
            PaymentStrategy.ValidationResult validation = strategy.validatePaymentMethod(paymentMethod);
            if (!validation.isValid()) {
                throw new IllegalArgumentException("Payment method validation failed: " + validation.getErrorMessage());
            }
            
            // Process payment
            PaymentTransaction transaction = strategy.processPayment(payment, paymentMethod, additionalData);
            
            log.info("Payment processed successfully using strategy: {} for payment: {}", 
                    strategy.getStrategyName(), payment.getPaymentId());
            
            return transaction;
            
        } catch (PaymentStrategyFactory.UnsupportedPaymentMethodException e) {
            log.error("Unsupported payment method for payment: {}", payment.getPaymentId(), e);
            throw new IllegalArgumentException("Payment method not supported: " + e.getMessage());
        } catch (Exception e) {
            log.error("Payment processing failed for payment: {}", payment.getPaymentId(), e);
            throw new RuntimeException("Payment processing failed: " + e.getMessage(), e);
        }
    }
    
    /**
     * Process refund using appropriate strategy
     */
    public PaymentTransaction processRefund(PaymentTransaction originalTransaction, 
                                          BigDecimal refundAmount, String reason) {
        log.info("Processing refund for transaction {} with amount: {}", 
                originalTransaction.getTransactionId(), refundAmount);
        
        try {
            PaymentStrategy strategy = strategyFactory.getStrategyByProvider(originalTransaction.getProvider());
            
            if (!strategy.supportsRefunds()) {
                throw new UnsupportedOperationException("Refunds not supported by " + strategy.getStrategyName());
            }
            
            // Validate refund amount
            if (refundAmount.compareTo(originalTransaction.getAmount()) > 0) {
                throw new IllegalArgumentException("Refund amount cannot exceed original payment amount");
            }
            
            if (!strategy.supportsPartialRefunds() && 
                refundAmount.compareTo(originalTransaction.getAmount()) < 0) {
                throw new IllegalArgumentException("Partial refunds not supported by " + strategy.getStrategyName());
            }
            
            // Process refund
            PaymentTransaction refundTransaction = strategy.processRefund(originalTransaction, refundAmount, reason);
            
            log.info("Refund processed successfully using strategy: {} for transaction: {}", 
                    strategy.getStrategyName(), originalTransaction.getTransactionId());
            
            return refundTransaction;
            
        } catch (PaymentStrategyFactory.UnsupportedPaymentMethodException e) {
            log.error("Unsupported payment provider for refund: {}", originalTransaction.getProvider(), e);
            throw new IllegalArgumentException("Payment provider not supported for refunds: " + e.getMessage());
        } catch (Exception e) {
            log.error("Refund processing failed for transaction: {}", originalTransaction.getTransactionId(), e);
            throw new RuntimeException("Refund processing failed: " + e.getMessage(), e);
        }
    }
    
    /**
     * Verify payment status using appropriate strategy
     */
    public PaymentTransaction verifyPaymentStatus(PaymentTransaction transaction) {
        log.debug("Verifying payment status for transaction: {}", transaction.getTransactionId());
        
        try {
            PaymentStrategy strategy = strategyFactory.getStrategyByProvider(transaction.getProvider());
            
            if (!strategy.supportsStatusCheck()) {
                log.warn("Status check not supported by strategy: {}", strategy.getStrategyName());
                return transaction;
            }
            
            return strategy.verifyPaymentStatus(transaction);
            
        } catch (PaymentStrategyFactory.UnsupportedPaymentMethodException e) {
            log.error("Unsupported payment provider for status check: {}", transaction.getProvider(), e);
            return transaction;
        } catch (Exception e) {
            log.error("Payment status verification failed for transaction: {}", transaction.getTransactionId(), e);
            return transaction;
        }
    }
    
    /**
     * Cancel payment using appropriate strategy
     */
    public PaymentTransaction cancelPayment(PaymentTransaction transaction, String reason) {
        log.info("Cancelling payment for transaction: {} with reason: {}", 
                transaction.getTransactionId(), reason);
        
        try {
            PaymentStrategy strategy = strategyFactory.getStrategyByProvider(transaction.getProvider());
            
            PaymentTransaction cancelledTransaction = strategy.cancelPayment(transaction, reason);
            
            log.info("Payment cancelled successfully using strategy: {} for transaction: {}", 
                    strategy.getStrategyName(), transaction.getTransactionId());
            
            return cancelledTransaction;
            
        } catch (PaymentStrategyFactory.UnsupportedPaymentMethodException e) {
            log.error("Unsupported payment provider for cancellation: {}", transaction.getProvider(), e);
            throw new IllegalArgumentException("Payment provider not supported for cancellation: " + e.getMessage());
        } catch (Exception e) {
            log.error("Payment cancellation failed for transaction: {}", transaction.getTransactionId(), e);
            throw new RuntimeException("Payment cancellation failed: " + e.getMessage(), e);
        }
    }
    
    /**
     * Get processing fee for payment method
     */
    public BigDecimal getProcessingFee(BigDecimal amount, PaymentMethod paymentMethod) {
        try {
            PaymentStrategy strategy = strategyFactory.getStrategy(paymentMethod);
            return strategy.getProcessingFee(amount, paymentMethod);
        } catch (Exception e) {
            log.warn("Failed to get processing fee for payment method: {}", paymentMethod.getProvider(), e);
            return BigDecimal.ZERO;
        }
    }
    
    /**
     * Check if payment method supports refunds
     */
    public boolean supportsRefunds(PaymentMethod paymentMethod) {
        try {
            PaymentStrategy strategy = strategyFactory.getStrategy(paymentMethod);
            return strategy.supportsRefunds();
        } catch (Exception e) {
            log.warn("Failed to check refund support for payment method: {}", paymentMethod.getProvider(), e);
            return false;
        }
    }
    
    /**
     * Check if payment method supports partial refunds
     */
    public boolean supportsPartialRefunds(PaymentMethod paymentMethod) {
        try {
            PaymentStrategy strategy = strategyFactory.getStrategy(paymentMethod);
            return strategy.supportsPartialRefunds();
        } catch (Exception e) {
            log.warn("Failed to check partial refund support for payment method: {}", paymentMethod.getProvider(), e);
            return false;
        }
    }
}
