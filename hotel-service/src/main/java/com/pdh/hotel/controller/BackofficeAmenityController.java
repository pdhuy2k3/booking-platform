package com.pdh.hotel.controller;

import com.pdh.hotel.dto.request.AmenityRequestDto;
import com.pdh.hotel.dto.response.AmenityResponseDto;
import com.pdh.hotel.service.AmenityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for managing amenities in backoffice
 */
@RestController
@RequestMapping("/backoffice/amenities")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class BackofficeAmenityController {
    
    private final AmenityService amenityService;
    
    /**
     * Get all amenities with pagination
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllAmenities(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "displayOrder") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        
        log.info("Fetching amenities: page={}, size={}, search={}", page, size, search);
        
        try {
            Sort.Direction direction = sortDirection.equalsIgnoreCase("DESC") 
                ? Sort.Direction.DESC 
                : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            Page<AmenityResponseDto> amenityPage;
            
            if (search != null && !search.trim().isEmpty()) {
                amenityPage = amenityService.searchAmenities(search, pageable);
            } else {
                amenityPage = amenityService.getAllAmenities(pageable);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("content", amenityPage.getContent());
            response.put("totalElements", amenityPage.getTotalElements());
            response.put("totalPages", amenityPage.getTotalPages());
            response.put("size", amenityPage.getSize());
            response.put("number", amenityPage.getNumber());
            response.put("first", amenityPage.isFirst());
            response.put("last", amenityPage.isLast());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching amenities", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch amenities");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get all active amenities (no pagination)
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveAmenities() {
        log.info("Fetching all active amenities");
        
        try {
            List<AmenityResponseDto> amenities = amenityService.getActiveAmenities();
            
            Map<String, Object> response = new HashMap<>();
            response.put("amenities", amenities);
            response.put("total", amenities.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching active amenities", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch active amenities");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get amenity by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getAmenityById(@PathVariable Long id) {
        log.info("Fetching amenity by ID: {}", id);
        
        try {
            AmenityResponseDto amenity = amenityService.getAmenityById(id);
            return ResponseEntity.ok(amenity);
            
        } catch (Exception e) {
            log.error("Error fetching amenity by ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch amenity");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Create a new amenity
     */
    @PostMapping
    public ResponseEntity<?> createAmenity(@Valid @RequestBody AmenityRequestDto requestDto) {
        log.info("Creating new amenity: {}", requestDto.getName());
        
        try {
            AmenityResponseDto createdAmenity = amenityService.createAmenity(requestDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("amenity", createdAmenity);
            response.put("message", "Amenity created successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("Validation error creating amenity: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error creating amenity", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to create amenity");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Update an existing amenity
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAmenity(
            @PathVariable Long id,
            @Valid @RequestBody AmenityRequestDto requestDto) {
        
        log.info("Updating amenity with ID: {}", id);
        
        try {
            AmenityResponseDto updatedAmenity = amenityService.updateAmenity(id, requestDto);
            
            Map<String, Object> response = new HashMap<>();
            response.put("amenity", updatedAmenity);
            response.put("message", "Amenity updated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.warn("Validation error updating amenity: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Validation error");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error updating amenity with ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update amenity");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Delete an amenity
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAmenity(@PathVariable Long id) {
        log.info("Deleting amenity with ID: {}", id);
        
        try {
            amenityService.deleteAmenity(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Amenity deleted successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error deleting amenity with ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete amenity");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Toggle amenity status (activate/deactivate)
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> toggleAmenityStatus(
            @PathVariable Long id,
            @RequestParam boolean isActive) {
        
        log.info("Toggling amenity status for ID: {} to {}", id, isActive);
        
        try {
            AmenityResponseDto updatedAmenity = amenityService.toggleAmenityStatus(id, isActive);
            
            Map<String, Object> response = new HashMap<>();
            response.put("amenity", updatedAmenity);
            response.put("message", "Amenity status updated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error toggling amenity status for ID: {}", id, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update amenity status");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Update display order for multiple amenities
     */
    @PatchMapping("/reorder")
    public ResponseEntity<?> updateDisplayOrder(@RequestBody Map<String, List<Long>> request) {
        try {
            List<Long> amenityIds = request.get("amenityIds");
            
            if (amenityIds == null || amenityIds.isEmpty()) {
                throw new IllegalArgumentException("Amenity IDs list cannot be empty");
            }
            
            log.info("Updating display order for {} amenities", amenityIds.size());
            
            amenityService.updateDisplayOrder(amenityIds);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Display order updated successfully");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error updating display order", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to update display order");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
    
    /**
     * Get amenities by IDs
     */
    @PostMapping("/by-ids")
    public ResponseEntity<?> getAmenitiesByIds(@RequestBody Map<String, List<Long>> request) {
        try {
            List<Long> ids = request.get("ids");
            
            if (ids == null || ids.isEmpty()) {
                Map<String, Object> response = new HashMap<>();
                response.put("amenities", List.of());
                return ResponseEntity.ok(response);
            }
            
            log.info("Fetching amenities by IDs: {}", ids);
            
            List<AmenityResponseDto> amenities = amenityService.getAmenitiesByIds(ids);
            
            Map<String, Object> response = new HashMap<>();
            response.put("amenities", amenities);
            response.put("total", amenities.size());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching amenities by IDs", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch amenities");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
