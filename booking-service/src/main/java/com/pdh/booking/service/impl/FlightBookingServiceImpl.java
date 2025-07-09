package com.pdh.booking.service.impl;

import com.pdh.booking.config.ServiceUrlConfig;
import com.pdh.booking.model.Booking;
import com.pdh.booking.service.FlightBookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Implementation of FlightBookingService
 * Handles flight booking operations via REST calls to Flight Service
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Primary
public class FlightBookingServiceImpl implements FlightBookingService {
    
    private final WebClient.Builder webClientBuilder;
    private final ServiceUrlConfig serviceUrlConfig;
    
    // Flight Service endpoints - no /api/v1 prefix needed
    private static final String RESERVE_FLIGHT_URL = "/flights/reserve";
    private static final String CANCEL_RESERVATION_URL = "/flights/cancel-reservation";
    private static final String CONFIRM_RESERVATION_URL = "/flights/confirm-reservation";
    
    @Override
    public boolean reserveFlight(Booking booking) {
        log.info("Reserving flight for booking: {}", booking.getBookingId());
        
        try {
            WebClient webClient = webClientBuilder.build();
            
            // Create flight reservation request
            FlightReservationRequest request = FlightReservationRequest.builder()
                .bookingId(booking.getBookingId().toString())
                .sagaId(booking.getSagaId())
                .customerId(booking.getUserId().toString())
                .build();
            
            // Call Flight Service synchronously for saga coordination
            String response = webClient.post()
                .uri(serviceUrlConfig.flightService() + RESERVE_FLIGHT_URL)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block(); // Block for synchronous saga coordination
            
            log.info("Flight reservation response: {}", response);
            return response != null && !response.contains("error");
                
        } catch (Exception e) {
            log.error("Error sending flight reservation request for booking: {}", booking.getBookingId(), e);
            return false;
        }
    }
    
    @Override
    public boolean cancelFlightReservation(Booking booking) {
        log.info("Cancelling flight reservation for booking: {}", booking.getBookingId());
        
        try {
            WebClient webClient = webClientBuilder.build();
            
            FlightCancellationRequest request = FlightCancellationRequest.builder()
                .bookingId(booking.getBookingId().toString())
                .sagaId(booking.getSagaId())
                .reason("Saga compensation")
                .build();
            
            String response = webClient.post()
                .uri(serviceUrlConfig.flightService() + CANCEL_RESERVATION_URL)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block();
            
            log.info("Flight cancellation response: {}", response);
            return response != null && !response.contains("error");
                
        } catch (Exception e) {
            log.error("Error sending flight cancellation request for booking: {}", booking.getBookingId(), e);
            return false;
        }
    }
    
    @Override
    public boolean confirmFlightReservation(Booking booking) {
        log.info("Confirming flight reservation for booking: {}", booking.getBookingId());
        
        try {
            WebClient webClient = webClientBuilder.build();
            
            FlightConfirmationRequest request = FlightConfirmationRequest.builder()
                .bookingId(booking.getBookingId().toString())
                .sagaId(booking.getSagaId())
                .confirmationNumber(booking.getConfirmationNumber())
                .build();
            
            String response = webClient.post()
                .uri(serviceUrlConfig.flightService() + CONFIRM_RESERVATION_URL)
                .bodyValue(request)
                .retrieve()
                .bodyToMono(String.class)
                .block();
            
            log.info("Flight confirmation response: {}", response);
            return response != null && !response.contains("error");
                
        } catch (Exception e) {
            log.error("Error sending flight confirmation request for booking: {}", booking.getBookingId(), e);
            return false;
        }
    }
    
    // DTO classes for service communication
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class FlightReservationRequest {
        private String bookingId;
        private String sagaId;
        private String customerId;
    }
    
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class FlightCancellationRequest {
        private String bookingId;
        private String sagaId;
        private String reason;
    }
    
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    private static class FlightConfirmationRequest {
        private String bookingId;
        private String sagaId;
        private String confirmationNumber;
    }
}
