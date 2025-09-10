package com.pdh.hotel.client;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Client for communicating with Media Service
 * Handles all media operations through centralized media service
 */
@Component
@Slf4j
public class MediaServiceClient {

    private static final String MANAGEMENT_BASE_PATH = "/management";
    private final RestClient restClient;
    private final DiscoveryClient discoveryClient;
    private final String MEDIA_SERVICE_URL = "http://media-service";

    public MediaServiceClient(@LoadBalanced RestClient.Builder restClientBuilder, DiscoveryClient discoveryClient) {
        this.discoveryClient = discoveryClient;
        this.restClient = restClientBuilder.build();
    }

    /**
     * Convert public IDs to media IDs
     */
    public List<Long> convertPublicIdsToMediaIds(List<String> publicIds) {
        try {
            log.info("Converting {} public IDs to media IDs", publicIds.size());
            
            Map<String, List<String>> requestBody = Map.of("publicIds", publicIds);
            
            ResponseEntity<JsonNode> response = restClient.post()
                    .uri(MEDIA_SERVICE_URL + MANAGEMENT_BASE_PATH + "/convert-public-ids")
                    .body(requestBody)
                    .retrieve()
                    .toEntity(JsonNode.class);
            
            JsonNode responseBody = response.getBody();
            if (responseBody != null && responseBody.has("data")) {
                JsonNode dataNode = responseBody.get("data");
                if (dataNode.isArray()) {
                    return dataNode.findValuesAsText("asLong").stream()
                            .map(Long::parseLong)
                            .toList();
                }
            }
            
            log.warn("Failed to convert public IDs to media IDs, returning empty list");
            return List.of();
        } catch (Exception e) {
            log.error("Error converting public IDs to media IDs", e);
            return List.of();
        }
    }

    /**
     * Get media details by IDs
     */
    public List<JsonNode> getMediaByIds(List<Long> mediaIds) {
        try {
            log.info("Getting media details for {} media IDs", mediaIds.size());
            
            ResponseEntity<JsonNode> response = restClient.post()
                    .uri(MEDIA_SERVICE_URL + MANAGEMENT_BASE_PATH + "/convert-media-ids")
                    .body(mediaIds)
                    .retrieve()
                    .toEntity(JsonNode.class);
            
            JsonNode responseBody = response.getBody();
            if (responseBody != null && responseBody.has("data")) {
                JsonNode dataNode = responseBody.get("data");
                if (dataNode.isArray()) {
                    return dataNode.findValues("data");
                }
            }
            
            log.warn("Failed to get media details, returning empty list");
            return List.of();
        } catch (Exception e) {
            log.error("Error getting media details by IDs", e);
            return List.of();
        }
    }
}