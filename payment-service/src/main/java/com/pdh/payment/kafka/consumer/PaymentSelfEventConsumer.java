package com.pdh.payment.kafka.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.kafka.consumer.BaseSelfEventConsumer;
import com.pdh.common.outbox.service.EventDeduplicationServiceInterface;
import com.pdh.payment.model.PaymentOutboxEvent;
import com.pdh.payment.repository.PaymentOutboxEventRepository;
import com.pdh.payment.service.PaymentService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

import static org.springframework.kafka.support.KafkaHeaders.RECEIVED_KEY;
import static org.springframework.kafka.support.KafkaHeaders.RECEIVED_TOPIC;

/**
 * Payment Self-Event Consumer for Listen to Yourself Pattern
 * Processes events that the payment service itself has published
 */
@Component
@Slf4j
public class PaymentSelfEventConsumer extends BaseSelfEventConsumer<String> {
    
    private final PaymentService paymentService;
    private final PaymentOutboxEventRepository outboxEventRepository;
    private static final String SERVICE_NAME = "payment-service";
    
    public PaymentSelfEventConsumer(
            EventDeduplicationServiceInterface deduplicationService,
            ObjectMapper objectMapper,
            PaymentService paymentService,
            PaymentOutboxEventRepository outboxEventRepository) {
        super(deduplicationService, objectMapper);
        this.paymentService = paymentService;
        this.outboxEventRepository = outboxEventRepository;
    }
    
    /**
     * Listen to payment service's own events
     */
    @KafkaListener(
        topics = "booking.Payment.events",
        groupId = "payment-service-self-group",
        containerFactory = "paymentEventListenerContainerFactory"
    )
    public void handlePaymentSelfEvent(
        @Payload String message,
        @Header(RECEIVED_KEY) String key,
        @Header(RECEIVED_TOPIC) String topic
    ) {
        log.info("Received payment self-event from topic {}: key={}, message={}", topic, key, message);
        processSelfEvent(message, SERVICE_NAME);
    }
    
    @Override
    protected String extractEventId(String message) {
        try {
            JsonNode jsonNode = objectMapper.readTree(message);
            return jsonNode.has("eventId") ? jsonNode.get("eventId").asText() : 
                   jsonNode.has("id") ? jsonNode.get("id").asText() : null;
        } catch (Exception e) {
            log.error("Failed to extract event ID from message: {}", message, e);
            return null;
        }
    }
    
    @Override
    protected String extractEventType(String message) {
        try {
            JsonNode jsonNode = objectMapper.readTree(message);
            return jsonNode.has("eventType") ? jsonNode.get("eventType").asText() : 
                   jsonNode.has("event_type") ? jsonNode.get("event_type").asText() : null;
        } catch (Exception e) {
            log.error("Failed to extract event type from message: {}", message, e);
            return null;
        }
    }
    
    @Override
    protected String extractAggregateId(String message) {
        try {
            JsonNode jsonNode = objectMapper.readTree(message);
            return jsonNode.has("aggregateId") ? jsonNode.get("aggregateId").asText() : 
                   jsonNode.has("aggregate_id") ? jsonNode.get("aggregate_id").asText() : null;
        } catch (Exception e) {
            log.error("Failed to extract aggregate ID from message: {}", message, e);
            return null;
        }
    }
    
    @Override
    protected boolean handleSelfEvent(String eventId, String eventType, String aggregateId, String message) {
        try {
            log.info("Processing payment self-event: eventId={}, eventType={}, aggregateId={}", 
                    eventId, eventType, aggregateId);
            
            switch (eventType) {
                case "PaymentProcessed":
                    return handlePaymentProcessedSelfEvent(eventId, aggregateId, message);
                case "PaymentFailed":
                    return handlePaymentFailedSelfEvent(eventId, aggregateId, message);
                case "PaymentRefunded":
                    return handlePaymentRefundedSelfEvent(eventId, aggregateId, message);
                case "PaymentCancelled":
                    return handlePaymentCancelledSelfEvent(eventId, aggregateId, message);
                default:
                    log.warn("Unknown payment self-event type: {}", eventType);
                    return true; // Consider unknown events as processed to avoid infinite loops
            }
        } catch (Exception e) {
            log.error("Error handling payment self-event: eventId={}, eventType={}", eventId, eventType, e);
            return false;
        }
    }
    
