package com.pdh.payment.service;

import com.pdh.payment.model.Payment;
import com.pdh.payment.model.PaymentMethod;
import com.pdh.payment.model.PaymentTransaction;
import com.pdh.payment.model.enums.PaymentStatus;
import com.pdh.payment.model.enums.PaymentTransactionType;
import com.pdh.common.outbox.service.OutboxEventService;
import com.pdh.payment.repository.PaymentRepository;
import com.pdh.payment.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Enhanced Payment Service with Strategy Pattern Integration
 * Orchestrates payment operations using different payment strategies
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final OutboxEventService eventPublisher;
    private final PaymentContext paymentContext;
    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;

    /**
     * Process payment using Strategy Pattern
     */
    @Transactional
    public PaymentTransaction processPayment(Payment payment, PaymentMethod paymentMethod,
                                           Map<String, Object> additionalData) {
        log.info("Processing payment {} using payment method: {}",
                payment.getPaymentId(), paymentMethod.getProvider());

        try {
            // Save payment first
            Payment savedPayment = paymentRepository.save(payment);

            // Process payment using strategy
            PaymentTransaction transaction = paymentContext.processPayment(savedPayment, paymentMethod, additionalData);

            // Save transaction
            PaymentTransaction savedTransaction = paymentTransactionRepository.save(transaction);

            // Publish payment event
            publishPaymentEvent(savedPayment, savedTransaction, "PaymentInitiated");

            // If payment completed immediately, publish completion event
            if (savedTransaction.getStatus().isSuccessful()) {
                publishPaymentEvent(savedPayment, savedTransaction, "PaymentCompleted");
            }

            log.info("Payment processing completed for payment: {}", payment.getPaymentId());
            return savedTransaction;

        } catch (Exception e) {
            log.error("Payment processing failed for payment: {}", payment.getPaymentId(), e);

            // Create failed transaction record
            PaymentTransaction failedTransaction = createFailedTransaction(payment, e.getMessage());
            PaymentTransaction savedFailedTransaction = paymentTransactionRepository.save(failedTransaction);

            // Publish failure event
            publishPaymentEvent(payment, savedFailedTransaction, "PaymentFailed");

            throw e;
        }
    }

    /**
     * Process refund using Strategy Pattern
     */
    @Transactional
    public PaymentTransaction processRefund(UUID originalTransactionId, BigDecimal refundAmount, String reason) {
        log.info("Processing refund for transaction: {} with amount: {}", originalTransactionId, refundAmount);

        Optional<PaymentTransaction> originalTransactionOpt = paymentTransactionRepository.findById(originalTransactionId);
        if (originalTransactionOpt.isEmpty()) {
            throw new IllegalArgumentException("Original transaction not found: " + originalTransactionId);
        }

        PaymentTransaction originalTransaction = originalTransactionOpt.get();

        try {
            // Process refund using strategy
            PaymentTransaction refundTransaction = paymentContext.processRefund(originalTransaction, refundAmount, reason);

            // Save refund transaction
            PaymentTransaction savedRefundTransaction = paymentTransactionRepository.save(refundTransaction);

            // Publish refund event
            publishRefundEvent(originalTransaction.getPayment(), savedRefundTransaction, "RefundInitiated");

            // If refund completed immediately, publish completion event
            if (savedRefundTransaction.getStatus() == PaymentStatus.REFUND_COMPLETED) {
                publishRefundEvent(originalTransaction.getPayment(), savedRefundTransaction, "RefundCompleted");
            }

            log.info("Refund processing completed for transaction: {}", originalTransactionId);
            return savedRefundTransaction;

        } catch (Exception e) {
            log.error("Refund processing failed for transaction: {}", originalTransactionId, e);
            throw e;
        }
    }

    /**
     * Verify payment status using Strategy Pattern
     */
    @Transactional
    public PaymentTransaction verifyPaymentStatus(UUID transactionId) {
        log.debug("Verifying payment status for transaction: {}", transactionId);

        Optional<PaymentTransaction> transactionOpt = paymentTransactionRepository.findById(transactionId);
        if (transactionOpt.isEmpty()) {
            throw new IllegalArgumentException("Transaction not found: " + transactionId);
        }

        PaymentTransaction transaction = transactionOpt.get();
        PaymentTransaction updatedTransaction = paymentContext.verifyPaymentStatus(transaction);

        // Save updated transaction
        PaymentTransaction savedTransaction = paymentTransactionRepository.save(updatedTransaction);

        // Publish status update event if status changed
        if (!transaction.getStatus().equals(savedTransaction.getStatus())) {
            if (savedTransaction.getStatus().isSuccessful()) {
                publishPaymentEvent(savedTransaction.getPayment(), savedTransaction, "PaymentCompleted");
            } else if (savedTransaction.getStatus() == PaymentStatus.FAILED) {
                publishPaymentEvent(savedTransaction.getPayment(), savedTransaction, "PaymentFailed");
            }
        }

        return savedTransaction;
    }

    /**
     * Cancel payment using Strategy Pattern
     */
    @Transactional
    public PaymentTransaction cancelPayment(UUID transactionId, String reason) {
        log.info("Cancelling payment for transaction: {} with reason: {}", transactionId, reason);

        Optional<PaymentTransaction> transactionOpt = paymentTransactionRepository.findById(transactionId);
        if (transactionOpt.isEmpty()) {
            throw new IllegalArgumentException("Transaction not found: " + transactionId);
        }

        PaymentTransaction transaction = transactionOpt.get();
        PaymentTransaction cancelledTransaction = paymentContext.cancelPayment(transaction, reason);

        // Save cancelled transaction
        PaymentTransaction savedTransaction = paymentTransactionRepository.save(cancelledTransaction);

        // Publish cancellation event
        publishPaymentEvent(savedTransaction.getPayment(), savedTransaction, "PaymentCancelled");

        return savedTransaction;
    }

    /**
     * Get processing fee for payment method
     */
    public BigDecimal getProcessingFee(BigDecimal amount, PaymentMethod paymentMethod) {
        return paymentContext.getProcessingFee(amount, paymentMethod);
    }

    /**
     * Legacy method for backward compatibility - process payment by booking ID
     */
    @Transactional
    public void processPayment(UUID bookingId) {
        log.info("Processing payment for booking: {} (legacy method)", bookingId);
        // This is kept for backward compatibility with existing saga orchestration
        eventPublisher.publishEvent("PaymentProcessed", "Booking", bookingId.toString(), Map.of("bookingId", bookingId));
    }

    /**
     * Legacy method for backward compatibility - refund payment by booking ID
     */
    @Transactional
    public void refundPayment(UUID bookingId) {
        log.info("Refunding payment for booking: {} (legacy method)", bookingId);
        // This is kept for backward compatibility with existing saga orchestration
        eventPublisher.publishEvent("PaymentRefunded", "Booking", bookingId.toString(), Map.of("bookingId", bookingId));
    }

    /**
     * Refund payment by payment ID and amount
     */
    @Transactional
    public PaymentTransaction refundPayment(UUID paymentId, BigDecimal refundAmount, String reason) {
        log.info("Processing refund for payment: {} with amount: {}", paymentId, refundAmount);

        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        if (paymentOpt.isEmpty()) {
            throw new IllegalArgumentException("Payment not found: " + paymentId);
        }

        Payment payment = paymentOpt.get();
        
        // Find the latest successful transaction
        Optional<PaymentTransaction> latestTransaction = payment.getTransactions().stream()
                .filter(t -> t.getStatus().isSuccessful())
                .max((t1, t2) -> t1.getCreatedAt().compareTo(t2.getCreatedAt()));

        if (latestTransaction.isEmpty()) {
            throw new IllegalArgumentException("No successful transaction found for payment: " + paymentId);
        }

        return processRefund(latestTransaction.get().getTransactionId(), refundAmount, reason);
    }

    /**
     * Cancel payment by payment ID
     */
    @Transactional
    public void cancelPayment(UUID paymentId) {
        log.info("Cancelling payment: {}", paymentId);

        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        if (paymentOpt.isEmpty()) {
            throw new IllegalArgumentException("Payment not found: " + paymentId);
        }

        Payment payment = paymentOpt.get();
        
        // Update payment status
        payment.setStatus(PaymentStatus.CANCELLED);
        paymentRepository.save(payment);

        // Find pending transactions and cancel them
        payment.getTransactions().stream()
                .filter(t -> t.getStatus() == PaymentStatus.PENDING)
                .forEach(transaction -> {
                    transaction.setStatus(PaymentStatus.CANCELLED);
                    transaction.setFailureReason("Payment cancelled");
                    paymentTransactionRepository.save(transaction);
                });

        log.info("Payment cancelled successfully: {}", paymentId);
    }

    /**
     * Confirm payment by payment ID
     */
    @Transactional
    public void confirmPayment(UUID paymentId) {
        log.info("Confirming payment: {}", paymentId);

        Optional<Payment> paymentOpt = paymentRepository.findById(paymentId);
        if (paymentOpt.isEmpty()) {
            throw new IllegalArgumentException("Payment not found: " + paymentId);
        }

        Payment payment = paymentOpt.get();
        
        // Update payment status
        payment.setStatus(PaymentStatus.COMPLETED);
        paymentRepository.save(payment);

        // Find pending transactions and mark as completed
        payment.getTransactions().stream()
                .filter(t -> t.getStatus() == PaymentStatus.PENDING)
                .forEach(transaction -> {
                    transaction.setStatus(PaymentStatus.COMPLETED);
                    paymentTransactionRepository.save(transaction);
                });

        log.info("Payment confirmed successfully: {}", paymentId);
    }

    // Helper methods

    private void publishPaymentEvent(Payment payment, PaymentTransaction transaction, String eventType) {
        Map<String, Object> eventData = Map.of(
            "paymentId", payment.getPaymentId(),
            "bookingId", payment.getBookingId(),
            "userId", payment.getUserId(),
            "transactionId", transaction.getTransactionId(),
            "amount", transaction.getAmount(),
            "currency", transaction.getCurrency(),
            "status", transaction.getStatus(),
            "provider", transaction.getProvider(),
            "sagaId", payment.getSagaId() != null ? payment.getSagaId() : ""
        );

        eventPublisher.publishEvent(
            eventType,
            "Payment",
            payment.getPaymentId().toString(),
            eventData
        );
    }

    private void publishRefundEvent(Payment payment, PaymentTransaction refundTransaction, String eventType) {
        Map<String, Object> eventData = Map.of(
            "paymentId", payment.getPaymentId(),
            "bookingId", payment.getBookingId(),
            "userId", payment.getUserId(),
            "refundTransactionId", refundTransaction.getTransactionId(),
            "refundAmount", refundTransaction.getAmount(),
            "currency", refundTransaction.getCurrency(),
            "status", refundTransaction.getStatus(),
            "provider", refundTransaction.getProvider(),
            "originalTransactionId", refundTransaction.getOriginalTransaction() != null ?
                refundTransaction.getOriginalTransaction().getTransactionId() : "",
            "sagaId", payment.getSagaId() != null ? payment.getSagaId() : ""
        );

        eventPublisher.publishEvent(
            eventType,
            "Payment",
            payment.getPaymentId().toString(),
            eventData
        );
    }

    private PaymentTransaction createFailedTransaction(Payment payment, String errorMessage) {
        PaymentTransaction failedTransaction = new PaymentTransaction();
        failedTransaction.setPayment(payment);
        failedTransaction.setTransactionReference(
            PaymentTransaction.generateTransactionReference(PaymentTransactionType.PAYMENT));
        failedTransaction.setTransactionType(PaymentTransactionType.PAYMENT);
        failedTransaction.setStatus(PaymentStatus.FAILED);
        failedTransaction.setAmount(payment.getAmount());
        failedTransaction.setCurrency(payment.getCurrency());
        failedTransaction.setDescription("Failed payment for " + payment.getDescription());
        failedTransaction.setFailureReason(errorMessage);
        failedTransaction.setFailureCode("PROCESSING_ERROR");
        failedTransaction.setSagaId(payment.getSagaId());
        failedTransaction.setSagaStep("PAYMENT_FAILED");

        return failedTransaction;
    }
}