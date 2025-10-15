package com.pdh.ai.client;

import lombok.extern.slf4j.Slf4j;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Map;
import java.util.UUID;

import com.pdh.ai.rag.service.RagInitializationService;
import com.pdh.common.utils.AuthenticationUtils;

/**
 * REST client service to call storefront endpoints for complete flight and hotel details
 */
@Slf4j
@Service
public class StorefrontClientService {

    private final RestClient restClient;

    @Value("${app.flight-service.url:http://localhost:8081}")
    private String flightServiceUrl;
    
    @Value("${app.hotel-service.url:http://localhost:8082}")
    private String hotelServiceUrl;
    // @Value("${keycloak.token-url:https://identity-bookingsmart.huypd.dev/realms/BookingSmart/protocol/openid-connect/token}")
    // private String tokenUrl;
    public StorefrontClientService(RestClient restClient) {
        this.restClient = restClient;
    }

    /**
     * Get complete flight details from backoffice endpoint
     *
     * @param flightId The flight ID
     * @return Flight details map or null if not found
     */
    public Map<String, Object> getFlightDetails(Long flightId,String token) {
        try {
            String url = String.format("%s/backoffice/flights/%d", flightServiceUrl, flightId);
            log.debug("Calling flight service backoffice endpoint: {}", url);
            
            ResponseEntity<Map<String, Object>> response = restClient.get()
                .uri(url)
                .headers(h -> h.setBearerAuth(token))
                .retrieve()
                .toEntity(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.debug("Successfully retrieved flight details for ID: {}", flightId);
                // Extract the data from the ApiResponse wrapper
                Map<String, Object> apiResponse = (Map<String, Object>) response.getBody();
                Object data = apiResponse.get("data");
                if (data instanceof Map) {
                    return (Map<String, Object>) data;
                }
                return null;
            } else {
                log.warn("Failed to retrieve flight details for ID: {}, status: {}", flightId, response.getStatusCode());
                return null;
            }
        } catch (RestClientException e) {
            log.error("Error calling flight service for flight ID {}: {}", flightId, e.getMessage(), e);
            return null;
        }
    }

    /**
     * Get flight details by schedule ID from backoffice endpoint
     *
     * @param scheduleId The schedule ID
     * @return Flight details map or null if not found
     */
    public Map<String, Object> getFlightDetailsByScheduleId(UUID scheduleId, String token) {
        try {
            // First get the schedule to extract the flight ID
            String scheduleUrl = String.format("%s/backoffice/schedules/%s", flightServiceUrl, scheduleId.toString());
            log.debug("Calling flight service backoffice endpoint to get schedule: {}", scheduleUrl);
            
            ResponseEntity<Map<String, Object>> scheduleResponse = restClient.get()
                .uri(scheduleUrl)
                .headers(h -> h.setBearerAuth(token))
                .retrieve()
                .toEntity(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});

            if (scheduleResponse.getStatusCode().is2xxSuccessful() && scheduleResponse.getBody() != null) {
                // Extract the data from the ApiResponse wrapper
                Map<String, Object> apiResponse = (Map<String, Object>) scheduleResponse.getBody();
                Object data = apiResponse.get("data");
                if (data instanceof Map) {
                    Map<String, Object> scheduleData = (Map<String, Object>) data;
                    Object flightIdObj = scheduleData.get("flightId");
                    if (flightIdObj != null) {
                        try {
                            Long flightId = Long.parseLong(flightIdObj.toString());
                            // Now get the flight details using the flight ID
                            return getFlightDetails(flightId, token);
                        } catch (NumberFormatException e) {
                            log.error("Invalid flight ID format in schedule data: {}", flightIdObj);
                            return null;
                        }
                    } else {
                        log.warn("Flight ID not found in schedule data for schedule ID: {}", scheduleId);
                        return null;
                    }
                }
            } else {
                log.warn("Failed to retrieve schedule details for ID: {}, status: {}", scheduleId, scheduleResponse.getStatusCode());
                return null;
            }
        } catch (RestClientException e) {
            log.error("Error calling flight service for schedule ID {}: {}", scheduleId, e.getMessage(), e);
            return null;
        }
        return null;
    }

    /**
     * Get complete hotel details from storefront endpoint
     *
     * @param hotelId The hotel ID
     * @return Hotel details map or null if not found
     */
    public Map<String, Object> getHotelDetails(Long hotelId,String token) {
        try {
            String url = String.format("%s/hotels/storefront/%d", hotelServiceUrl, hotelId);
            log.debug("Calling hotel service endpoint: {}", url);
            
            ResponseEntity<Map<String, Object>> response = restClient.get()
                .uri(url)
                .headers(h -> h.setBearerAuth(token))
                .retrieve()
                .toEntity(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.debug("Successfully retrieved hotel details for ID: {}", hotelId);
                return response.getBody();
            } else {
                log.warn("Failed to retrieve hotel details for ID: {}, status: {}", hotelId, response.getStatusCode());
                return null;
            }
        } catch (RestClientException e) {
            log.error("Error calling hotel service for hotel ID {}: {}", hotelId, e.getMessage(), e);
            return null;
        }
    }
}