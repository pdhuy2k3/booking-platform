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
}
