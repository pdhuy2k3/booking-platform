package com.pdh.payment.service;

import com.pdh.payment.model.*;
import com.pdh.payment.model.enums.PaymentStatus;
import com.pdh.payment.model.enums.PaymentTransactionType;
import com.pdh.payment.repository.*;
import com.pdh.payment.service.dto.PaymentRequest;
import com.pdh.payment.service.dto.RefundRequest;
import com.pdh.payment.service.dto.PaymentProcessingResult;
import com.pdh.payment.service.strategy.PaymentStrategy;
import com.pdh.payment.service.strategy.PaymentStrategyFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Payment Service
 * Main service for payment processing with Saga pattern support
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentService {
    
    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository transactionRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final PaymentSagaLogRepository sagaLogRepository;
    private final PaymentOutboxEventRepository outboxEventRepository;
    private final PaymentStrategyFactory strategyFactory;
    private final PaymentOutboxService outboxService;
    
    /**
     * Process payment for booking (Saga step)
     */
    @Transactional
    public PaymentProcessingResult processPayment(PaymentRequest request) {
        log.info("Processing payment for booking: {} with saga: {}", request.getBookingId(), request.getSagaId());
        
        try {
            // Create payment record
            Payment payment = createPayment(request);
            payment = paymentRepository.save(payment);
            
            // Log saga step
            PaymentSagaLog sagaLog = PaymentSagaLog.createForwardStep(
                payment, "PAYMENT_INITIATED", "PaymentInitiated",
                null, PaymentStatus.PENDING, 
                createPaymentInitiatedPayload(request));
            sagaLogRepository.save(sagaLog);
            
            // Get payment method
            PaymentMethod paymentMethod = getPaymentMethod(request.getPaymentMethodId(), request.getUserId());
            
            // Get payment strategy
            PaymentStrategy strategy = strategyFactory.getStrategy(paymentMethod);
            
            // Validate payment method
            PaymentStrategy.ValidationResult validation = strategy.validatePaymentMethod(paymentMethod);
            if (!validation.isValid()) {
                return handlePaymentFailure(payment, validation.getErrorMessage(), validation.getErrorCode());
            }
            
            // Process payment through strategy
            PaymentTransaction transaction = strategy.processPayment(payment, paymentMethod, request.getAdditionalData());
            transaction = transactionRepository.save(transaction);
            
            // Update payment status
            payment.setStatus(transaction.getStatus());
            if (transaction.isSuccessful()) {
                payment.markAsConfirmed();
                payment.setGatewayTransactionId(transaction.getGatewayTransactionId());
            } else if (transaction.isFailed()) {
                payment.markAsFailed(transaction.getFailureReason());
            }
            payment = paymentRepository.save(payment);
            
            // Log saga completion/failure
            PaymentSagaLog completionLog = transaction.isSuccessful() ?
                PaymentSagaLog.createForwardStep(payment, "PAYMENT_COMPLETED", "PaymentCompleted",
                    PaymentStatus.PROCESSING, payment.getStatus(), createPaymentCompletedPayload(payment, transaction)) :
                PaymentSagaLog.createCompensationStep(payment, "PAYMENT_FAILED", "PaymentFailed",
                    PaymentStatus.PROCESSING, payment.getStatus(), null, transaction.getFailureReason());
            sagaLogRepository.save(completionLog);
            
            // Publish outbox events
            publishPaymentEvents(payment, transaction);
            
            log.info("Payment processing completed for payment: {} with status: {}", 
                    payment.getPaymentId(), payment.getStatus());
            
            return PaymentProcessingResult.success(payment, transaction);
            
        } catch (Exception e) {
            log.error("Error processing payment for booking: {}", request.getBookingId(), e);
            return PaymentProcessingResult.failure("Payment processing failed: " + e.getMessage(), "PROCESSING_ERROR");
        }
    }
    
    /**
     * Process refund (Saga compensation)
     */
    @Transactional
    public PaymentProcessingResult processRefund(RefundRequest request) {
        log.info("Processing refund for payment: {} with saga: {}", request.getPaymentId(), request.getSagaId());
        
        try {
            // Get original payment
            Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new PaymentNotFoundException("Payment not found: " + request.getPaymentId()));
            
            // Validate refund
            if (!payment.canBeRefunded()) {
                return PaymentProcessingResult.failure("Payment cannot be refunded", "REFUND_NOT_ALLOWED");
            }
            
            BigDecimal refundAmount = request.getAmount() != null ? request.getAmount() : payment.getAmount();
            if (refundAmount.compareTo(payment.getRemainingRefundableAmount()) > 0) {
                return PaymentProcessingResult.failure("Refund amount exceeds refundable amount", "INVALID_REFUND_AMOUNT");
            }
            
            // Get original payment transaction
            List<PaymentTransaction> originalTransactions = transactionRepository
                .findByPayment_PaymentIdAndTransactionType(payment.getPaymentId(), PaymentTransactionType.PAYMENT);
            
            if (originalTransactions.isEmpty()) {
                return PaymentProcessingResult.failure("No original transaction found for refund", "NO_ORIGINAL_TRANSACTION");
            }
            
            PaymentTransaction originalTransaction = originalTransactions.get(0);
            
            // Get payment method and strategy
            PaymentMethod paymentMethod = getPaymentMethod(payment.getPaymentMethodId(), payment.getUserId());
            PaymentStrategy strategy = strategyFactory.getStrategy(paymentMethod);
            
            if (!strategy.supportsRefunds()) {
                return PaymentProcessingResult.failure("Payment method does not support refunds", "REFUNDS_NOT_SUPPORTED");
            }
            
            // Process refund
            PaymentTransaction refundTransaction = strategy.processRefund(originalTransaction, refundAmount, request.getReason());
            refundTransaction.setSagaId(request.getSagaId());
            refundTransaction = transactionRepository.save(refundTransaction);
            
            // Update payment
            if (refundTransaction.isSuccessful()) {
                BigDecimal currentRefunded = payment.getRefundedAmount() != null ? payment.getRefundedAmount() : BigDecimal.ZERO;
                payment.setRefundedAmount(currentRefunded.add(refundAmount));
                
                if (payment.isFullyRefunded()) {
                    payment.setStatus(PaymentStatus.REFUND_COMPLETED);
                } else {
                    payment.setStatus(PaymentStatus.REFUND_COMPLETED); // Partial refund
                }
            } else {
                payment.setStatus(PaymentStatus.REFUND_FAILED);
            }
            payment = paymentRepository.save(payment);
            
            // Log saga step
            PaymentSagaLog sagaLog = refundTransaction.isSuccessful() ?
                PaymentSagaLog.createCompensationStep(payment, "REFUND_COMPLETED", "RefundCompleted",
                    PaymentStatus.CONFIRMED, payment.getStatus(), createRefundCompletedPayload(payment, refundTransaction), null) :
                PaymentSagaLog.createCompensationStep(payment, "REFUND_FAILED", "RefundFailed",
                    PaymentStatus.CONFIRMED, payment.getStatus(), null, refundTransaction.getFailureReason());
            sagaLogRepository.save(sagaLog);
            
            // Publish outbox events
            publishRefundEvents(payment, refundTransaction);
            
            log.info("Refund processing completed for payment: {} with status: {}", 
                    payment.getPaymentId(), refundTransaction.getStatus());
            
            return PaymentProcessingResult.success(payment, refundTransaction);
            
        } catch (Exception e) {
            log.error("Error processing refund for payment: {}", request.getPaymentId(), e);
            return PaymentProcessingResult.failure("Refund processing failed: " + e.getMessage(), "REFUND_ERROR");
        }
    }
    
    /**
     * Get payment by ID
     */
    @Transactional(readOnly = true)
    public Optional<Payment> getPayment(UUID paymentId) {
        return paymentRepository.findById(paymentId);
    }
    
    /**
     * Get payment by reference
     */
    @Transactional(readOnly = true)
    public Optional<Payment> getPaymentByReference(String paymentReference) {
        return paymentRepository.findByPaymentReference(paymentReference);
    }
    
    /**
     * Get payments by booking ID
     */
    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByBooking(UUID bookingId) {
        return paymentRepository.findByBookingIdOrderByCreatedAtDesc(bookingId);
    }
    
    /**
     * Get payment by saga ID
     */
    @Transactional(readOnly = true)
    public Optional<Payment> getPaymentBySagaId(String sagaId) {
        return paymentRepository.findBySagaId(sagaId);
    }
    
    // Private helper methods
    
    private Payment createPayment(PaymentRequest request) {
        Payment payment = new Payment();
        payment.setPaymentReference(Payment.generatePaymentReference());
        payment.setBookingId(request.getBookingId());
        payment.setUserId(request.getUserId());
        payment.setCustomerId(request.getCustomerId());
        payment.setSagaId(request.getSagaId());
        payment.setSagaStep("PAYMENT_PROCESSING");
        payment.setAmount(request.getAmount());
        payment.setCurrency(request.getCurrency());
        payment.setDescription(request.getDescription());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setPaymentMethodId(request.getPaymentMethodId());
        payment.setIpAddress(request.getIpAddress());
        payment.setUserAgent(request.getUserAgent());
        payment.setMetadata(request.getMetadata());
        
        // Set expiration (30 minutes from now)
        payment.setExpiredAt(ZonedDateTime.now().plusMinutes(30));
        
        return payment;
    }
    
    private PaymentMethod getPaymentMethod(UUID paymentMethodId, UUID userId) {
        return paymentMethodRepository.findById(paymentMethodId)
            .filter(pm -> pm.getUserId().equals(userId) && pm.getIsActive())
            .orElseThrow(() -> new PaymentMethodNotFoundException("Payment method not found or not active: " + paymentMethodId));
    }
    
    private PaymentProcessingResult handlePaymentFailure(Payment payment, String errorMessage, String errorCode) {
        payment.markAsFailed(errorMessage);
        payment = paymentRepository.save(payment);
        
        PaymentSagaLog failureLog = PaymentSagaLog.createCompensationStep(
            payment, "PAYMENT_VALIDATION_FAILED", "PaymentValidationFailed",
            PaymentStatus.PENDING, PaymentStatus.FAILED, null, errorMessage);
        sagaLogRepository.save(failureLog);
        
        return PaymentProcessingResult.failure(errorMessage, errorCode);
    }
    
    private void publishPaymentEvents(Payment payment, PaymentTransaction transaction) {
        try {
            String eventType = transaction.isSuccessful() ? 
                PaymentOutboxEvent.EventTypes.PAYMENT_COMPLETED :
                PaymentOutboxEvent.EventTypes.PAYMENT_FAILED;
            
            String payload = createPaymentEventPayload(payment, transaction);
            
            PaymentOutboxEvent event = PaymentOutboxEvent.createPaymentEvent(
                eventType, payment.getPaymentId(), payment.getSagaId(),
                payment.getBookingId(), payment.getUserId(), payload);
            
            outboxEventRepository.save(event);
            outboxService.processEvent(event);
            
        } catch (Exception e) {
            log.error("Failed to publish payment events for payment: {}", payment.getPaymentId(), e);
        }
    }
    
    private void publishRefundEvents(Payment payment, PaymentTransaction refundTransaction) {
        try {
            String eventType = refundTransaction.isSuccessful() ?
                (payment.isFullyRefunded() ? 
                    PaymentOutboxEvent.EventTypes.PAYMENT_REFUNDED :
                    PaymentOutboxEvent.EventTypes.PAYMENT_PARTIALLY_REFUNDED) :
                "payment.refund.failed";
            
            String payload = createRefundEventPayload(payment, refundTransaction);
            
            PaymentOutboxEvent event = PaymentOutboxEvent.createPaymentEvent(
                eventType, payment.getPaymentId(), payment.getSagaId(),
                payment.getBookingId(), payment.getUserId(), payload);
            
            outboxEventRepository.save(event);
            outboxService.processEvent(event);
            
        } catch (Exception e) {
            log.error("Failed to publish refund events for payment: {}", payment.getPaymentId(), e);
        }
    }
    
    // JSON payload creation methods (simplified - in real implementation use proper JSON library)
    private String createPaymentInitiatedPayload(PaymentRequest request) {
        return String.format("{\"bookingId\":\"%s\",\"amount\":%s,\"currency\":\"%s\"}", 
            request.getBookingId(), request.getAmount(), request.getCurrency());
    }
    
    private String createPaymentCompletedPayload(Payment payment, PaymentTransaction transaction) {
        return String.format("{\"paymentId\":\"%s\",\"transactionId\":\"%s\",\"amount\":%s,\"status\":\"%s\"}", 
            payment.getPaymentId(), transaction.getTransactionId(), payment.getAmount(), payment.getStatus());
    }
    
    private String createRefundCompletedPayload(Payment payment, PaymentTransaction refundTransaction) {
        return String.format("{\"paymentId\":\"%s\",\"refundTransactionId\":\"%s\",\"refundAmount\":%s}", 
            payment.getPaymentId(), refundTransaction.getTransactionId(), refundTransaction.getAmount());
    }
    
    private String createPaymentEventPayload(Payment payment, PaymentTransaction transaction) {
        return String.format("{\"payment\":{\"id\":\"%s\",\"amount\":%s,\"status\":\"%s\"},\"transaction\":{\"id\":\"%s\",\"type\":\"%s\"}}", 
            payment.getPaymentId(), payment.getAmount(), payment.getStatus(),
            transaction.getTransactionId(), transaction.getTransactionType());
    }
    
    private String createRefundEventPayload(Payment payment, PaymentTransaction refundTransaction) {
        return String.format("{\"payment\":{\"id\":\"%s\",\"refundedAmount\":%s},\"refund\":{\"id\":\"%s\",\"amount\":%s}}", 
            payment.getPaymentId(), payment.getRefundedAmount(),
            refundTransaction.getTransactionId(), refundTransaction.getAmount());
    }
    
    // Custom exceptions
    public static class PaymentNotFoundException extends RuntimeException {
        public PaymentNotFoundException(String message) {
            super(message);
        }
    }
    
    public static class PaymentMethodNotFoundException extends RuntimeException {
        public PaymentMethodNotFoundException(String message) {
            super(message);
        }
    }
}