    private boolean handlePaymentProcessedSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String paymentId = payload.has("paymentId") ? payload.get("paymentId").asText() : aggregateId;
            String bookingId = payload.has("bookingId") ? payload.get("bookingId").asText() : null;
            
            log.info("Verifying payment processing: paymentId={}, bookingId={}", paymentId, bookingId);
            
            // Verify that the payment was actually processed successfully
            boolean paymentVerified = paymentService.verifyPaymentProcessed(UUID.fromString(paymentId));
            
            if (!paymentVerified) {
                log.error("Payment processing verification failed: paymentId={}, bookingId={}", paymentId, bookingId);
                // Could trigger compensation or alert
                return false;
            }
            
            log.info("Payment processing verified successfully: paymentId={}, bookingId={}", paymentId, bookingId);
            return true;
            
        } catch (Exception e) {
            log.error("Error handling PaymentProcessed self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    private boolean handlePaymentFailedSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String paymentId = payload.has("paymentId") ? payload.get("paymentId").asText() : aggregateId;
            String reason = payload.has("reason") ? payload.get("reason").asText() : "Unknown";
            
            log.info("Verifying payment failure: paymentId={}, reason={}", paymentId, reason);
            
            // Verify that the payment is indeed in failed state
            boolean failureVerified = paymentService.verifyPaymentFailure(UUID.fromString(paymentId));
            
            if (!failureVerified) {
                log.warn("Payment failure verification failed: paymentId={}", paymentId);
            }
            
            return true; // Always consider failure events as processed
            
        } catch (Exception e) {
            log.error("Error handling PaymentFailed self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    private boolean handlePaymentRefundedSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String paymentId = payload.has("paymentId") ? payload.get("paymentId").asText() : aggregateId;
            
            log.info("Verifying payment refund: paymentId={}", paymentId);
            
            // Verify that the payment refund was processed
            boolean refundVerified = paymentService.verifyPaymentRefund(UUID.fromString(paymentId));
            
            if (!refundVerified) {
                log.warn("Payment refund verification failed: paymentId={}", paymentId);
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("Error handling PaymentRefunded self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    private boolean handlePaymentCancelledSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String paymentId = payload.has("paymentId") ? payload.get("paymentId").asText() : aggregateId;
            
            log.info("Verifying payment cancellation: paymentId={}", paymentId);
            
            // Verify that the payment is indeed cancelled
            boolean cancellationVerified = paymentService.verifyPaymentCancellation(UUID.fromString(paymentId));
            
            if (!cancellationVerified) {
                log.warn("Payment cancellation verification failed: paymentId={}", paymentId);
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("Error handling PaymentCancelled self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    @Override
    protected void updateSelfProcessedStatus(String eventId, boolean processed) {
        try {
            Optional<PaymentOutboxEvent> eventOpt = outboxEventRepository.findByEventId(eventId);
            if (eventOpt.isPresent()) {
                PaymentOutboxEvent event = eventOpt.get();
                if (processed) {
                    event.markAsSelfProcessed();
                } else {
                    event.incrementProcessingAttempts();
                }
                outboxEventRepository.save(event);
                log.debug("Updated self-processed status for payment event {}: {}", eventId, processed);
            } else {
                log.warn("Payment outbox event not found for eventId: {}", eventId);
            }
        } catch (Exception e) {
            log.error("Error updating self-processed status for payment event {}", eventId, e);
        }
    }
}
