package com.pdh.ai.kafka.cdc.consumer;

import com.pdh.ai.client.StorefrontClientService;
import com.pdh.ai.rag.service.RagDataService;
import com.pdh.common.kafka.cdc.message.FlightFareCdcMessage;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Kafka listener for flight fare CDC events
 * Processes changes to flight fares and updates the RAG data
 */
@Slf4j
@Component
public class FlightFareCdcListener {

    @Autowired
    private RagDataService ragDataService;
    
    @Autowired
    private StorefrontClientService storefrontClientService;

    /**
     * Listen to flight fare CDC events and process them for RAG
     *
     * @param message The CDC message containing flight fare changes
     */
    @KafkaListener(
        topics = "booking.flight-db-server.public.flight_fares",
        groupId = "bookingsmart-rag-service",
        containerFactory = "flightFareKafkaListenerContainerFactory"
    )
    public void handleFlightFareChange(FlightFareCdcMessage message) {
        try {
            log.debug("Received flight fare CDC message: {}", message);
            
            // Extract schedule ID from the message
            String scheduleIdStr = message.getAfter() != null ? message.getAfter().getScheduleId() : 
                                 message.getBefore() != null ? message.getBefore().getScheduleId() : null;
            
            if (scheduleIdStr != null) {
                // For now, we'll log that we received a fare change and need the scheduleId
                // In a complete implementation, we would either:
                // 1. Call a service to get flightId from scheduleId, or
                // 2. Modify the approach to handle scheduleId directly
                log.info("Flight fare change detected for scheduleId: {}", scheduleIdStr);
                // TODO: Implement proper scheduleId to flightId mapping
                // For now, we'll skip processing until this is implemented
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