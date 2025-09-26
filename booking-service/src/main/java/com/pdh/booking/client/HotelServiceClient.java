package com.pdh.booking.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.booking.model.dto.request.HotelBookingDetailsDto;
import com.pdh.common.utils.AuthenticationUtils;
import com.pdh.common.validation.ValidationResult;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;

/**
 * REST client for Hotel Service
 * Used to check hotel inventory availability and validate bookings
 */
@Component

@Slf4j
public class HotelServiceClient {
    
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    public HotelServiceClient(RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
    }
    /**
     * Check if hotel inventory is available for booking
     * 
     * @param hotelId The hotel ID to check
     * @param roomTypeId The room type ID to check (optional)
     * @param checkInDate Check-in date
     * @param checkOutDate Check-out date
     * @param numberOfRooms Number of rooms requested
     * @return ValidationResult indicating availability
     */
    @CircuitBreaker(name = "hotel-service", fallbackMethod = "hotelServiceFallback")
    @Retry(name = "hotel-service")
    public ValidationResult checkHotelAvailability(
            String hotelId,
            String roomTypeId,
            LocalDate checkInDate,
            LocalDate checkOutDate,
            Integer numberOfRooms) {
        
        try {
            log.debug("Checking hotel availability for hotel: {}, rooms: {}, check-in: {}, check-out: {}", 
                     hotelId, numberOfRooms, checkInDate, checkOutDate);
            
            // Prepare request parameters for hotel search
            String uri = String.format(
                "http://hotel-service/hotels/storefront/search?hotelId=%s&checkInDate=%s&checkOutDate=%s&rooms=%d",
                hotelId,
                checkInDate.toString(),
                checkOutDate.toString(),
                numberOfRooms != null ? numberOfRooms : 1
            );
            
            // Make REST call to hotel service to check availability
            String response = restClient.get()
                .uri(uri)
                .headers(h -> h.setBearerAuth(AuthenticationUtils.extractJwt()))
                .retrieve()
                .body(String.class);
            
            log.debug("Hotel availability check response: {}", response);
            
            // Parse response to check if hotel is available
            if (response != null && response.contains("\"hotels\"") && !response.contains("\"totalCount\":0")) {
                // If we got hotel search results with hotels, it means hotel is available
                return ValidationResult.valid();
            } else {
                return ValidationResult.invalid("Hotel not available or insufficient rooms");
            }
            
        } catch (Exception e) {
            log.error("Error checking hotel availability for hotel: {}", hotelId, e);
            throw new RuntimeException("Unable to check hotel availability: " + e.getMessage(), e);
        }
    }
    
    /**
     * Validate hotel details structure and check inventory availability
     * Uses the search endpoint since there's no specific validation endpoint
     * 
     * @param hotelDetails Hotel details JSON
     * @return ValidationResult
     */
    @CircuitBreaker(name = "hotel-service", fallbackMethod = "hotelServiceFallback")
    @Retry(name = "hotel-service")
    public ValidationResult validateHotelDetails(JsonNode hotelDetails) {
        try {
            log.debug("Validating hotel details structure using search endpoint");
            
            // First, do structural validation by converting to DTO
            HotelBookingDetailsDto detailsDto = objectMapper.treeToValue(hotelDetails, HotelBookingDetailsDto.class);
            
            // For validation, we'll use a simple search to check if the hotel exists
            String uri = String.format(
                "http://hotel-service/hotels/storefront/search?hotelId=%s&checkInDate=%s&checkOutDate=%s&rooms=%d",
                detailsDto.getHotelId(),
                detailsDto.getCheckInDate() != null ? detailsDto.getCheckInDate().toString() : LocalDate.now().toString(),
                detailsDto.getCheckOutDate() != null ? detailsDto.getCheckOutDate().toString() : LocalDate.now().plusDays(1).toString(),
                detailsDto.getNumberOfRooms() != null ? detailsDto.getNumberOfRooms() : 1
            );
            
            // Make REST call to hotel service to check availability
            String response = restClient.get()
                .uri(uri)
                .headers(h -> h.setBearerAuth(AuthenticationUtils.extractJwt()))
                .retrieve()
                .body(String.class);
            
            log.debug("Hotel details validation response: {}", response);
            
            // Parse response to check if hotel is available
            if (response != null && response.contains("\"hotels\"") && !response.contains("\"totalCount\":0")) {
                // If we got hotel search results, it means hotel is available
                return ValidationResult.valid();
            } else {
                return ValidationResult.invalid("Hotel not available or insufficient rooms");
            }
            
        } catch (Exception e) {
            log.error("Error validating hotel details", e);
            throw new RuntimeException("Unable to validate hotel details: " + e.getMessage(), e);
        }
    }
    
    /**
     * Fallback method for hotel service calls
     */
    public ValidationResult hotelServiceFallback(Exception ex) {
        log.error("Hotel service fallback triggered: {}", ex.getMessage());
        return ValidationResult.serviceUnavailable("Hotel service temporarily unavailable: " + ex.getMessage());
    }
}
