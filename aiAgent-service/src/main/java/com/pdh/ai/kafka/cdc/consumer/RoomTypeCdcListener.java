package com.pdh.ai.kafka.cdc.consumer;

import com.pdh.ai.client.StorefrontClientService;
import com.pdh.ai.rag.service.RagDataService;
import com.pdh.common.kafka.cdc.BaseCdcConsumer;
import com.pdh.common.kafka.cdc.message.RoomTypeCdcMessage;
import com.pdh.common.kafka.cdc.message.keys.RoomTypeMsgKey;
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
 * Kafka listener for room type CDC events
 * Processes changes to room type information and updates the RAG data
 */
@Slf4j
@Component
public class RoomTypeCdcListener extends BaseCdcConsumer<RoomTypeMsgKey, RoomTypeCdcMessage> {

    @Autowired
    private RagDataService ragDataService;
    
    @Autowired
    private StorefrontClientService storefrontClientService;

    /**
     * Listen to room type CDC events and process them for RAG
     *
     * @param message The CDC message containing room type changes
     * @param key The message key containing the room type ID
     */
    @KafkaListener(
        topics = "booking.hotel-db-server.public.room_types",
        groupId = "bookingsmart-rag-service",
        containerFactory = "roomTypeKafkaListenerContainerFactory"
    )
    public void handleRoomTypeChange(
            @Payload RoomTypeCdcMessage message,
            @Header(KafkaHeaders.RECEIVED_KEY) RoomTypeMsgKey key,
            @Header MessageHeaders headers) {
        processMessage(key, message, headers, this::syncData);
    }
    
    public void syncData(RoomTypeMsgKey key, RoomTypeCdcMessage message) {
        try {
            log.debug("Received room type CDC message: {}", message);
            
            // Extract hotel ID from the message (room types are associated with hotels)
            String hotelIdStr = message.getAfter() != null ? message.getAfter().getHotelId() : 
                               message.getBefore() != null ? message.getBefore().getHotelId() : null;
            
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
                log.warn("Hotel ID not found in room type CDC message");
            }
            
            log.debug("Successfully processed room type CDC message");
        } catch (Exception e) {
            log.error("Error processing room type CDC message: {}", e.getMessage(), e);
            // In a production environment, you might want to send to a dead letter queue
        }
    }
}