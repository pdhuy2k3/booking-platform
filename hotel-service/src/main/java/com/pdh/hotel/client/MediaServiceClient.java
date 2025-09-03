package com.pdh.hotel.client;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Client for communicating with Media Service
 * Uploads files and returns media URLs that can be stored in entity imageUrl fields
 */
@Component
@Slf4j
public class MediaServiceClient {


    private final RestClient restClient;
    private final DiscoveryClient discoveryClient;
    private String mediaServiceUri;

    MediaServiceClient(@LoadBalanced RestClient.Builder restClientBuilder, DiscoveryClient discoveryClient) {
        this.discoveryClient = discoveryClient;
        this.restClient = restClientBuilder.build();
    }

    private String getMediaServiceUri() {
        if (mediaServiceUri == null) {
            List<ServiceInstance> instances = discoveryClient.getInstances("media-service");
            if (instances != null && !instances.isEmpty()) {
                mediaServiceUri = instances.get(0).getUri().toString();
            } else {
                log.warn("Media service not found in discovery, using default URL");
                mediaServiceUri = "http://localhost:8089/media"; // fallback URL
            }
        }
        return mediaServiceUri;
    }

    /**
     * Upload image to media service and return URL reference
     * The returned URL will be in format "/api/media/{id}" which can be stored in entity imageUrl fields
     */
    public String uploadImage(MultipartFile file, String folder) {
        try {
            log.info("Uploading image to media service, folder: {}", folder);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());
            if (folder != null) {
                body.add("folder", folder);
            }

            Map<String, Object> response = restClient
                    .post()
                    .uri(getMediaServiceUri() + "/upload/image")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});
            
            // Extract the media ID or public ID from response and return as URL reference
            if (response != null && response.containsKey("publicId")) {
                String publicId = (String) response.get("publicId");
                // Return URL that will be routed through BFF gateway to media service
                return "/api/media/" + publicId;
            }
            
            throw new RuntimeException("Invalid response from media service");
                    
        } catch (Exception e) {
            log.error("Error uploading image to media service", e);
            throw new RuntimeException("Failed to upload image", e);
        }
    }

    /**
     * Delete image from media service by public ID
     */
    public void deleteImage(String publicId) {
        try {
            log.info("Deleting image from media service: {}", publicId);
            
           restClient
                    .delete()
                    .uri(getMediaServiceUri() + "/upload/image/{publicId}", publicId)
                    .retrieve()
                    .toBodilessEntity();
                    
        } catch (Exception e) {
            log.error("Error deleting image from media service: {}", publicId, e);
            throw new RuntimeException("Failed to delete image", e);
        }
    }
    
    /**
     * Extract public ID from media URL for deletion
     * URL format: "/api/media/{publicId}"
     */
    public String extractPublicIdFromUrl(String mediaUrl) {
        if (mediaUrl != null && mediaUrl.startsWith("/api/media/")) {
            return mediaUrl.substring("/api/media/".length());
        }
        return mediaUrl; // Return as-is if not in expected format
    }
}