package com.pdh.hotel.controller;

import com.pdh.common.dto.ApiResponse;
import com.pdh.hotel.dto.request.HotelRequestDto;
import com.pdh.hotel.service.BackofficeHotelService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/backoffice/hotels")
@RequiredArgsConstructor
@Slf4j
public class BackofficeHotelController {

    private final BackofficeHotelService backofficeHotelService;


    /**
     * Get all hotels with pagination and filtering for backoffice
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllHotels(
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
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching hotels for backoffice", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch hotels", e.getMessage()));
        }
    }

    /**
     * Get hotel by ID for backoffice
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHotel(@PathVariable Long id) {
        log.info("Fetching hotel details for backoffice: ID={}", id);
        try {
            Map<String, Object> response = backofficeHotelService.getHotel(id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching hotel details for backoffice: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch hotel details", e.getMessage()));
        }
    }

    /**
     * Create a new hotel
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createHotel(@Valid @RequestBody HotelRequestDto hotelRequestDto) {
        log.info("Creating new hotel: {}", hotelRequestDto);
        try {
            Map<String, Object> response = backofficeHotelService.createHotel(hotelRequestDto);
            log.info("Hotel created successfully with response: {}", response);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error creating hotel", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create hotel", e.getMessage()));
        }
    }

    /**
     * Update an existing hotel
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateHotel(@PathVariable Long id, @Valid @RequestBody HotelRequestDto hotelRequestDto) {
        log.info("Updating hotel: ID={}, data={}", id, hotelRequestDto);
        try {
            Map<String, Object> response = backofficeHotelService.updateHotel(id, hotelRequestDto);
            log.info("Hotel updated successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error updating hotel: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update hotel", e.getMessage()));
        }
    }

    /**
     * Delete a hotel (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteHotel(@PathVariable Long id) {
        log.info("Deleting hotel: ID={}", id);
        try {
            backofficeHotelService.deleteHotel(id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Hotel deleted successfully");
            log.info("Hotel deleted successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error deleting hotel: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete hotel", e.getMessage()));
        }
    }

    /**
     * Get all hotel IDs for RAG initialization
     */
    @GetMapping("/ids")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllHotelIds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {

        log.info("Fetching hotel IDs for RAG initialization: page={}, size={}", page, size);
        
        try {
            Map<String, Object> response = backofficeHotelService.getAllHotelIds(page, size);
            log.info("Found {} hotel IDs for RAG initialization", ((List<?>) response.getOrDefault("content", List.of())).size());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching hotel IDs for RAG initialization", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch hotel IDs", e.getMessage()));
        }
    }

    /**
     * Update hotel's amenities
     */
    @PutMapping("/{id}/amenities")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateHotelAmenities(
            @PathVariable("id") Long hotelId,
            @RequestBody Map<String, List<Long>> requestBody
    ) {
        log.info("Updating amenities for hotel: ID={}, body={}", hotelId, requestBody);
        try {
            List<Long> amenityIds = requestBody != null ? requestBody.getOrDefault("amenityIds", List.of()) : List.of();
            Map<String, Object> response = backofficeHotelService.updateHotelAmenities(hotelId, amenityIds);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error updating hotel amenities: ID={}", hotelId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update hotel amenities", e.getMessage()));
        }
    }

    /**
     * Get hotel statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHotelStatistics() {
        log.info("Fetching hotel statistics for backoffice");
        
        try {
            Map<String, Object> response = backofficeHotelService.getHotelStatistics();
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching hotel statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch hotel statistics", e.getMessage()));
        }
    }
}