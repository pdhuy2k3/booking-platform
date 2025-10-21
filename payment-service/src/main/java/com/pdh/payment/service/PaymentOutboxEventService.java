package com.pdh.payment.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.outbox.service.OutboxEventService;
import com.pdh.payment.model.PaymentOutboxEvent;
import com.pdh.payment.repository.PaymentOutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.pdh.common.outbox.service.OutboxEventService.OutboxStatistics;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.List;

/**
 * Payment-specific implementation of OutboxEventService
 * Publishes events to payment_outbox_events table
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentOutboxEventService implements OutboxEventService {

    private final PaymentOutboxEventRepository paymentOutboxEventRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void publishEvent(String eventType, String aggregateType, String aggregateId, Object eventPayload) {
        try {
            String payload = objectMapper.writeValueAsString(eventPayload);

            PaymentOutboxEvent event = PaymentOutboxEvent.createPaymentEvent(eventType, aggregateType, aggregateId, payload);
            paymentOutboxEventRepository.save(event);

            log.debug("Published payment event to outbox: eventType={}, aggregateType={}, aggregateId={}",
                     eventType, aggregateType, aggregateId);

        } catch (JsonProcessingException e) {
            log.error("Error serializing event payload for eventType: {}, aggregateId: {}", eventType, aggregateId, e);
            throw new RuntimeException("Failed to serialize event payload", e);
        } catch (Exception e) {
            log.error("Error publishing payment event to outbox: eventType={}, aggregateId={}", eventType, aggregateId, e);
            throw new RuntimeException("Failed to publish event to outbox", e);
        }
    }

    @Override
    @Transactional
    public void processUnprocessedEvents() {
        List<PaymentOutboxEvent> pending = paymentOutboxEventRepository
            .findByProcessedFalseOrderByPriorityAscCreatedAtAsc();

        log.info("Found {} unprocessed payment outbox events", pending.size());

        pending.forEach(event -> {
            try {
                processEvent(event);
            } catch (Exception ex) {
                log.error("Failed to process payment outbox event {}", event.getEventId(), ex);
            }
        });
    }

    @Override
    @Transactional
    public void processRetryableEvents() {
        List<PaymentOutboxEvent> retryable = paymentOutboxEventRepository
            .findEventsReadyForRetry(LocalDateTime.now());

        log.info("Found {} retryable payment outbox events", retryable.size());

        retryable.forEach(event -> {
            try {
                processEvent(event);
            } catch (Exception ex) {
                log.error("Retry attempt failed for payment outbox event {}", event.getEventId(), ex);
            }
        });
    }

    @Override
    @Transactional
    public void cleanupOldEvents() {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(7);
        try {
            paymentOutboxEventRepository.deleteByProcessedTrueAndCreatedAtBefore(cutoff);
            log.info("Deleted processed payment outbox events older than {}", cutoff);
        } catch (Exception ex) {
            log.error("Failed to cleanup processed payment outbox events", ex);
        }
    }

    @Override
    @Transactional
    public void cleanupExpiredEvents() {
        try {
            paymentOutboxEventRepository.deleteExpiredEventsBefore(ZonedDateTime.now());
            log.info("Deleted expired payment outbox events");
        } catch (Exception ex) {
            log.error("Failed to cleanup expired payment outbox events", ex);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public OutboxStatistics getStatistics() {
        long unprocessed = paymentOutboxEventRepository.countUnprocessedEvents();
        long failed = paymentOutboxEventRepository.countFailedEvents();
        return new OutboxStatistics(unprocessed, failed);
    }

    private void processEvent(PaymentOutboxEvent event) {
        try {
            log.debug("Processing payment outbox event {} of type {}", event.getEventId(), event.getEventType());
            mockEventProcessing(event);
            event.markAsProcessed();
            paymentOutboxEventRepository.save(event);
        } catch (Exception ex) {
            if (ex instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            log.error("Processing failed for payment outbox event {}", event.getEventId(), ex);
            event.markAsFailedAndScheduleRetry(ex.getMessage());
            paymentOutboxEventRepository.save(event);
            throw new OutboxProcessingException("Failed to process payment outbox event " + event.getEventId(), ex);
        }
    }

    private void mockEventProcessing(PaymentOutboxEvent event) throws InterruptedException {
        // TODO: replace with real publishing logic (Kafka, webhook, etc.)
        Thread.sleep(10);
        if (event.getEventType().contains("test_failure")) {
            throw new RuntimeException("Mock failure for test event");
        }
    }

    private static class OutboxProcessingException extends RuntimeException {
        OutboxProcessingException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
