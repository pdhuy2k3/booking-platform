package com.pdh.payment.service;

import com.pdh.common.saga.CompensationContext;
import com.pdh.common.saga.CompensationStrategy;
import com.pdh.common.saga.SagaCommand;
import com.pdh.common.saga.SagaState;
import com.pdh.payment.model.Payment;
import com.pdh.payment.model.PaymentMethod;
import com.pdh.payment.model.PaymentSagaLog;
import com.pdh.payment.model.PaymentTransaction;
import com.pdh.payment.model.enums.PaymentStatus;
import com.pdh.payment.model.enums.PaymentProvider;
import com.pdh.payment.model.enums.PaymentMethodType;
import com.pdh.payment.repository.PaymentRepository;
import com.pdh.payment.repository.PaymentSagaLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.Optional;

/**
 * Payment Saga Service
 * Handles saga orchestration for payment operations
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentSagaService {

    private final PaymentService paymentService;
    private final PaymentOutboxEventService outboxEventService;
    private final PaymentRepository paymentRepository;
    private final PaymentSagaLogRepository sagaLogRepository;
    private final PaymentCompensationService compensationService;

    /**
     * Process payment for saga command
     */
    @Transactional
    public void processPayment(SagaCommand command) {
        log.info("Processing payment for saga: {}, booking: {}", 
                command.getSagaId(), command.getBookingId());

        try {
            // Create payment from saga command
            Payment payment = createPaymentFromSagaCommand(command);
            
            // Create payment method
            PaymentMethod paymentMethod = createPaymentMethodFromSagaCommand(command);
            
            // Process payment
            PaymentTransaction transaction = paymentService.processPayment(
                payment, 
                paymentMethod, 
                extractAdditionalData(command)
            );

            // Log saga state
            logSagaState(command.getSagaId(), SagaState.PAYMENT_COMPLETED, 
                    "Payment processed successfully", transaction);

            // Publish saga event
            publishSagaEvent(command.getSagaId(), "PaymentProcessed", 
                    Map.of("transactionId", transaction.getTransactionId()));

            log.info("Payment processed successfully for saga: {}", command.getSagaId());

        } catch (Exception e) {
            log.error("Payment processing failed for saga: {}", command.getSagaId(), e);
            
            // Log failure
            logSagaState(command.getSagaId(), SagaState.COMPENSATION_PAYMENT_REFUND, 
                    "Payment processing failed: " + e.getMessage(), null);

            // Publish failure event
            publishSagaEvent(command.getSagaId(), "PaymentFailed", 
                    Map.of("error", e.getMessage()));

            throw e;
        }
    }

    /**
     * Refund payment for saga command
     */
    @Transactional
    public void refundPayment(SagaCommand command) {
        log.info("Processing payment refund for saga: {}, booking: {}", 
                command.getSagaId(), command.getBookingId());

        try {
            // Find payment by booking ID
            Payment payment = paymentRepository.findByBookingId(command.getBookingId())
                    .orElseThrow(() -> new RuntimeException("Payment not found for booking: " + command.getBookingId()));

            // Process refund
            PaymentTransaction refundTransaction = paymentService.refundPayment(
                payment.getPaymentId(), 
                payment.getAmount(), 
                "Saga compensation refund"
            );

            // Log saga state
            logSagaState(command.getSagaId(), SagaState.COMPENSATION_PAYMENT_REFUND, 
                    "Payment refunded successfully", refundTransaction);

            // Publish saga event
            publishSagaEvent(command.getSagaId(), "PaymentRefunded", 
                    Map.of("refundTransactionId", refundTransaction.getTransactionId()));

            log.info("Payment refunded successfully for saga: {}", command.getSagaId());

        } catch (Exception e) {
            log.error("Payment refund failed for saga: {}", command.getSagaId(), e);
            
            // Log failure
            logSagaState(command.getSagaId(), SagaState.COMPENSATION_PAYMENT_REFUND, 
                    "Payment refund failed: " + e.getMessage(), null);

            // Publish failure event
            publishSagaEvent(command.getSagaId(), "PaymentRefundFailed", 
                    Map.of("error", e.getMessage()));

            throw e;
        }
    }

    /**
     * Cancel payment for saga command
     */
    @Transactional
    public void cancelPayment(SagaCommand command) {
        log.info("Processing payment cancellation for saga: {}, booking: {}", 
                command.getSagaId(), command.getBookingId());

        try {
            // Find payment by booking ID
            Payment payment = paymentRepository.findByBookingId(command.getBookingId())
                    .orElseThrow(() -> new RuntimeException("Payment not found for booking: " + command.getBookingId()));

            // Cancel payment
            paymentService.cancelPayment(payment.getPaymentId());

            // Log saga state
            logSagaState(command.getSagaId(), SagaState.COMPENSATION_PAYMENT_REFUND, 
                    "Payment cancelled successfully", null);

            // Publish saga event
            publishSagaEvent(command.getSagaId(), "PaymentCancelled", 
                    Map.of("paymentId", payment.getPaymentId()));

            log.info("Payment cancelled successfully for saga: {}", command.getSagaId());

        } catch (Exception e) {
            log.error("Payment cancellation failed for saga: {}", command.getSagaId(), e);
            
            // Log failure
            logSagaState(command.getSagaId(), SagaState.COMPENSATION_PAYMENT_REFUND, 
                    "Payment cancellation failed: " + e.getMessage(), null);

            // Publish failure event
            publishSagaEvent(command.getSagaId(), "PaymentCancellationFailed", 
                    Map.of("error", e.getMessage()));

            throw e;
        }
    }

    /**
     * Confirm payment for saga command
     */
    @Transactional
    public void confirmPayment(SagaCommand command) {
        log.info("Confirming payment for saga: {}, booking: {}", 
                command.getSagaId(), command.getBookingId());

        try {
            // Find payment by booking ID
            Payment payment = paymentRepository.findByBookingId(command.getBookingId())
                    .orElseThrow(() -> new RuntimeException("Payment not found for booking: " + command.getBookingId()));

            // Confirm payment
            paymentService.confirmPayment(payment.getPaymentId());

            // Log saga state
            logSagaState(command.getSagaId(), SagaState.PAYMENT_COMPLETED, 
                    "Payment confirmed successfully", null);

            // Publish saga event
            publishSagaEvent(command.getSagaId(), "PaymentConfirmed", 
                    Map.of("paymentId", payment.getPaymentId()));

            log.info("Payment confirmed successfully for saga: {}", command.getSagaId());

        } catch (Exception e) {
            log.error("Payment confirmation failed for saga: {}", command.getSagaId(), e);
            
            // Log failure
            logSagaState(command.getSagaId(), SagaState.COMPENSATION_PAYMENT_REFUND, 
                    "Payment confirmation failed: " + e.getMessage(), null);

            // Publish failure event
            publishSagaEvent(command.getSagaId(), "PaymentConfirmationFailed", 
                    Map.of("error", e.getMessage()));

            throw e;
        }
    }

    /**
     * Handle command processing failure
     */
    @Transactional
    public void handleCommandFailure(SagaCommand command, Exception error) {
        log.error("Handling command failure for saga: {}, action: {}", 
                command.getSagaId(), command.getAction(), error);

        try {
            // Create compensation context
            CompensationContext compensationContext = CompensationContext.builder()
                    .sagaId(command.getSagaId())
                    .failedOperation(command.getAction())
                    .failureReason(error.getMessage())
                    .errorCode("COMMAND_PROCESSING_FAILED")
                    .strategy(CompensationStrategy.RETRY_THEN_COMPENSATE)
                    .retryCount(command.getRetryCount())
                    .maxRetries(3)
                    .contextData(Map.of("originalCommand", command))
                    .build();

            // Execute compensation
            compensationService.executeCompensation(command.getSagaId(), compensationContext);

            // Log failure
            logSagaState(command.getSagaId(), SagaState.COMPENSATION_PAYMENT_REFUND, 
                    "Command processing failed: " + error.getMessage(), null);

            // Publish failure event
            publishSagaEvent(command.getSagaId(), "CommandProcessingFailed", 
                    Map.of("error", error.getMessage(), "compensationContext", compensationContext));

        } catch (Exception e) {
            log.error("Error handling command failure for saga: {}", command.getSagaId(), e);
        }
    }

    /**
     * Create payment from saga command
     */
    private Payment createPaymentFromSagaCommand(SagaCommand command) {
        Payment payment = new Payment();
        payment.setBookingId(command.getBookingId());
        payment.setUserId(command.getCustomerId());
        payment.setAmount(command.getTotalAmount());
        payment.setCurrency("USD"); // Default currency
        payment.setStatus(PaymentStatus.PENDING);
        payment.setSagaId(command.getSagaId());
        payment.setDescription("Payment for booking: " + command.getBookingId());
        
        // Extract payment details from command
        if (command.getPaymentDetails() != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> paymentDetails = (Map<String, Object>) command.getPaymentDetails();
            String providerStr = (String) paymentDetails.get("provider");
            String methodTypeStr = (String) paymentDetails.get("methodType");
            
            if (providerStr != null) {
                try {
                    payment.setProvider(PaymentProvider.valueOf(providerStr.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    payment.setProvider(PaymentProvider.STRIPE); // Default
                }
            } else {
                payment.setProvider(PaymentProvider.STRIPE); // Default
            }
            
            if (methodTypeStr != null) {
                try {
                    payment.setMethodType(PaymentMethodType.valueOf(methodTypeStr.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    payment.setMethodType(PaymentMethodType.CREDIT_CARD); // Default
                }
            } else {
                payment.setMethodType(PaymentMethodType.CREDIT_CARD); // Default
            }
        } else {
            payment.setProvider(PaymentProvider.STRIPE);
            payment.setMethodType(PaymentMethodType.CREDIT_CARD);
        }

        return payment;
    }

    /**
     * Create payment method from saga command
     */
    private PaymentMethod createPaymentMethodFromSagaCommand(SagaCommand command) {
        PaymentMethod paymentMethod = new PaymentMethod();
        paymentMethod.setUserId(command.getCustomerId());
        paymentMethod.setProvider(PaymentProvider.STRIPE); // Default provider
        paymentMethod.setMethodType(PaymentMethodType.CREDIT_CARD);
        paymentMethod.setIsActive(true);
        paymentMethod.setIsDefault(false);
        paymentMethod.setDisplayName("Saga Payment Method");
        
        // Extract payment method details from command
        if (command.getPaymentDetails() != null) {
            @SuppressWarnings("unchecked")
            Map<String, Object> paymentDetails = (Map<String, Object>) command.getPaymentDetails();
            String providerStr = (String) paymentDetails.get("provider");
            String methodTypeStr = (String) paymentDetails.get("methodType");
            String token = (String) paymentDetails.get("token");
            
            if (providerStr != null) {
                try {
                    paymentMethod.setProvider(PaymentProvider.valueOf(providerStr.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    paymentMethod.setProvider(PaymentProvider.STRIPE); // Default
                }
            }
            
            if (methodTypeStr != null) {
                try {
                    paymentMethod.setMethodType(PaymentMethodType.valueOf(methodTypeStr.toUpperCase()));
                } catch (IllegalArgumentException e) {
                    paymentMethod.setMethodType(PaymentMethodType.CREDIT_CARD); // Default
                }
            }
            
            if (token != null) {
                paymentMethod.setToken(token);
            }
        }

        return paymentMethod;
    }

    /**
     * Extract additional data from saga command
     */
    private Map<String, Object> extractAdditionalData(SagaCommand command) {
        Map<String, Object> additionalData = Map.of(
            "sagaId", command.getSagaId(),
            "bookingId", command.getBookingId().toString(),
            "customerId", command.getCustomerId().toString()
        );

        // Add payment details if available
        if (command.getPaymentDetails() != null) {
            additionalData.put("paymentDetails", command.getPaymentDetails());
        }

        return additionalData;
    }

    /**
     * Log saga state
     */
    private void logSagaState(String sagaId, SagaState state, String message, PaymentTransaction transaction) {
        // Find payment by saga ID
        Optional<Payment> paymentOpt = paymentRepository.findBySagaId(sagaId);
        if (paymentOpt.isEmpty()) {
            log.warn("Payment not found for saga: {}", sagaId);
            return;
        }
        
        Payment payment = paymentOpt.get();
        
        // Create saga log using the factory method
        PaymentSagaLog sagaLog = PaymentSagaLog.createForwardStep(
            payment,
            state.name(),
            "SagaStateChange",
            payment.getStatus(),
            PaymentStatus.PENDING, // Will be updated based on actual status
            message
        );
        
        sagaLog.setTransactionId(transaction != null ? transaction.getTransactionId() : null);
        sagaLog.setProcessedAt(java.time.ZonedDateTime.now());
        
        sagaLogRepository.save(sagaLog);
        
        log.info("Saga state logged: sagaId={}, state={}, message={}", 
                sagaId, state, message);
    }

    /**
     * Publish saga event
     */
    private void publishSagaEvent(String sagaId, String eventType, Map<String, Object> eventData) {
        try {
            outboxEventService.publishEvent(
                eventType,
                "PaymentSaga",
                sagaId,
                eventData
            );
            
            log.debug("Saga event published: sagaId={}, eventType={}", sagaId, eventType);
        } catch (Exception e) {
            log.error("Failed to publish saga event: sagaId={}, eventType={}", sagaId, eventType, e);
        }
    }
}
