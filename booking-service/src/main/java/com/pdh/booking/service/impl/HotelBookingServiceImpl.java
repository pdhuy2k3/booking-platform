package com.pdh.booking.service.impl;

import com.pdh.booking.config.ServiceUrlConfig;
import com.pdh.booking.model.Booking;
import com.pdh.booking.service.HotelBookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Implementation of HotelBookingService
 * Handles hotel booking operations via REST calls to Hotel Service
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Primary
public class HotelBookingServiceImpl implements HotelBookingService {
    
    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrlConfig;
    
    // Hotel Service endpoints - no /api/v1 prefix needed
    private static final String RESERVE_HOTEL_URL = "/hotels/reserve";
    private static final String CANCEL_RESERVATION_URL = "/hotels/cancel-reservation";
    private static final String CONFIRM_RESERVATION_URL = "/hotels/confirm-reservation";
    
    @Override
    public boolean reserveHotel(Booking booking) {
        log.info("Reserving hotel for booking: {}", booking.getBookingId());
        
        try {
            WebClient webClient = webClientBuilder.build();
            
            // Create hotel reservation request
            HotelReservationRequest request = HotelReservationRequest.builder()
                .bookingId(booking.getBookingId().toString())
                .sagaId(booking.getSagaId())
                .customerId(booking.getUserId().toString())
                .build();
            
            // Call Hotel Service synchronously for saga coordination
            String response = webClient.post()
                .uri(serviceUrlConfig.hotelService() + RESERVE_HOTEL_URL)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block(); // Block for synchronous saga coordination
            
            log.info("Hotel reservation response: {}", response);
            return response != null && !response.contains("error");
                
        } catch (Exception e) {
            log.error("Error sending hotel reservation request for booking: {}", booking.getBookingId(), e);
            return false;
        }
    }
    
    @Override
    public boolean cancelHotelReservation(Booking booking) {
        log.info("Cancelling hotel reservation for booking: {}", booking.getBookingId());
        
        try {
            WebClient webClient = webClientBuilder.build();
            
            HotelCancellationRequest request = HotelCancellationRequest.builder()
                .bookingId(booking.getBookingId().toString())
                .sagaId(booking.getSagaId())
                .reason("Saga compensation")
                .build();
            
            String response = webClient.post()
                .uri(serviceUrlConfig.hotelService() + CANCEL_RESERVATION_URL)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block();
            
            log.info("Hotel cancellation response: {}", response);
            return response != null && !response.contains("error");
                
        } catch (Exception e) {
            log.error("Error sending hotel cancellation request for booking: {}", booking.getBookingId(), e);
            return false;
        }
    }
    
    @Override
    public boolean confirmHotelReservation(Booking booking) {
        log.info("Confirming hotel reservation for booking: {}", booking.getBookingId());
        
        try {
            WebClient webClient = webClientBuilder.build();
            
            HotelConfirmationRequest request = HotelConfirmationRequest.builder()
                .bookingId(booking.getBookingId().toString())
                .sagaId(booking.getSagaId())
                .confirmationNumber(booking.getConfirmationNumber())
                .build();
            
            String response = webClient.post()
                .uri(serviceUrlConfig.hotelService() + CONFIRM_RESERVATION_URL)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block();
            
            log.info("Hotel confirmation response: {}", response);
            return response != null && !response.contains("error");
                
        } catch (Exception e) {
            log.error("Error sending hotel confirmation request for booking: {}", booking.getBookingId(), e);
            return false;
        }
    }
    
    // DTO classes for service communication
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class HotelReservationRequest {
        private String bookingId;
        private String sagaId;
        private String customerId;
    }
    
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class HotelCancellationRequest {
        private String bookingId;
        private String sagaId;
        private String reason;
    }
    
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class HotelConfirmationRequest {
        private String bookingId;
        private String sagaId;
        private String confirmationNumber;
    }
}
