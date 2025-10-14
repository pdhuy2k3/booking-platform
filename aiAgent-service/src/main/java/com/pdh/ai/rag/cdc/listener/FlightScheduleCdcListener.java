package com.pdh.ai.rag.cdc.listener;

import com.pdh.ai.client.StorefrontClientService;
import com.pdh.ai.rag.cdc.message.FlightScheduleCdcMessage;
import com.pdh.ai.rag.service.RagDataService;
import com.pdh.common.utils.AuthenticationUtils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Kafka listener for flight schedule CDC events
 * Processes changes to flight schedules and updates the RAG data
 */
@Slf4j
@Component
public class FlightScheduleCdcListener {

    @Autowired
    private RagDataService ragDataService;
    
    @Autowired
    private StorefrontClientService storefrontClientService;

    /**
     * Listen to flight schedule CDC events and process them for RAG
     *
     * @param message The CDC message containing flight schedule changes
     */
    @KafkaListener(
        topics = "booking.flight-db-server.public.flight_schedules",
        groupId = "bookingsmart-rag-service",
        containerFactory = "flightScheduleKafkaListenerContainerFactory"
    )
    public void handleFlightScheduleChange(FlightScheduleCdcMessage message) {
        try {
            log.debug("Received flight schedule CDC message: {}", message);
            
            // Extract flight ID from the message
            String flightIdStr = message.getAfter() != null ? message.getAfter().getFlightId() : 
                               message.getBefore() != null ? message.getBefore().getFlightId() : null;
            
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