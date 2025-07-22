package com.pdh.flight.kafka.consumer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.kafka.consumer.BaseSelfEventConsumer;
import com.pdh.common.outbox.service.EventDeduplicationServiceInterface;
import com.pdh.flight.model.FlightOutboxEvent;
import com.pdh.flight.repository.FlightOutboxEventRepository;
import com.pdh.flight.service.FlightService;
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
 * Flight Self-Event Consumer for Listen to Yourself Pattern
 * Processes events that the flight service itself has published
 */
@Component
@Slf4j
public class FlightSelfEventConsumer extends BaseSelfEventConsumer<String> {
    
    private final FlightService flightService;
    private final FlightOutboxEventRepository outboxEventRepository;
    private static final String SERVICE_NAME = "flight-service";
    
    public FlightSelfEventConsumer(
            EventDeduplicationServiceInterface deduplicationService,
            ObjectMapper objectMapper,
            FlightService flightService,
            FlightOutboxEventRepository outboxEventRepository) {
        super(deduplicationService, objectMapper);
        this.flightService = flightService;
        this.outboxEventRepository = outboxEventRepository;
    }
    
    /**
     * Listen to flight service's own events
     */
    @KafkaListener(
        topics = "booking.Flight.events",
        groupId = "flight-service-self-group",
        containerFactory = "flightEventListenerContainerFactory"
    )
    public void handleFlightSelfEvent(
        @Payload String message,
        @Header(RECEIVED_KEY) String key,
        @Header(RECEIVED_TOPIC) String topic
    ) {
        log.info("Received flight self-event from topic {}: key={}, message={}", topic, key, message);
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
            log.info("Processing flight self-event: eventId={}, eventType={}, aggregateId={}", 
                    eventId, eventType, aggregateId);
            
            switch (eventType) {
                case "FlightReserved":
                    return handleFlightReservedSelfEvent(eventId, aggregateId, message);
                case "FlightReservationFailed":
                    return handleFlightReservationFailedSelfEvent(eventId, aggregateId, message);
                case "FlightCancelled":
                    return handleFlightCancelledSelfEvent(eventId, aggregateId, message);
                default:
                    log.warn("Unknown flight self-event type: {}", eventType);
                    return true; // Consider unknown events as processed to avoid infinite loops
            }
        } catch (Exception e) {
            log.error("Error handling flight self-event: eventId={}, eventType={}", eventId, eventType, e);
            return false;
        }
    }
    
    private boolean handleFlightReservedSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String flightId = payload.has("flightId") ? payload.get("flightId").asText() : aggregateId;
            String bookingId = payload.has("bookingId") ? payload.get("bookingId").asText() : null;
            
            log.info("Verifying flight reservation: flightId={}, bookingId={}", flightId, bookingId);
            
            // Verify that the flight reservation actually exists and is in correct state
            boolean reservationExists = flightService.verifyFlightReservation(UUID.fromString(flightId), bookingId);
            
            if (!reservationExists) {
                log.error("Flight reservation verification failed: flightId={}, bookingId={}", flightId, bookingId);
                // Could trigger compensation or alert
                return false;
            }
            
            log.info("Flight reservation verified successfully: flightId={}, bookingId={}", flightId, bookingId);
            return true;
            
        } catch (Exception e) {
            log.error("Error handling FlightReserved self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    private boolean handleFlightReservationFailedSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String flightId = payload.has("flightId") ? payload.get("flightId").asText() : aggregateId;
            String reason = payload.has("reason") ? payload.get("reason").asText() : "Unknown";
            
            log.info("Verifying flight reservation failure: flightId={}, reason={}", flightId, reason);
            
            // Verify that the flight reservation is indeed in failed state
            boolean failureVerified = flightService.verifyFlightReservationFailure(UUID.fromString(flightId));
            
            if (!failureVerified) {
                log.warn("Flight reservation failure verification failed: flightId={}", flightId);
            }
            
            return true; // Always consider failure events as processed
            
        } catch (Exception e) {
            log.error("Error handling FlightReservationFailed self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    private boolean handleFlightCancelledSelfEvent(String eventId, String aggregateId, String message) {
        try {
            JsonNode payload = parsePayload(message);
            if (payload == null) return false;
            
            String flightId = payload.has("flightId") ? payload.get("flightId").asText() : aggregateId;
            
            log.info("Verifying flight cancellation: flightId={}", flightId);
            
            // Verify that the flight is indeed cancelled
            boolean cancellationVerified = flightService.verifyFlightCancellation(UUID.fromString(flightId));
            
            if (!cancellationVerified) {
                log.warn("Flight cancellation verification failed: flightId={}", flightId);
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("Error handling FlightCancelled self-event: eventId={}", eventId, e);
            return false;
        }
    }
    
    @Override
    protected void updateSelfProcessedStatus(String eventId, boolean processed) {
        try {
            Optional<FlightOutboxEvent> eventOpt = outboxEventRepository.findByEventId(eventId);
            if (eventOpt.isPresent()) {
                FlightOutboxEvent event = eventOpt.get();
                if (processed) {
                    event.markAsSelfProcessed();
                } else {
                    event.incrementProcessingAttempts();
                }
                outboxEventRepository.save(event);
                log.debug("Updated self-processed status for flight event {}: {}", eventId, processed);
            } else {
                log.warn("Flight outbox event not found for eventId: {}", eventId);
            }
        } catch (Exception e) {
            log.error("Error updating self-processed status for flight event {}", eventId, e);
        }
    }
}
