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
     * Get complete flight details from storefront endpoint
     *
     * @param flightId The flight ID
     * @return Flight details map or null if not found
     */
    public Map<String, Object> getFlightDetails(Long flightId,String token) {
        try {
            String url = String.format("%s/flights/storefront/%d", flightServiceUrl, flightId);
            log.debug("Calling flight service endpoint: {}", url);
            
            ResponseEntity<Map<String, Object>> response = restClient.get()
                .uri(url)
                .headers(h -> h.setBearerAuth(token))
                .retrieve()
                .toEntity(new org.springframework.core.ParameterizedTypeReference<Map<String, Object>>() {});

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                log.debug("Successfully retrieved flight details for ID: {}", flightId);
                return response.getBody();
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