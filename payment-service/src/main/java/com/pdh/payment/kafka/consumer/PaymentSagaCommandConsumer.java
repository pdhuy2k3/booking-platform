package com.pdh.payment.kafka.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.saga.SagaCommand;
import com.pdh.payment.service.PaymentSagaCommandService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentSagaCommandConsumer {

    private final PaymentSagaCommandService paymentSagaCommandService;
    private final ObjectMapper objectMapper;

    @KafkaListener(
        topics = "payment-saga-commands",
        groupId = "payment-service-saga-group",
        containerFactory = "sagaCommandListenerContainerFactory"
    )
    public void handleSagaCommand(@Payload String payload, Acknowledgment acknowledgment) {
        try {
            SagaCommand command = objectMapper.readValue(payload, SagaCommand.class);
            if (command == null || command.getAction() == null) {
                acknowledgment.acknowledge();
                return;
            }

            switch (command.getAction()) {
                case "PROCESS_PAYMENT" -> paymentSagaCommandService.handleProcessPayment(command);
                case "REFUND_PAYMENT" -> paymentSagaCommandService.handleRefundPayment(command);
                case "CANCEL_PAYMENT" -> paymentSagaCommandService.handleCancelPayment(command);
                default -> log.debug("Ignoring saga action {}", command.getAction());
            }

            acknowledgment.acknowledge();
        } catch (Exception ex) {
            log.error("Error processing payment saga command: {}", payload, ex);
        }
    }
}
