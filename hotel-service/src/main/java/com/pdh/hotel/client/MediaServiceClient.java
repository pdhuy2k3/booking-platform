package com.pdh.hotel.client;

import com.pdh.common.dto.ApiResponse;
import com.pdh.common.utils.AuthenticationUtils;
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

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Client for communicating with Media Service
 * Handles all media operations through centralized media service
 */
@Component
@Slf4j
public class MediaServiceClient {


    private static final String ENTITY_BASE_PATH = "/media/entity";
    private static final String UPLOAD_BASE_PATH = "/media/upload";
    private final RestClient restClient;
    private final DiscoveryClient discoveryClient;
    private final String MEDIA_SERVICE_URL="http://media-service";
    public MediaServiceClient(@LoadBalanced RestClient.Builder restClientBuilder, DiscoveryClient discoveryClient) {
        this.discoveryClient = discoveryClient;
        this.restClient = restClientBuilder.build();
    }

    /**
     * Get Media Service URI from service discovery
     */


    /**
     * Upload media for an entity
     * @param file The file to upload
     * @param entityType Type of entity (e.g., HOTEL, ROOM, FLIGHT)
     * @param entityId ID of the entity
     * @param mediaType Type of media (e.g., PRIMARY, GALLERY)
     * @param additionalParams Additional parameters (altText, tags, isPrimary, etc.)
     * @return Map containing media metadata including publicId and URLs
     */
    public Map<String, Object> uploadMedia(
            MultipartFile file,
            String entityType,
            Long entityId,
            String mediaType,
            Map<String, Object> additionalParams
    ) {
        try {

            log.info("Uploading media for entity {}/{} to media service", entityType, entityId);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());
            body.add("entityType", entityType);
            body.add("entityId", entityId);
            body.add("mediaType", mediaType != null ? mediaType : "GALLERY");
            
            // Add optional parameters
            if (additionalParams != null) {
                additionalParams.forEach((key, value) -> {
                    if (value != null) {
                        body.add(key, value);
                    }
                });
            }

            ApiResponse<Map<String, Object>> response = restClient
                    .post()
                    .uri(MEDIA_SERVICE_URL + ENTITY_BASE_PATH + "/upload")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .headers(h -> h.setBearerAuth(AuthenticationUtils.extractJwt()))
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<ApiResponse<Map<String, Object>>>() {});

            if (response != null && response.getData() != null) {
                return response.getData();
            }

