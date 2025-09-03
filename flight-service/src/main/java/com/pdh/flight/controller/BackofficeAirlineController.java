package com.pdh.flight.controller;

import com.pdh.flight.client.MediaServiceClient;
import com.pdh.flight.dto.request.AirlineRequestDto;
import com.pdh.flight.service.BackofficeAirlineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for airline management in backoffice
 */
@RestController
@RequestMapping("/backoffice/airlines")
@RequiredArgsConstructor
@Slf4j
public class BackofficeAirlineController {

    private final BackofficeAirlineService backofficeAirlineService;
    private final MediaServiceClient mediaServiceClient;

    /**
     * Get all airlines with pagination and filtering for backoffice
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllAirlines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {

        log.info("Fetching airlines for backoffice: page={}, size={}, search={}", page, size, search);
        
        try {
            Map<String, Object> response = backofficeAirlineService.getAllAirlines(page, size, search);
            log.info("Found {} airlines for backoffice", ((java.util.List<?>) response.getOrDefault("content", java.util.List.of())).size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching airlines for backoffice", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch airlines");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get airline by ID for backoffice
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getAirline(@PathVariable Long id) {
        log.info("Fetching airline details for backoffice: ID={}", id);
        
        try {
            Map<String, Object> response = backofficeAirlineService.getAirline(id);
            return ResponseEntity.ok(response);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Airline not found for backoffice: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Airline not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (Exception e) {
            log.error("Error fetching airline details for backoffice: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch airline details");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Create a new airline
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createAirline(@Valid @RequestBody AirlineRequestDto airlineRequestDto) {
        log.info("Creating new airline: {}", airlineRequestDto.getName());
        
        try {
            Map<String, Object> response = backofficeAirlineService.createAirline(airlineRequestDto);
            log.info("Airline created successfully: {}", airlineRequestDto.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.error("Invalid airline data", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid airline data");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            log.error("Error creating airline", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create airline");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Update an existing airline
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateAirline(@PathVariable Long id, @Valid @RequestBody AirlineRequestDto airlineRequestDto) {
        log.info("Updating airline: ID={}", id);
        
        try {
            Map<String, Object> response = backofficeAirlineService.updateAirline(id, airlineRequestDto);
            log.info("Airline updated successfully with ID: {}", id);
            return ResponseEntity.ok(response);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Airline not found for update: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Airline not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (IllegalArgumentException e) {
            log.error("Invalid airline data for update", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid airline data");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        } catch (Exception e) {
            log.error("Error updating airline: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update airline");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Delete an airline (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteAirline(@PathVariable Long id) {
        log.info("Deleting airline: ID={}", id);
        
        try {
            backofficeAirlineService.deleteAirline(id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Airline deleted successfully");
            log.info("Airline deleted successfully with ID: {}", id);
            return ResponseEntity.ok(response);
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Airline not found for deletion: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Airline not found");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        } catch (IllegalStateException e) {
            log.error("Cannot delete airline with active flights: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Cannot delete airline");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        } catch (Exception e) {
            log.error("Error deleting airline: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete airline");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get airline statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getAirlineStatistics() {
        log.info("Fetching airline statistics for backoffice");
        
        try {
            Map<String, Object> response = backofficeAirlineService.getAirlineStatistics();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching airline statistics", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch airline statistics");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Upload media for airline
     */
    @PostMapping("/{id}/media/upload")
    public ResponseEntity<Map<String, Object>> uploadAirlineMedia(
            @PathVariable("id") Long airlineId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "isPrimary", required = false) Boolean isPrimary,
            @RequestParam(value = "folder", required = false) String folder
    ) {
        log.info("Uploading media for airline: ID={}", airlineId);
        try {
            // Upload to media service and get URL reference
            String mediaUrl = mediaServiceClient.uploadImage(file, folder != null ? folder : "airlines");
            
            // TODO: Save the mediaUrl to airline's image collection in database
            // Example: airlineService.addAirlineImage(airlineId, mediaUrl, altText, displayOrder, isPrimary);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mediaUrl", mediaUrl);
            response.put("message", "Media uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error uploading airline media: ID={}", airlineId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload airline media");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get media for airline
     */
    @GetMapping("/{id}/media")
    public ResponseEntity<Map<String, Object>> getAirlineMedia(@PathVariable("id") Long airlineId) {
        log.info("Getting media for airline: ID={}", airlineId);
        try {
            // TODO: Get airline images from database
            // Example: List<AirlineImage> images = airlineService.getAirlineImages(airlineId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", List.of()); // Replace with actual airline images
            response.put("airlineId", airlineId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting airline media: ID={}", airlineId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get airline media");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

}
