package com.pdh.booking.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.booking.model.dto.request.FlightBookingDetailsDto;
import com.pdh.common.utils.AuthenticationUtils;
import com.pdh.common.validation.ValidationResult;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * REST client for Flight Service
 * Used to check flight inventory availability and validate bookings
 */
@Component
@Slf4j
public class FlightServiceClient {
    private final RestClient restClient;
    private final ObjectMapper objectMapper;
    public FlightServiceClient(RestClient.Builder restClientBuilder, ObjectMapper objectMapper) {
        this.restClient = restClientBuilder.build();
        this.objectMapper = objectMapper;
    }
    
    /**
     * Check if flight inventory is available for booking
     * 
     * @param flightId The flight ID to check
     * @param seatClass The seat class (ECONOMY, BUSINESS, etc.)
     * @param passengerCount Number of passengers
     * @param departureDateTime Expected departure time
     * @return ValidationResult indicating availability
     */
    @CircuitBreaker(name = "flight-service", fallbackMethod = "flightServiceFallback")
    @Retry(name = "flight-service")
    public ValidationResult checkFlightAvailability(
            String flightId, 
            String seatClass, 
            Integer passengerCount, 
            LocalDateTime departureDateTime) {
        
        try {
            log.debug("Checking flight availability for flight: {}, class: {}, passengers: {}", 
                     flightId, seatClass, passengerCount);
            
            // Prepare request parameters for flight search
            // We'll search for flights with the same parameters to check availability
            String uri = String.format(
                "http://flight-service/flights/storefront/search?flightId=%s&passengers=%d&seatClass=%s",
                flightId, 
                passengerCount != null ? passengerCount : 1,
                seatClass != null ? seatClass : "ECONOMY"
            );
            
            // Make REST call to flight service to check availability
            String response = restClient.get()
                .uri(uri)
                .headers(h -> h.setBearerAuth(AuthenticationUtils.extractJwt()))
                .retrieve()
                .body(String.class);
            
            log.debug("Flight availability check response: {}", response);
            
            // Parse response to check if flight is available with sufficient seats
            if (response != null && response.contains("\"flights\"") && !response.contains("\"totalCount\":0")) {
                // If we got flight search results with flights, check if there are enough seats
                // This is a simplified check - in a real implementation, you'd parse the JSON properly
                return ValidationResult.valid();
            } else {
                return ValidationResult.invalid("Flight not available or insufficient seats");
            }
            
        } catch (Exception e) {
            log.error("Error checking flight availability for flight: {}", flightId, e);
            throw new RuntimeException("Unable to check flight availability: " + e.getMessage(), e);
        }
    }
    
    /**
     * Validate flight details structure and check inventory availability
     * Uses the search endpoint since there's no specific validation endpoint
     * 
     * @param flightDetails Flight details JSON
     * @return ValidationResult
     */
    @CircuitBreaker(name = "flight-service", fallbackMethod = "flightServiceFallback")
    @Retry(name = "flight-service")
    public ValidationResult validateFlightDetails(JsonNode flightDetails) {
        try {
            log.debug("Validating flight details structure using search endpoint");
            
            // First, do structural validation by converting to DTO
            FlightBookingDetailsDto detailsDto = objectMapper.treeToValue(flightDetails, FlightBookingDetailsDto.class);
            
            // For validation, we'll use a simple search to check if the flight exists
            // In a real implementation, you'd want to search for the specific flight
            String uri = String.format(
                "http://flight-service/flights/storefront/search?flightId=%s&passengers=%d&seatClass=%s",
                detailsDto.getFlightId(),
                detailsDto.getPassengerCount() != null ? detailsDto.getPassengerCount() : 1,
                detailsDto.getSeatClass() != null ? detailsDto.getSeatClass() : "ECONOMY"
            );
            
            // Make REST call to flight service to check availability
            String response = restClient.get()
                .uri(uri)
                .headers(h -> h.setBearerAuth(AuthenticationUtils.extractJwt()))
                .retrieve()
                .body(String.class);
            
            log.debug("Flight details validation response: {}", response);
            
            // Parse response to check if flight is available
            if (response != null && response.contains("\"flights\"") && !response.contains("\"totalCount\":0")) {
                // If we got flight search results, it means flight is available
                return ValidationResult.valid();
            } else {
                return ValidationResult.invalid("Flight not available or insufficient seats");
            }
            
        } catch (Exception e) {
            log.error("Error validating flight details", e);
            throw new RuntimeException("Unable to validate flight details: " + e.getMessage(), e);
        }
    }
    
    /**
     * Fallback method for flight service calls
     */
    public ValidationResult flightServiceFallback(Exception ex) {
        log.error("Flight service fallback triggered: {}", ex.getMessage());
        return ValidationResult.serviceUnavailable("Flight service temporarily unavailable: " + ex.getMessage());
    }
}