            throw new RuntimeException("Invalid response from media service");

        } catch (Exception e) {
            log.error("Error uploading media for entity {}/{}: {}", entityType, entityId, e.getMessage());
            throw new RuntimeException("Failed to upload media", e);
        }
    }

    /**
     * Upload multiple media files for an entity
     */
    public List<Map<String, Object>> uploadMultipleMedia(
            List<MultipartFile> files,
            String entityType,
            Long entityId,
            String mediaType,
            String tags
    ) {
        try {
            log.info("Uploading {} media files for entity {}/{}", files.size(), entityType, entityId);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            for (MultipartFile file : files) {
                body.add("files", file.getResource());
            }
            body.add("entityType", entityType);
            body.add("entityId", entityId);
            body.add("mediaType", mediaType != null ? mediaType : "GALLERY");
            if (tags != null) {
                body.add("tags", tags);
            }

            ApiResponse<List<Map<String, Object>>> response = restClient
                    .post()
                    .uri(MEDIA_SERVICE_URL + ENTITY_BASE_PATH + "/upload/multiple")
                    .contentType(MediaType.MULTIPART_FORM_DATA)
                    .headers(h -> h.setBearerAuth(AuthenticationUtils.extractJwt()))
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<ApiResponse<List<Map<String, Object>>>>() {});

            if (response != null && response.getData() != null) {
                return response.getData();
            }

            throw new RuntimeException("Invalid response from media service");

        } catch (Exception e) {
            log.error("Error uploading multiple media for entity {}/{}: {}", entityType, entityId, e.getMessage());
            throw new RuntimeException("Failed to upload media", e);
        }
    }

    /**
     * Get all media for an entity
     */
    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> getMediaByEntity(String entityType, Long entityId) {
        try {
            
            ApiResponse<List<Map<String, Object>>> response = restClient
                    .get()
                    .uri(MEDIA_SERVICE_URL + ENTITY_BASE_PATH + "/{entityType}/{entityId}", entityType, entityId)
                    .headers(h -> h.setBearerAuth(AuthenticationUtils.extractJwt()))
                    .retrieve()
                    .body(new ParameterizedTypeReference<ApiResponse<List<Map<String, Object>>>>() {});

            return response != null ? response.getData() : List.of();

        } catch (Exception e) {
            log.error("Error fetching media for entity {}/{}: {}", entityType, entityId, e.getMessage());
            return List.of();
        }
    }

    /**
     * Get primary media for an entity
     */
    public Map<String, Object> getPrimaryMedia(String entityType, Long entityId) {
        try {
            
            ApiResponse<Map<String, Object>> response = restClient
                    .get()
                    .uri(MEDIA_SERVICE_URL + ENTITY_BASE_PATH + "/{entityType}/{entityId}/primary", entityType, entityId)
                    .headers(h -> h.setBearerAuth(AuthenticationUtils.extractJwt()))
                    .retrieve()
                    .body(new ParameterizedTypeReference<ApiResponse<Map<String, Object>>>() {});

            return response != null ? response.getData() : null;

        } catch (Exception e) {
            log.error("Error fetching primary media for entity {}/{}: {}", entityType, entityId, e.getMessage());
            return null;
        }
    }

    /**
     * Get media for multiple entities
     */
    @SuppressWarnings("unchecked")
    public Map<Long, List<Map<String, Object>>> getMediaForEntities(String entityType, List<Long> entityIds) {
        try {
            ApiResponse<Map<Long, List<Map<String, Object>>>> response = restClient
                    .post()
                    .uri(MEDIA_SERVICE_URL + ENTITY_BASE_PATH + "/{entityType}/batch", entityType)
                    .headers(h -> h.setBearerAuth(AuthenticationUtils.extractJwt()))
                    .body(entityIds)
                    .retrieve()
                    .body(new ParameterizedTypeReference<ApiResponse<Map<Long, List<Map<String, Object>>>>>() {});

            return response != null ? response.getData() : Map.of();

        } catch (Exception e) {
            log.error("Error fetching media for multiple entities: {}", e.getMessage());
            return Map.of();
        }
    }

    /**
     * Get primary media for multiple entities
     */
    public Map<Long, Map<String, Object>> getPrimaryMediaForEntities(String entityType, List<Long> entityIds) {
        try {
            ApiResponse<Map<Long, Map<String, Object>>> response = restClient
                    .post()
                    .uri(MEDIA_SERVICE_URL + ENTITY_BASE_PATH + "/{entityType}/batch/primary", entityType)
                    .headers(h -> h.setBearerAuth(AuthenticationUtils.extractJwt()))
                    .body(entityIds)
                    .retrieve()
                    .body(new ParameterizedTypeReference<ApiResponse<Map<Long, Map<String, Object>>>>() {});

            return response != null ? response.getData() : Map.of();

        } catch (Exception e) {
            log.error("Error fetching primary media for multiple entities: {}", e.getMessage());
            return Map.of();
        }
    }

    /**
     * Set media as primary for its entity
     */
    public Map<String, Object> setPrimaryMedia(Long mediaId) {
        try {

            ApiResponse<Map<String, Object>> response = restClient
                    .put()
                    .uri(MEDIA_SERVICE_URL + ENTITY_BASE_PATH + "/{id}/primary", mediaId)
                    .headers(h -> h.setBearerAuth(AuthenticationUtils.extractJwt()))
                    .retrieve()
                    .body(new ParameterizedTypeReference<ApiResponse<Map<String, Object>>>() {});

            return response != null ? response.getData() : null;

        } catch (Exception e) {
            log.error("Error setting primary media {}: {}", mediaId, e.getMessage());
            throw new RuntimeException("Failed to set primary media", e);
        }
    }

    /**
     * Delete media by ID
     */
    public void deleteMedia(Long mediaId) {
        try {
            restClient
                    .delete()
                    .uri(MEDIA_SERVICE_URL + ENTITY_BASE_PATH + "/{id}", mediaId)
                    .headers(h -> h.setBearerAuth(AuthenticationUtils.extractJwt()))
                    .retrieve()
                    .toBodilessEntity();

            log.info("Media {} deleted successfully", mediaId);

        } catch (Exception e) {
            log.error("Error deleting media {}: {}", mediaId, e.getMessage());
            throw new RuntimeException("Failed to delete media", e);
        }
    }

    /**
     * Delete all media for an entity
     */
    public void deleteMediaByEntity(String entityType, Long entityId) {
        try {

            restClient
                    .delete()
                    .uri(MEDIA_SERVICE_URL + ENTITY_BASE_PATH + "/{entityType}/{entityId}", entityType, entityId)
                    .headers(h -> h.setBearerAuth(AuthenticationUtils.extractJwt()))
                    .retrieve()
                    .toBodilessEntity();

            log.info("All media deleted for entity {}/{}", entityType, entityId);

        } catch (Exception e) {
            log.error("Error deleting media for entity {}/{}: {}", entityType, entityId, e.getMessage());
            throw new RuntimeException("Failed to delete entity media", e);
        }
    }

    /**
     * Check if entity has media
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> checkEntityHasMedia(String entityType, Long entityId) {
        try {
            ApiResponse<Map<String, Object>> response = restClient
                    .get()
                    .uri(MEDIA_SERVICE_URL + ENTITY_BASE_PATH + "/{entityType}/{entityId}/check", entityType, entityId)
                    .headers(h -> h.setBearerAuth(AuthenticationUtils.extractJwt()))
                    .retrieve()
                    .body(new ParameterizedTypeReference<ApiResponse<Map<String, Object>>>() {});

            if (response != null && response.getData() != null) {
                return response.getData();
            }

            Map<String, Object> defaultResult = new HashMap<>();
            defaultResult.put("hasMedia", false);
            defaultResult.put("count", 0L);
            return defaultResult;

        } catch (Exception e) {
            log.error("Error checking media for entity {}/{}: {}", entityType, entityId, e.getMessage());
            Map<String, Object> defaultResult = new HashMap<>();
            defaultResult.put("hasMedia", false);
            defaultResult.put("count", 0L);
            return defaultResult;
        }
    }

    /**
     * Associate existing media (by publicId) with an entity
     * This is used when media is already uploaded but needs to be associated with a newly created entity
     */
    public void associateMediaWithEntity(String entityType, Long entityId, List<String> mediaPublicIds) {
        if (mediaPublicIds == null || mediaPublicIds.isEmpty()) {
            log.debug("No media to associate with entity {}/{}", entityType, entityId);
            return;
        }

        try {
            log.info("Associating {} media items with entity {}/{}", mediaPublicIds.size(), entityType, entityId);

            // Use the new dedicated endpoint for associating media
            ApiResponse<List<Map<String, Object>>> response = restClient
                    .post()
                    .uri(MEDIA_SERVICE_URL + ENTITY_BASE_PATH + "/{entityType}/{entityId}/associate", entityType, entityId)
                    .headers(h -> h.setBearerAuth(AuthenticationUtils.extractJwt()))
                    .body(mediaPublicIds)
                    .retrieve()
                    .body(new ParameterizedTypeReference<ApiResponse<List<Map<String, Object>>>>() {});

            if (response != null && response.getData() != null) {
                log.info("Successfully associated {} media items with entity {}/{}", 
                        response.getData().size(), entityType, entityId);
            } else {
                log.warn("No media were associated with entity {}/{}", entityType, entityId);
            }

        } catch (Exception e) {
            log.error("Error associating media with entity {}/{}: {}", entityType, entityId, e.getMessage());
            throw new RuntimeException("Failed to associate media with entity", e);
        }
    }

    /**
     * Helper method to create upload parameters
     */
    public static class UploadParams {
        private final Map<String, Object> params = new HashMap<>();

        public static UploadParams builder() {
            return new UploadParams();
        }

        public UploadParams altText(String altText) {
            params.put("altText", altText);
            return this;
        }

        public UploadParams displayOrder(Integer displayOrder) {
            params.put("displayOrder", displayOrder);
            return this;
        }

        public UploadParams isPrimary(Boolean isPrimary) {
            params.put("isPrimary", isPrimary);
            return this;
        }

        public UploadParams tags(String tags) {
            params.put("tags", tags);
            return this;
        }

        public UploadParams folder(String folder) {
            params.put("folder", folder);
            return this;
        }

        public Map<String, Object> build() {
            return params;
        }
    }
}