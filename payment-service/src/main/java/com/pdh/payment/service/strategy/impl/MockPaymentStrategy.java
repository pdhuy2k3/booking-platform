package com.pdh.payment.service.strategy.impl;

import com.pdh.payment.model.Payment;
import com.pdh.payment.model.PaymentMethod;
import com.pdh.payment.model.PaymentTransaction;
import com.pdh.payment.model.enums.PaymentProvider;
import com.pdh.payment.model.enums.PaymentStatus;
import com.pdh.payment.model.enums.PaymentTransactionType;
import com.pdh.payment.service.strategy.PaymentStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Mock Payment Strategy Implementation
 * Used for testing and development
 */
@Component
@Slf4j
public class MockPaymentStrategy implements PaymentStrategy {
    
    private static final String STRATEGY_NAME = "Mock Payment Strategy";
    private static final BigDecimal PROCESSING_FEE_RATE = new BigDecimal("0.029"); // 2.9%
    private static final BigDecimal FIXED_FEE = new BigDecimal("0.30"); // $0.30
    
    @Override
    public PaymentTransaction processPayment(Payment payment, PaymentMethod paymentMethod, Map<String, Object> additionalData) {
        log.info("Processing mock payment for payment ID: {} with method: {}", 
                payment.getPaymentId(), paymentMethod.getMethodType());
        
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setPayment(payment);
        transaction.setTransactionReference(
            PaymentTransaction.generateTransactionReference(PaymentTransactionType.PAYMENT));
        transaction.setTransactionType(PaymentTransactionType.PAYMENT);
        transaction.setStatus(PaymentStatus.PROCESSING);
        transaction.setAmount(payment.getAmount());
        transaction.setCurrency(payment.getCurrency());
        transaction.setDescription("Mock payment transaction for " + payment.getDescription());
        transaction.setProvider(PaymentProvider.MOCK_PROVIDER);
        transaction.setSagaId(payment.getSagaId());
        transaction.setSagaStep("PAYMENT_PROCESSING");
        
        // Simulate payment gateway response
        String mockTransactionId = "MOCK_TXN_" + System.currentTimeMillis();
        transaction.setGatewayTransactionId(mockTransactionId);
        transaction.setGatewayReference("MOCK_REF_" + UUID.randomUUID().toString().substring(0, 8));
        
        // Simulate processing delay
        try {
            Thread.sleep(100); // 100ms delay
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Mock success/failure based on amount (for testing)
        boolean shouldSucceed = shouldPaymentSucceed(payment.getAmount(), additionalData);
        
        if (shouldSucceed) {
            transaction.setStatus(PaymentStatus.COMPLETED);
            transaction.setGatewayStatus("SUCCESS");
            transaction.setGatewayResponse("{\"status\":\"success\",\"transaction_id\":\"" + mockTransactionId + "\",\"message\":\"Payment completed successfully\"}");
            transaction.markAsCompleted();
            
            log.info("Mock payment succeeded for payment ID: {}", payment.getPaymentId());
        } else {
            transaction.setStatus(PaymentStatus.FAILED);
            transaction.setGatewayStatus("FAILED");
            transaction.setGatewayResponse("{\"status\":\"failed\",\"error_code\":\"MOCK_FAILURE\",\"message\":\"Mock payment failure for testing\"}");
            transaction.markAsFailed("Mock payment failure for testing", "MOCK_FAILURE");
            
            log.warn("Mock payment failed for payment ID: {}", payment.getPaymentId());
        }
        
        // Calculate and set gateway fee
        BigDecimal gatewayFee = calculateProcessingFee(payment.getAmount());
        transaction.setGatewayFee(gatewayFee);
        
        return transaction;
    }
    
    @Override
    public PaymentTransaction processRefund(PaymentTransaction originalTransaction, BigDecimal refundAmount, String reason) {
        log.info("Processing mock refund for original transaction: {} with amount: {}", 
                originalTransaction.getTransactionId(), refundAmount);
        
        PaymentTransaction refundTransaction = new PaymentTransaction();
        refundTransaction.setPayment(originalTransaction.getPayment());
        refundTransaction.setTransactionReference(
            PaymentTransaction.generateTransactionReference(PaymentTransactionType.REFUND));
        refundTransaction.setTransactionType(PaymentTransactionType.REFUND);
        refundTransaction.setStatus(PaymentStatus.PROCESSING);
        refundTransaction.setAmount(refundAmount);
        refundTransaction.setCurrency(originalTransaction.getCurrency());
        refundTransaction.setDescription("Mock refund: " + reason);
        refundTransaction.setProvider(PaymentProvider.MOCK_PROVIDER);
        refundTransaction.setSagaId(originalTransaction.getSagaId());
        refundTransaction.setSagaStep("REFUND_PROCESSING");
        refundTransaction.setOriginalTransactionId(originalTransaction.getTransactionId());
        refundTransaction.setIsCompensation(true);
        
        // Mock refund processing
        String mockRefundId = "MOCK_REF_" + System.currentTimeMillis();
        refundTransaction.setGatewayTransactionId(mockRefundId);
        refundTransaction.setGatewayReference("MOCK_REFUND_" + UUID.randomUUID().toString().substring(0, 8));
        
        // Simulate processing delay
        try {
            Thread.sleep(50); // 50ms delay
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Mock refund success (refunds usually succeed in mock)
        refundTransaction.setStatus(PaymentStatus.COMPLETED);
        refundTransaction.setGatewayStatus("SUCCESS");
        refundTransaction.setGatewayResponse("{\"status\":\"success\",\"refund_id\":\"" + mockRefundId + "\",\"message\":\"Refund completed successfully\"}");
        refundTransaction.markAsCompleted();
        
        log.info("Mock refund succeeded for original transaction: {}", originalTransaction.getTransactionId());
        
        return refundTransaction;
    }
    
    @Override
    public PaymentTransaction verifyPaymentStatus(PaymentTransaction transaction) {
        log.debug("Verifying mock payment status for transaction: {}", transaction.getTransactionId());
        
        // Mock verification - in real implementation, this would call payment gateway API
        if (transaction.getGatewayTransactionId() != null && 
            transaction.getGatewayTransactionId().startsWith("MOCK_")) {
            
            // Mock status based on current status
            if (transaction.getStatus() == PaymentStatus.PROCESSING) {
                // Simulate random completion
                boolean isComplete = System.currentTimeMillis() % 2 == 0;
                if (isComplete) {
                    transaction.setStatus(PaymentStatus.COMPLETED);
                    transaction.setGatewayStatus("SUCCESS");
                    transaction.markAsCompleted();
                }
            }
        }
        
        return transaction;
    }
    
    @Override
    public PaymentTransaction cancelPayment(PaymentTransaction transaction, String reason) {
        log.info("Cancelling mock payment for transaction: {} with reason: {}", 
                transaction.getTransactionId(), reason);
        
        transaction.setStatus(PaymentStatus.CANCELLED);
        transaction.setGatewayStatus("CANCELLED");
        transaction.setFailureReason(reason);
        transaction.setFailureCode("USER_CANCELLED");
        transaction.setProcessedAt(ZonedDateTime.now());
        
        return transaction;
    }
    
    @Override
    public boolean supports(PaymentMethod paymentMethod) {
        // Mock strategy supports all payment methods for testing
        return paymentMethod.getProvider() == PaymentProvider.MOCK_PROVIDER ||
               paymentMethod.getProvider() == PaymentProvider.TEST_PROVIDER;
    }
    
    @Override
    public String getStrategyName() {
        return STRATEGY_NAME;
    }
    
    @Override
    public ValidationResult validatePaymentMethod(PaymentMethod paymentMethod) {
        if (!supports(paymentMethod)) {
            return ValidationResult.failure("Payment method not supported by mock strategy", "UNSUPPORTED_METHOD");
        }
        
        if (!paymentMethod.getIsActive()) {
            return ValidationResult.failure("Payment method is not active", "INACTIVE_METHOD");
        }
        
        return ValidationResult.success();
    }
    
    @Override
    public BigDecimal getProcessingFee(BigDecimal amount, PaymentMethod paymentMethod) {
        return calculateProcessingFee(amount);
    }
    
    private BigDecimal calculateProcessingFee(BigDecimal amount) {
        // Calculate percentage fee + fixed fee
        BigDecimal percentageFee = amount.multiply(PROCESSING_FEE_RATE);
        return percentageFee.add(FIXED_FEE);
    }
    
    @Override
    public boolean supportsRefunds() {
        return true;
    }
    
    @Override
    public boolean supportsPartialRefunds() {
        return true;
    }
    
    @Override
    public int getMaxRefundWindowDays() {
        return 30; // 30 days refund window
    }
    
    /**
     * Determine if payment should succeed based on amount and test parameters
     */
    private boolean shouldPaymentSucceed(BigDecimal amount, Map<String, Object> additionalData) {
        // For testing purposes:
        // - Amounts ending in .99 fail (e.g., 99.99, 199.99)
        // - Amounts over 10000 fail
        // - If test parameter "shouldFail" is true, fail
        
        if (additionalData != null && Boolean.TRUE.equals(additionalData.get("shouldFail"))) {
            return false;
        }
        
        if (amount.compareTo(new BigDecimal("10000")) > 0) {
            return false;
        }
        
        // Check if amount ends in .99
        String amountStr = amount.toString();
        if (amountStr.endsWith(".99")) {
            return false;
        }
        
        return true;
    }
}
