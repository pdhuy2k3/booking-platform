package com.pdh.payment.kafka.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.saga.SagaCommand;
import com.pdh.payment.service.PaymentSagaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

/**
 * Kafka Consumer for Saga Commands
 * Handles PaymentCommand events from booking service saga orchestrator
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SagaCommandConsumer {

    private final PaymentSagaService paymentSagaService;
    private final ObjectMapper objectMapper;

    /**
     * Listen to saga commands from booking service
     * Topic: payment-saga-commands
     */
    @KafkaListener(
        topics = "payment-saga-commands"
    )
    public void handleSagaCommand(
            @Payload String commandPayload,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        
        log.info("Received saga command from topic: {}, partition: {}, offset: {}", 
                topic, partition, offset);

        try {
            // Deserialize the command
            SagaCommand command = objectMapper.readValue(commandPayload, SagaCommand.class);
            
            log.info("Processing saga command: sagaId={}, action={}, bookingId={}", 
                    command.getSagaId(), command.getAction(), command.getBookingId());

            // Process the command based on action
            processSagaCommand(command);

        } catch (Exception e) {
            log.error("Error processing saga command from topic: {}, payload: {}", 
                    topic, commandPayload, e);
            // Don't rethrow - let Kafka handle retry logic
        }
    }

    /**
     * Process saga command based on action type
     */
    private void processSagaCommand(SagaCommand command) {
        try {
            switch (command.getAction()) {
                case "PROCESS_PAYMENT" -> {
                    log.info("Processing payment for saga: {}", command.getSagaId());
                    paymentSagaService.processPayment(command);
                }
                case "REFUND_PAYMENT" -> {
                    log.info("Processing payment refund for saga: {}", command.getSagaId());
                    paymentSagaService.refundPayment(command);
                }
                case "CANCEL_PAYMENT" -> {
                    log.info("Processing payment cancellation for saga: {}", command.getSagaId());
                    paymentSagaService.cancelPayment(command);
                }
                case "CONFIRM_PAYMENT" -> {
                    log.info("Confirming payment for saga: {}", command.getSagaId());
                    paymentSagaService.confirmPayment(command);
                }
                default -> {
                    log.warn("Unknown saga command action: {} for saga: {}", 
                            command.getAction(), command.getSagaId());
                }
            }
        } catch (Exception e) {
            log.error("Error processing saga command: action={}, sagaId={}", 
                    command.getAction(), command.getSagaId(), e);
            
            // Handle command processing failure
            paymentSagaService.handleCommandFailure(command, e);
        }
    }
}
