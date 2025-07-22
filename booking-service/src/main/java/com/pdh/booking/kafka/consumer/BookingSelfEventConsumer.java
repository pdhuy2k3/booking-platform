package com.pdh.booking.kafka.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.booking.model.BookingOutboxEvent;
import com.pdh.booking.repository.BookingOutboxEventRepository;
import com.pdh.booking.service.BookingSagaService;
import com.pdh.common.kafka.consumer.BaseSelfEventConsumer;
import com.pdh.common.outbox.service.EventDeduplicationServiceInterface;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.Optional;
import java.util.UUID;

import static com.pdh.booking.kafka.config.BookingCdcKafkaListenerConfig.BOOKING_CDC_LISTENER_CONTAINER_FACTORY;
import static org.springframework.kafka.support.KafkaHeaders.RECEIVED_KEY;
import static org.springframework.kafka.support.KafkaHeaders.RECEIVED_TOPIC;

/**
 * Booking Self-Event Consumer for Listen to Yourself Pattern
 * Processes events that the booking service itself has published
 * This is the most critical consumer as it verifies saga orchestration
 */
@Component
@Slf4j
public class BookingSelfEventConsumer extends BaseSelfEventConsumer<String> {
    
    private final BookingSagaService bookingSagaService;
    private final BookingOutboxEventRepository outboxEventRepository;
    private static final String SERVICE_NAME = "booking-service";
    
    public BookingSelfEventConsumer(
            EventDeduplicationServiceInterface deduplicationService,
            ObjectMapper objectMapper,
            BookingSagaService bookingSagaService,
            BookingOutboxEventRepository outboxEventRepository) {
        super(deduplicationService, objectMapper);
        this.bookingSagaService = bookingSagaService;
        this.outboxEventRepository = outboxEventRepository;
    }
    
