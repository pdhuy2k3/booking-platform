package com.pdh.ai.kafka.cdc.consumer;

import com.pdh.ai.client.StorefrontClientService;
import com.pdh.ai.rag.service.RagDataService;
import com.pdh.common.kafka.cdc.BaseCdcConsumer;
import com.pdh.common.kafka.cdc.message.HotelCdcMessage;
import com.pdh.common.kafka.cdc.message.keys.HotelMsgKey;
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
 * Kafka listener for hotel CDC events
 * Processes changes to hotel information and updates the RAG data
 */
@Slf4j
@Component
public class HotelCdcListener extends BaseCdcConsumer<HotelMsgKey, HotelCdcMessage> {

    @Autowired
    private RagDataService ragDataService;
    
    @Autowired
    private StorefrontClientService storefrontClientService;

    /**
     * Listen to hotel CDC events and process them for RAG
     *
     * @param message The CDC message containing hotel changes
     * @param key The message key containing the hotel ID
     */
    @KafkaListener(
        topics = "booking.hotel-db-server.public.hotels",
        groupId = "bookingsmart-rag-service",
        containerFactory = "hotelKafkaListenerContainerFactory"
    )
    public void handleHotelChange(
            @Payload HotelCdcMessage message,
            @Header(KafkaHeaders.RECEIVED_KEY) HotelMsgKey key,
            @Header MessageHeaders headers) {
        processMessage(key, message, headers, this::syncData);
    }
    
    public void syncData(HotelMsgKey key, HotelCdcMessage message) {
        try {
            log.debug("Received hotel CDC message: {}", message);
            
            // Extract hotel ID from the message key
            String hotelIdStr = null;
            if (key != null && key.getHotelId() != null) {
                hotelIdStr = key.getHotelId().toString();
            } else {
                // Fallback to extracting from message if key is not available
                hotelIdStr = message.getAfter() != null ? message.getAfter().getId() : 
                            message.getBefore() != null ? message.getBefore().getId() : null;
            }
            
            if (hotelIdStr != null) {
                try {
                    Long hotelId = Long.parseLong(hotelIdStr);
                    
                    // Fetch complete hotel details from storefront endpoint
                    Map<String, Object> hotelDetails = storefrontClientService.getHotelDetails(hotelId,AuthenticationUtils.extractJwt());
                    
                    if (hotelDetails != null) {
                        // Process the complete hotel details
                        ragDataService.processHotelDetails(hotelDetails);
                        log.debug("Successfully processed hotel details for hotelId={}", hotelId);
                    } else {
                        log.warn("Failed to fetch hotel details for hotelId={}", hotelId);
                    }
                } catch (NumberFormatException e) {
                    log.error("Invalid hotel ID format: {}", hotelIdStr);
                }
            } else {
                log.warn("Hotel ID not found in CDC message");
            }
            
            log.debug("Successfully processed hotel CDC message");
        } catch (Exception e) {
            log.error("Error processing hotel CDC message: {}", e.getMessage(), e);
            // In a production environment, you might want to send to a dead letter queue
        }
    }
}