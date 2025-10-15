package com.pdh.ai.kafka.cdc.consumer;

import com.pdh.ai.client.StorefrontClientService;
import com.pdh.ai.rag.service.RagDataService;
import com.pdh.common.kafka.cdc.BaseCdcConsumer;
import com.pdh.common.kafka.cdc.message.FlightScheduleCdcMessage;
import com.pdh.common.kafka.cdc.message.keys.FlightScheduleMsgKey;
import com.pdh.common.utils.AuthenticationUtils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.function.BiConsumer;

/**
 * Kafka listener for flight schedule CDC events
 * Processes changes to flight schedules and updates the RAG data
 */
@Slf4j
@Component
public class FlightScheduleCdcListener extends BaseCdcConsumer<FlightScheduleMsgKey, FlightScheduleCdcMessage> {

    @Autowired
    private RagDataService ragDataService;
    
    @Autowired
    private StorefrontClientService storefrontClientService;

    /**
     * Listen to flight schedule CDC events and process them for RAG
     *
     * @param message The CDC message containing flight schedule changes
     * @param key The message key containing the schedule ID
     */
    @KafkaListener(
        topics = "booking.flight-db-server.public.flight_schedules",
        groupId = "bookingsmart-rag-service",
        containerFactory = "flightScheduleKafkaListenerContainerFactory"
    )
    public void handleFlightScheduleChange(
            @Payload FlightScheduleCdcMessage message,
            @Header(KafkaHeaders.RECEIVED_KEY) FlightScheduleMsgKey key,
            @Header MessageHeaders headers) {
        processMessage(key, message, headers, this::syncData);
    }
    
    public void syncData(FlightScheduleMsgKey key, FlightScheduleCdcMessage message) {
        try {
            log.debug("Received flight schedule CDC message: {}", message);
            
            // Extract flight ID from the message key
            String flightIdStr = null;
            if (key != null && key.getScheduleId() != null) {
                // We have the schedule ID from the key, but we still need the flight ID
                // Extract flight ID from the message content
                flightIdStr = message.getAfter() != null ? message.getAfter().getFlightId() : 
                           message.getBefore() != null ? message.getBefore().getFlightId() : null;
            } else {
                // Fallback to extracting from message if key is not available
                flightIdStr = message.getAfter() != null ? message.getAfter().getFlightId() : 
                           message.getBefore() != null ? message.getBefore().getFlightId() : null;
            }
            
            if (flightIdStr != null) {
                try {
                    Long flightId = Long.parseLong(flightIdStr);
                    
                    // Fetch complete flight details from storefront endpoint
                    Map<String, Object> flightDetails = storefrontClientService.getFlightDetails(flightId,AuthenticationUtils.extractJwt());
                    
                    if (flightDetails != null) {
                        // Process the complete flight details
                        ragDataService.processFlightDetails(flightDetails);
                        log.debug("Successfully processed flight details for flightId={}", flightId);
                    } else {
                        log.warn("Failed to fetch flight details for flightId={}", flightId);
                    }
                } catch (NumberFormatException e) {
                    log.error("Invalid flight ID format: {}", flightIdStr);
                }
            } else {
                log.warn("Flight ID not found in flight schedule CDC message");
            }
            
            log.debug("Successfully processed flight schedule CDC message");
        } catch (Exception e) {
            log.error("Error processing flight schedule CDC message: {}", e.getMessage(), e);
            // In a production environment, you might want to send to a dead letter queue
        }
    }
}