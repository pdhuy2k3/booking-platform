package com.pdh.notification.outbox;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.notification.model.Outbox;
import com.pdh.notification.repository.OutboxRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Outbox Relay
 * Processes outbox messages and publishes them to Kafka/message broker
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxRelay {

    private final OutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;
    
    // Configure max items to process in each batch
    private static final int MAX_BATCH_SIZE = 50;
    
    /**
     * Process outbox messages periodically
     * In a real implementation, this would publish to Kafka/message broker
     */
    @Scheduled(fixedDelayString = "${outbox.relay.interval:5000}")
    @Transactional
    public void processOutboxMessages() {
        try {
            List<Outbox> outboxMessages = outboxRepository.findAll();
            
            if (outboxMessages.isEmpty()) {
                return;
            }
            
            log.info("Processing {} outbox messages", outboxMessages.size());
            
            // Process in batches
            int batchSize = Math.min(MAX_BATCH_SIZE, outboxMessages.size());
            List<Outbox> batch = outboxMessages.subList(0, batchSize);
            
            for (Outbox outboxMessage : batch) {
                try {
                    // In real implementation, this would publish to Kafka/message broker
                    publishEvent(outboxMessage);
                    
                    // After successful processing, delete the outbox message
                    outboxRepository.delete(outboxMessage);
                    
                } catch (Exception e) {
                    log.error("Failed to process outbox message {}: {}", 
                            outboxMessage.getId(), e.getMessage(), e);
                }
            }
            
            log.info("Successfully processed {} outbox messages", batch.size());
            
        } catch (Exception e) {
            log.error("Error in outbox relay processing: {}", e.getMessage(), e);
        }
    }
    
    /**
     * Publish event to message broker (mock implementation)
     */
    private void publishEvent(Outbox outboxMessage) throws JsonProcessingException {
        log.debug("Publishing event: {} - {}", outboxMessage.getEventType(), outboxMessage.getAggregateId());
        
        // In real implementation, this would:
        // 1. Convert outbox message to appropriate event
        // 2. Publish to Kafka/message broker
        
        @SuppressWarnings("unchecked")
        Map<String, Object> eventData = objectMapper.readValue(outboxMessage.getPayload(), HashMap.class);
        
        // Simulate successful publish
        log.info("Event published: {} - {} - {}", 
                outboxMessage.getEventType(), 
                outboxMessage.getAggregateId(),
                eventData);
    }
}
