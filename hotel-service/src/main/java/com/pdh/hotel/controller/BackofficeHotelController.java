package com.pdh.hotel.controller;

import com.pdh.hotel.client.MediaServiceClient;
import com.pdh.hotel.service.BackofficeHotelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/backoffice/hotels")
@RequiredArgsConstructor
@Slf4j
public class BackofficeHotelController {

    private final BackofficeHotelService backofficeHotelService;
    private final MediaServiceClient mediaServiceClient;

    /**
     * Get all hotels with pagination and filtering for backoffice
     */
    @GetMapping
    @Tool(description = "Search hotels by destination, dates, guests, and rooms with pagination support")

    public ResponseEntity<Map<String, Object>> getAllHotels(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String status) {

        log.info("Fetching hotels for backoffice: page={}, size={}, search={}, city={}, status={}",
                page, size, search, city, status);
        try {
            Map<String, Object> response = backofficeHotelService.getAllHotels(page, size, search, city, status);
            log.info("Found {} hotels for backoffice", ((List<?>) response.getOrDefault("content", List.of())).size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching hotels for backoffice", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch hotels");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get hotel by ID for backoffice
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getHotel(@PathVariable Long id) {
        log.info("Fetching hotel details for backoffice: ID={}", id);
        try {
            Map<String, Object> response = backofficeHotelService.getHotel(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching hotel details for backoffice: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch hotel details");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Create a new hotel
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createHotel(@RequestBody Map<String, Object> hotelData) {
        log.info("Creating new hotel: {}", hotelData);
        try {
            Map<String, Object> response = backofficeHotelService.createHotel(hotelData);
            log.info("Hotel created successfully with response: {}", response);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            log.error("Error creating hotel", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create hotel");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Update an existing hotel
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateHotel(@PathVariable Long id, @RequestBody Map<String, Object> hotelData) {
        log.info("Updating hotel: ID={}, data={}", id, hotelData);
        try {
            Map<String, Object> response = backofficeHotelService.updateHotel(id, hotelData);
            log.info("Hotel updated successfully with ID: {}", id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating hotel: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update hotel");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Delete a hotel (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteHotel(@PathVariable Long id) {
        log.info("Deleting hotel: ID={}", id);
        try {
            backofficeHotelService.deleteHotel(id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Hotel deleted successfully");
            log.info("Hotel deleted successfully with ID: {}", id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error deleting hotel: ID={}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete hotel");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Update hotel's amenities
     */
    @PutMapping("/{id}/amenities")
    public ResponseEntity<Map<String, Object>> updateHotelAmenities(
            @PathVariable("id") Long hotelId,
            @RequestBody Map<String, List<Long>> requestBody
    ) {
        log.info("Updating amenities for hotel: ID={}, body={}", hotelId, requestBody);
        try {
            List<Long> amenityIds = requestBody != null ? requestBody.getOrDefault("amenityIds", List.of()) : List.of();
            Map<String, Object> response = backofficeHotelService.updateHotelAmenities(hotelId, amenityIds);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating hotel amenities: ID={}", hotelId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update hotel amenities");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Upload media for hotel
     */
    @PostMapping("/{id}/media/upload")
    public ResponseEntity<Map<String, Object>> uploadHotelMedia(
            @PathVariable("id") Long hotelId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            @RequestParam(value = "isPrimary", required = false) Boolean isPrimary,
            @RequestParam(value = "folder", required = false) String folder
    ) {
        log.info("Uploading media for hotel: ID={}", hotelId);
        try {
            // Upload to media service and get URL reference
            String mediaUrl = mediaServiceClient.uploadImage(file, folder != null ? folder : "hotels");
            
            // TODO: Save the mediaUrl to hotel's image collection in database
            // Example: hotelService.addHotelImage(hotelId, mediaUrl, altText, displayOrder, isPrimary);
            
            Map<String, Object> response = new HashMap<>();
            response.put("mediaUrl", mediaUrl);
            response.put("message", "Media uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error uploading hotel media: ID={}", hotelId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload hotel media");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get media for hotel
     */
    @GetMapping("/{id}/media")
    public ResponseEntity<Map<String, Object>> getHotelMedia(@PathVariable("id") Long hotelId) {
        log.info("Getting media for hotel: ID={}", hotelId);
        try {
            // TODO: Get hotel images from database
            // Example: List<HotelImage> images = hotelService.getHotelImages(hotelId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", List.of()); // Replace with actual hotel images
            response.put("hotelId", hotelId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting hotel media: ID={}", hotelId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get hotel media");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}