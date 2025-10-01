package com.pdh.flight.kafka.consumer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.saga.SagaCommand;
import com.pdh.flight.dto.FlightBookingDetailsDto;
import com.pdh.flight.service.FlightService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Handles flight-related saga commands emitted by booking-service.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class FlightEventConsumer {

    private final FlightService flightService;
    private final ObjectMapper objectMapper;

    @KafkaListener(
        topics = "booking-saga-commands",
        groupId = "flight-service-saga-group",
        containerFactory = "sagaCommandListenerContainerFactory"
    )
    public void handleSagaCommand(@Payload String message, Acknowledgment acknowledgment) {
        try {
            SagaCommand command = objectMapper.readValue(message, SagaCommand.class);
            if (command == null || command.getAction() == null) {
                acknowledgment.acknowledge();
                return;
            }

            switch (command.getAction()) {
                case "RESERVE_FLIGHT" -> reserveFlight(command);
                case "CANCEL_FLIGHT_RESERVATION" -> cancelFlight(command);
                default -> {
                    log.debug("Ignoring saga command action {} for booking {}", command.getAction(), command.getBookingId());
                    acknowledgment.acknowledge();
                    return;
                }
            }

            acknowledgment.acknowledge();
        } catch (Exception ex) {
            log.error("Error processing flight saga command: {}", message, ex);
        }
    }

    private void reserveFlight(SagaCommand command) {
        UUID bookingId = command.getBookingId();
        String sagaId = command.getSagaId();
        FlightBookingDetailsDto details = convertFlightDetails(command);

        if (details != null) {
            flightService.reserveFlight(bookingId, sagaId, details);
        } else {
            flightService.reserveFlight(bookingId);
        }
    }

    private void cancelFlight(SagaCommand command) {
        UUID bookingId = command.getBookingId();
        FlightBookingDetailsDto details = convertFlightDetails(command);
        if (details != null) {
            flightService.cancelFlightReservation(bookingId, command.getSagaId(), details);
        } else {
            flightService.cancelFlightReservation(bookingId);
        }
    }

    private FlightBookingDetailsDto convertFlightDetails(SagaCommand command) {
        if (command == null || command.getFlightDetails() == null) {
            return null;
        }
        return objectMapper.convertValue(command.getFlightDetails(), FlightBookingDetailsDto.class);
    }
}
