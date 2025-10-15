package com.pdh.ai.kafka.cdc.consumer;

import com.pdh.ai.client.StorefrontClientService;
import com.pdh.ai.rag.service.RagDataService;
import com.pdh.common.kafka.cdc.BaseCdcConsumer;
import com.pdh.common.kafka.cdc.message.FlightFareCdcMessage;
import com.pdh.common.kafka.cdc.message.keys.FlightFareMsgKey;
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
import java.util.UUID;

/**
 * Kafka listener for flight fare CDC events
 * Processes changes to flight fares and updates the RAG data
 */
@Slf4j
@Component
public class FlightFareCdcListener extends BaseCdcConsumer<FlightFareMsgKey, FlightFareCdcMessage> {

    @Autowired
    private RagDataService ragDataService;
    
    @Autowired
    private StorefrontClientService storefrontClientService;

    /**
     * Listen to flight fare CDC events and process them for RAG
     *
     * @param message The CDC message containing flight fare changes
     * @param key The message key containing the fare ID
     */
    @KafkaListener(
        topics = "booking.flight-db-server.public.flight_fares",
        groupId = "bookingsmart-rag-service",
        containerFactory = "flightFareKafkaListenerContainerFactory"
    )
    public void handleFlightFareChange(
            @Payload FlightFareCdcMessage message,
            @Header(KafkaHeaders.RECEIVED_KEY) FlightFareMsgKey key,
            @Header MessageHeaders headers) {
        processMessage(key, message, headers, this::syncData);
    }
    
    public void syncData(FlightFareMsgKey key, FlightFareCdcMessage message) {
        try {
            log.debug("Received flight fare CDC message: {}", message);
            
            // Extract schedule ID from the message
            String scheduleIdStr = message.getAfter() != null ? message.getAfter().getScheduleId() : 
                                 message.getBefore() != null ? message.getBefore().getScheduleId() : null;
            
            if (scheduleIdStr != null) {
                try {
                    UUID scheduleId = UUID.fromString(scheduleIdStr);
                    
                    // Fetch complete flight details from storefront endpoint using schedule ID
                    Map<String, Object> flightDetails = storefrontClientService.getFlightDetailsByScheduleId(scheduleId, AuthenticationUtils.extractJwt());
                    
                    if (flightDetails != null) {
                        // Process the complete flight details with fare change information
                        ragDataService.processFlightFareChange(flightDetails, scheduleIdStr);
                        log.debug("Successfully processed flight fare change for scheduleId={}", scheduleId);
                    } else {
                        log.warn("Failed to fetch flight details for scheduleId={}", scheduleId);
                    }
                } catch (IllegalArgumentException e) {
                    log.error("Invalid schedule ID format: {}", scheduleIdStr);
                }
            } else {
                log.warn("Schedule ID not found in flight fare CDC message");
            }
            
            log.debug("Successfully processed flight fare CDC message");
        } catch (Exception e) {
            log.error("Error processing flight fare CDC message: {}", e.getMessage(), e);
            // In a production environment, you might want to send to a dead letter queue
        }
    }
}