    /**
     * Listen to booking service's own events
     */
    @KafkaListener(
        topics = "booking.Booking.events",
        groupId = "booking-service-self-group",
        containerFactory = BOOKING_CDC_LISTENER_CONTAINER_FACTORY
    )
    public void handleBookingSelfEvent(
        @Payload String message,
        @Header(RECEIVED_KEY) String key,
        @Header(RECEIVED_TOPIC) String topic
    ) {
        log.info("Received booking self-event from topic {}: key={}, message={}", topic, key, message);
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
            log.info("Processing booking self-event: eventId={}, eventType={}, aggregateId={}", 
                    eventId, eventType, aggregateId);
            
            switch (eventType) {
                case "BookingCreated":
                    return handleBookingCreatedSelfEvent(eventId, aggregateId, message);
                case "BookingConfirmed":
                    return handleBookingConfirmedSelfEvent(eventId, aggregateId, message);
                case "BookingCancelled":
                    return handleBookingCancelledSelfEvent(eventId, aggregateId, message);
                case "BookingFailed":
                    return handleBookingFailedSelfEvent(eventId, aggregateId, message);
                case "SagaStarted":
                    return handleSagaStartedSelfEvent(eventId, aggregateId, message);
                case "SagaCompleted":
                    return handleSagaCompletedSelfEvent(eventId, aggregateId, message);
                case "SagaFailed":
                    return handleSagaFailedSelfEvent(eventId, aggregateId, message);
                case "SagaCompensated":
                    return handleSagaCompensatedSelfEvent(eventId, aggregateId, message);
                default:
                    log.warn("Unknown booking self-event type: {}", eventType);
                    return true; // Consider unknown events as processed to avoid infinite loops
            }
        } catch (Exception e) {
            log.error("Error handling booking self-event: eventId={}, eventType={}", eventId, eventType, e);
            return false;
        }
    }
    
    private boolean handleBookingCreatedSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String bookingId = payload.has("bookingId") ? payload.get("bookingId").asText() : aggregateId;
            String userId = payload.has("userId") ? payload.get("userId").asText() : null;
            
            log.info("Verifying booking creation: bookingId={}, userId={}", bookingId, userId);
            
            // Verify that the booking was actually created
            boolean bookingExists = bookingSagaService.verifyBookingCreated(UUID.fromString(bookingId));
            
            if (!bookingExists) {
                log.error("Booking creation verification failed: bookingId={}", bookingId);
                return false;
            }
            
            log.info("Booking creation verified successfully: bookingId={}", bookingId);
            return true;
            
        } catch (Exception e) {
            log.error("Error handling BookingCreated self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    private boolean handleBookingConfirmedSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String bookingId = payload.has("bookingId") ? payload.get("bookingId").asText() : aggregateId;
            
            log.info("Verifying booking confirmation: bookingId={}", bookingId);
            
            // Verify that the booking is confirmed and saga completed successfully
            boolean bookingConfirmed = bookingSagaService.verifyBookingConfirmed(UUID.fromString(bookingId));
            
            if (!bookingConfirmed) {
                log.error("Booking confirmation verification failed: bookingId={}", bookingId);
                return false;
            }
            
            log.info("Booking confirmation verified successfully: bookingId={}", bookingId);
            return true;
            
        } catch (Exception e) {
            log.error("Error handling BookingConfirmed self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    private boolean handleBookingCancelledSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String bookingId = payload.has("bookingId") ? payload.get("bookingId").asText() : aggregateId;
            
            log.info("Verifying booking cancellation: bookingId={}", bookingId);
            
            // Verify that the booking is cancelled and compensation completed
            boolean bookingCancelled = bookingSagaService.verifyBookingCancelled(UUID.fromString(bookingId));
            
            if (!bookingCancelled) {
                log.warn("Booking cancellation verification failed: bookingId={}", bookingId);
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("Error handling BookingCancelled self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    private boolean handleBookingFailedSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String bookingId = payload.has("bookingId") ? payload.get("bookingId").asText() : aggregateId;
            String reason = payload.has("reason") ? payload.get("reason").asText() : "Unknown";
            
            log.info("Verifying booking failure: bookingId={}, reason={}", bookingId, reason);
            
            // Verify that the booking is in failed state
            boolean bookingFailed = bookingSagaService.verifyBookingFailed(UUID.fromString(bookingId));
            
            if (!bookingFailed) {
                log.warn("Booking failure verification failed: bookingId={}", bookingId);
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("Error handling BookingFailed self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    private boolean handleSagaStartedSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String sagaId = payload.has("sagaId") ? payload.get("sagaId").asText() : aggregateId;
            String bookingId = payload.has("bookingId") ? payload.get("bookingId").asText() : null;
            
            log.info("Verifying saga start: sagaId={}, bookingId={}", sagaId, bookingId);
            
            // Verify that the saga was started correctly
            boolean sagaStarted = bookingSagaService.verifySagaStarted(sagaId);
            
            if (!sagaStarted) {
                log.error("Saga start verification failed: sagaId={}", sagaId);
                return false;
            }
            
            log.info("Saga start verified successfully: sagaId={}", sagaId);
            return true;
            
        } catch (Exception e) {
            log.error("Error handling SagaStarted self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    private boolean handleSagaCompletedSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String sagaId = payload.has("sagaId") ? payload.get("sagaId").asText() : aggregateId;
            
            log.info("Verifying saga completion: sagaId={}", sagaId);
            
            // Verify that the saga completed successfully
            boolean sagaCompleted = bookingSagaService.verifySagaCompleted(sagaId);
            
            if (!sagaCompleted) {
                log.error("Saga completion verification failed: sagaId={}", sagaId);
                return false;
            }
            
            log.info("Saga completion verified successfully: sagaId={}", sagaId);
            return true;
            
        } catch (Exception e) {
            log.error("Error handling SagaCompleted self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    private boolean handleSagaFailedSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String sagaId = payload.has("sagaId") ? payload.get("sagaId").asText() : aggregateId;
            
            log.info("Verifying saga failure: sagaId={}", sagaId);
            
            // Verify that the saga is in failed state
            boolean sagaFailed = bookingSagaService.verifySagaFailed(sagaId);
            
            if (!sagaFailed) {
                log.warn("Saga failure verification failed: sagaId={}", sagaId);
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("Error handling SagaFailed self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    private boolean handleSagaCompensatedSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String sagaId = payload.has("sagaId") ? payload.get("sagaId").asText() : aggregateId;
            
            log.info("Verifying saga compensation: sagaId={}", sagaId);
            
            // Verify that the saga compensation completed
            boolean sagaCompensated = bookingSagaService.verifySagaCompensated(sagaId);
            
            if (!sagaCompensated) {
                log.warn("Saga compensation verification failed: sagaId={}", sagaId);
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("Error handling SagaCompensated self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    @Override
    protected void updateSelfProcessedStatus(String eventId, boolean processed) {
        try {
            Optional<BookingOutboxEvent> eventOpt = outboxEventRepository.findByEventId(eventId);
            if (eventOpt.isPresent()) {
                BookingOutboxEvent event = eventOpt.get();
                if (processed) {
                    event.markAsSelfProcessed();
                } else {
                    event.incrementProcessingAttempts();
                }
                outboxEventRepository.save(event);
                log.debug("Updated self-processed status for booking event {}: {}", eventId, processed);
            } else {
                log.warn("Booking outbox event not found for eventId: {}", eventId);
            }
        } catch (Exception e) {
            log.error("Error updating self-processed status for booking event {}", eventId, e);
        }
    }
}
