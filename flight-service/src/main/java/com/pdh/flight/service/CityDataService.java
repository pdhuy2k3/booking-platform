package com.pdh.flight.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;

/**
 * Service to fetch city and province data from external API (tinhthanhpho.com)
 */
@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings("unchecked")
public class CityDataService {

    private final RestClient.Builder restClientBuilder;

    private static final String API_BASE_URL = "https://tinhthanhpho.com/api/v1";

    /**
     * Fetch all provinces and cities from the external API
     */
    public List<Map<String, Object>> getAllProvincesAndCities() {
        return fetchProvincesAndCities(null);
    }

    /**
     * Search provinces and cities by keyword
     */
    public List<Map<String, Object>> searchProvincesAndCities(String keyword) {
        return fetchProvincesAndCities(keyword);
    }

    /**
     * Helper method to fetch provinces and cities with optional keyword search
     */
    private List<Map<String, Object>> fetchProvincesAndCities(String keyword) {
        try {
            RestClient restClient = restClientBuilder.build();
            
            // Build URI with optional keyword parameter
            String uri = API_BASE_URL + "/new-provinces";
            if (keyword != null && !keyword.trim().isEmpty()) {
                uri += "?keyword=" + keyword;
            }
            
            // Use the new structure (after 1/7/2025) to get provinces and cities
            Map<String, Object> response = restClient
                    .get()
                    .uri(uri)
                    .retrieve()
                    .body(Map.class);
            
            if (response != null && response.containsKey("data")) {
                Object data = response.get("data");
                if (data instanceof List) {
                    return (List<Map<String, Object>>) data;
                }
            }
            
            return List.of();
        } catch (RestClientResponseException e) {
            log.error("Error fetching provinces and cities from external API: {}", e.getMessage());
            return List.of();
        } catch (Exception e) {
            log.error("Unexpected error fetching provinces and cities: {}", e.getMessage());
            return List.of();
        }
    }
}