package com.pdh.ai.rag.cdc.listener;

import com.pdh.ai.client.StorefrontClientService;
import com.pdh.ai.rag.cdc.message.FlightCdcMessage;
import com.pdh.ai.rag.service.RagDataService;
import com.pdh.common.utils.AuthenticationUtils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
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
public class FlightCdcListener {

    @Autowired
    private RagDataService ragDataService;
    
    @Autowired
    private StorefrontClientService storefrontClientService;

    /**
     * Listen for flight CDC messages and update RAG data
     *
     * @param message The flight CDC message
     * @param topic The Kafka topic
     * @param partition The Kafka partition
     * @param offset The message offset
     */
    @KafkaListener(
        topics = "flight-db-server.public.flights",
        groupId = "bookingsmart-rag-service",
        containerFactory = "flightKafkaListenerContainerFactory"
    )
    public void listenFlightChanges(
            @Payload FlightCdcMessage message,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) Integer partition,
            @Header(KafkaHeaders.OFFSET) Long offset) {
        
        try {
            log.debug("Received flight CDC message: topic={}, partition={}, offset={}, operation={}", 
                     topic, partition, offset, message.getOp());
            
            // Extract flight ID from the message
            String flightIdStr = message.getAfter() != null ? message.getAfter().getId() : 
                                message.getBefore() != null ? message.getBefore().getId() : null;
            
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
            log.error("Error processing flight CDC message: topic={}, partition={}, offset={}, error={}", 
                     topic, partition, offset, e.getMessage(), e);
        }
    }
}