package com.pdh.ai.kafka.cdc.consumer;

import com.pdh.ai.client.StorefrontClientService;
import com.pdh.ai.rag.service.RagDataService;
import com.pdh.common.kafka.cdc.BaseCdcConsumer;
import com.pdh.common.kafka.cdc.message.FlightCdcMessage;
import com.pdh.common.kafka.cdc.message.keys.FlightMsgKey;
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

/**
 * Kafka listener for Flight CDC messages
 * Processes flight changes and updates the RAG vector store
 */
@Slf4j
@Component
public class FlightCdcListener extends BaseCdcConsumer<FlightMsgKey, FlightCdcMessage> {

    @Autowired
    private RagDataService ragDataService;
    
    @Autowired
    private StorefrontClientService storefrontClientService;

    /**
     * Listen for flight CDC messages and update RAG data
     *
     * @param message   The flight CDC message
     * @param key       The message key containing the flight ID
     * @param headers   The message headers
     */
    @KafkaListener(topics = "flight-db-server.public.flights", groupId = "bookingsmart-rag-service", containerFactory = "flightKafkaListenerContainerFactory")
    public void listenFlightChanges(
            @Payload FlightCdcMessage message,
            @Header(KafkaHeaders.RECEIVED_KEY) FlightMsgKey key,
            @Header MessageHeaders headers) {
        processMessage(key, message, headers, this::syncData);
    }
    
    public void syncData(FlightMsgKey key, FlightCdcMessage message) {
        try {
            // Extract flight ID from the message key
            String flightIdStr = null;
            if (key != null && key.getFlightId() != null) {
                flightIdStr = key.getFlightId().toString();
            } else {
                // Fallback to extracting from message if key is not available
                flightIdStr = message.getAfter() != null ? message.getAfter().getId() : 
                             message.getBefore() != null ? message.getBefore().getId() : null;
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
                log.warn("Flight ID not found in CDC message");
            }
            
            log.debug("Successfully processed flight CDC message: flightId={}", 
                     message.getAfter() != null ? message.getAfter().getId() : message.getBefore().getId());
        } catch (Exception e) {
            log.error("Error processing flight CDC message: error={}", e.getMessage(), e);
        }
    }
}