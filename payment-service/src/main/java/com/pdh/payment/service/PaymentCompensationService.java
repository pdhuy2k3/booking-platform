package com.pdh.payment.service;

import com.pdh.common.saga.CompensationContext;
import com.pdh.common.saga.CompensationStrategy;
import com.pdh.payment.model.Payment;
import com.pdh.payment.model.PaymentSagaLog;
import com.pdh.payment.model.PaymentTransaction;
import com.pdh.payment.model.enums.PaymentStatus;
import com.pdh.payment.repository.PaymentRepository;
import com.pdh.payment.repository.PaymentSagaLogRepository;
import com.pdh.payment.repository.PaymentTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Payment Compensation Service
 * Handles compensation logic for failed payment operations in saga orchestration
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentCompensationService {

    private final PaymentService paymentService;
    private final PaymentOutboxEventService outboxEventService;
    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PaymentSagaLogRepository sagaLogRepository;

    /**
     * Execute compensation for a failed payment operation
     */
    @Transactional
    public void executeCompensation(String sagaId, CompensationContext compensationContext) {
        log.info("Executing payment compensation for saga: {}, operation: {}", 
                sagaId, compensationContext.getFailedOperation());

        try {
            // Find payment by saga ID
            Optional<Payment> paymentOpt = paymentRepository.findBySagaId(sagaId);
            if (paymentOpt.isEmpty()) {
                log.warn("Payment not found for saga: {}", sagaId);
                return;
            }

            Payment payment = paymentOpt.get();

            // Execute compensation based on strategy
            switch (compensationContext.getStrategy()) {
                case IMMEDIATE -> executeImmediateCompensation(payment, compensationContext);
                case RETRY_THEN_COMPENSATE -> executeRetryThenCompensate(payment, compensationContext);
                case MANUAL -> executeManualCompensation(payment, compensationContext);
                case BEST_EFFORT -> executeBestEffortCompensation(payment, compensationContext);
                case NONE -> log.info("No compensation required for saga: {}", sagaId);
            }

        } catch (Exception e) {
            log.error("Compensation execution failed for saga: {}", sagaId, e);
            // Log compensation failure
            logCompensationFailure(sagaId, compensationContext, e.getMessage());
        }
    }

    /**
     * Execute immediate compensation
     */
    private void executeImmediateCompensation(Payment payment, CompensationContext context) {
        log.info("Executing immediate compensation for payment: {}", payment.getPaymentId());

        try {
            // Cancel any pending transactions
            cancelPendingTransactions(payment);

            // Refund if payment was completed
            if (payment.getStatus() == PaymentStatus.COMPLETED) {
                refundCompletedPayment(payment, context);
            }

            // Update payment status
            payment.setStatus(PaymentStatus.CANCELLED);
            paymentRepository.save(payment);

            // Log compensation success
            logCompensationSuccess(payment, context, "Immediate compensation executed");

            // Publish compensation event
            publishCompensationEvent(payment, "PaymentCompensated", Map.of(
                "compensationType", "IMMEDIATE",
                "reason", context.getFailureReason()
            ));

        } catch (Exception e) {
            log.error("Immediate compensation failed for payment: {}", payment.getPaymentId(), e);
            throw e;
        }
    }

    /**
     * Execute retry then compensate
     */
    private void executeRetryThenCompensate(Payment payment, CompensationContext context) {
        log.info("Executing retry then compensate for payment: {}", payment.getPaymentId());

        if (context.shouldRetry()) {
            log.info("Retrying payment operation for saga: {}, attempt: {}", 
                    payment.getSagaId(), context.getRetryCount() + 1);

            // Increment retry count
            context.incrementRetry();

            // Log retry attempt
            logCompensationAttempt(payment, context, "Retry attempt");

            // Publish retry event
            publishCompensationEvent(payment, "PaymentRetry", Map.of(
                "retryCount", context.getRetryCount(),
                "maxRetries", context.getMaxRetries()
            ));

        } else {
            log.info("Max retries reached, executing compensation for payment: {}", payment.getPaymentId());
            executeImmediateCompensation(payment, context);
        }
    }

    /**
     * Execute manual compensation
     */
    private void executeManualCompensation(Payment payment, CompensationContext context) {
        log.info("Manual compensation required for payment: {}", payment.getPaymentId());

        // Mark payment for manual review
        payment.setStatus(PaymentStatus.CANCELLED);
        payment.setDescription(payment.getDescription() + " [MANUAL_COMPENSATION_REQUIRED]");
        paymentRepository.save(payment);

        // Log manual compensation requirement
        logCompensationAttempt(payment, context, "Manual compensation required");

        // Publish manual compensation event
        publishCompensationEvent(payment, "PaymentManualCompensationRequired", Map.of(
            "reason", context.getFailureReason(),
            "errorCode", context.getErrorCode()
        ));
    }

    /**
     * Execute best effort compensation
     */
    private void executeBestEffortCompensation(Payment payment, CompensationContext context) {
        log.info("Executing best effort compensation for payment: {}", payment.getPaymentId());

        try {
            // Try to cancel pending transactions
            cancelPendingTransactions(payment);

            // Try to refund if payment was completed (best effort)
            if (payment.getStatus() == PaymentStatus.COMPLETED) {
                try {
                    refundCompletedPayment(payment, context);
                } catch (Exception e) {
                    log.warn("Best effort refund failed for payment: {}, continuing with cancellation", 
                            payment.getPaymentId(), e);
                }
            }

            // Update payment status
            payment.setStatus(PaymentStatus.CANCELLED);
            payment.setDescription(payment.getDescription() + " [BEST_EFFORT_COMPENSATION]");
            paymentRepository.save(payment);

            // Log compensation success
            logCompensationSuccess(payment, context, "Best effort compensation executed");

            // Publish compensation event
            publishCompensationEvent(payment, "PaymentBestEffortCompensated", Map.of(
                "compensationType", "BEST_EFFORT",
                "reason", context.getFailureReason()
            ));

        } catch (Exception e) {
            log.error("Best effort compensation failed for payment: {}", payment.getPaymentId(), e);
            // Don't rethrow - best effort means we continue even if it fails
        }
    }

    /**
     * Cancel pending transactions
     */
    private void cancelPendingTransactions(Payment payment) {
        List<PaymentTransaction> pendingTransactions = payment.getTransactions().stream()
                .filter(t -> t.getStatus() == PaymentStatus.PENDING)
                .toList();

        for (PaymentTransaction transaction : pendingTransactions) {
            transaction.setStatus(PaymentStatus.CANCELLED);
            transaction.setFailureReason("Compensation - transaction cancelled");
            paymentTransactionRepository.save(transaction);
        }

        log.info("Cancelled {} pending transactions for payment: {}", 
                pendingTransactions.size(), payment.getPaymentId());
    }

    /**
     * Refund completed payment
     */
    private void refundCompletedPayment(Payment payment, CompensationContext context) {
        try {
            // Find the latest successful transaction
            Optional<PaymentTransaction> latestTransaction = payment.getTransactions().stream()
                    .filter(t -> t.getStatus().isSuccessful())
                    .max((t1, t2) -> t1.getCreatedAt().compareTo(t2.getCreatedAt()));

            if (latestTransaction.isPresent()) {
                PaymentTransaction transaction = latestTransaction.get();
                
                // Process refund
                PaymentTransaction refundTransaction = paymentService.processRefund(
                    transaction.getTransactionId(),
                    transaction.getAmount(),
                    "Saga compensation: " + context.getFailureReason()
                );

                log.info("Refund processed for payment: {}, refund transaction: {}", 
                        payment.getPaymentId(), refundTransaction.getTransactionId());
            }

        } catch (Exception e) {
            log.error("Refund failed for payment: {}", payment.getPaymentId(), e);
            throw e;
        }
    }

    /**
     * Log compensation success
     */
    private void logCompensationSuccess(Payment payment, CompensationContext context, String message) {
        PaymentSagaLog sagaLog = PaymentSagaLog.createCompensationStep(
            payment,
            "COMPENSATION_SUCCESS",
            "PaymentCompensated",
            payment.getStatus(),
            PaymentStatus.CANCELLED,
            context.getCompensationData().toString(),
            message
        );
        
        sagaLog.setProcessedAt(java.time.ZonedDateTime.now());
        sagaLogRepository.save(sagaLog);
    }

    /**
     * Log compensation failure
     */
    private void logCompensationFailure(String sagaId, CompensationContext context, String errorMessage) {
        // Find payment by saga ID
        Optional<Payment> paymentOpt = paymentRepository.findBySagaId(sagaId);
        if (paymentOpt.isEmpty()) {
            log.warn("Cannot log compensation failure - payment not found for saga: {}", sagaId);
            return;
        }

        Payment payment = paymentOpt.get();
        
        PaymentSagaLog sagaLog = PaymentSagaLog.createCompensationStep(
            payment,
            "COMPENSATION_FAILED",
            "PaymentCompensationFailed",
            payment.getStatus(),
            PaymentStatus.FAILED,
            context.getCompensationData().toString(),
            errorMessage
        );
        
        sagaLog.setProcessedAt(java.time.ZonedDateTime.now());
        sagaLogRepository.save(sagaLog);
    }

    /**
     * Log compensation attempt
     */
    private void logCompensationAttempt(Payment payment, CompensationContext context, String message) {
        PaymentSagaLog sagaLog = PaymentSagaLog.createCompensationStep(
            payment,
            "COMPENSATION_ATTEMPT",
            "PaymentCompensationAttempt",
            payment.getStatus(),
            payment.getStatus(), // No status change for attempt
            context.getCompensationData().toString(),
            message
        );
        
        sagaLog.setProcessedAt(java.time.ZonedDateTime.now());
        sagaLogRepository.save(sagaLog);
    }

    /**
     * Publish compensation event
     */
    private void publishCompensationEvent(Payment payment, String eventType, Map<String, Object> eventData) {
        try {
            Map<String, Object> fullEventData = new HashMap<>(eventData);
            fullEventData.put("paymentId", payment.getPaymentId());
            fullEventData.put("bookingId", payment.getBookingId());
            fullEventData.put("sagaId", payment.getSagaId());
            fullEventData.put("amount", payment.getAmount());
            fullEventData.put("currency", payment.getCurrency());

            outboxEventService.publishEvent(
                eventType,
                "PaymentCompensation",
                payment.getSagaId(),
                fullEventData
            );

            log.debug("Compensation event published: sagaId={}, eventType={}", 
                    payment.getSagaId(), eventType);

        } catch (Exception e) {
            log.error("Failed to publish compensation event: sagaId={}, eventType={}", 
                    payment.getSagaId(), eventType, e);
        }
    }
}
