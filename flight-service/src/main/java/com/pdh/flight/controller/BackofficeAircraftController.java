package com.pdh.flight.controller;

import com.pdh.common.dto.ApiResponse;
import com.pdh.flight.dto.request.AircraftRequestDto;
import com.pdh.flight.dto.response.AircraftDto;
import com.pdh.flight.service.BackofficeAircraftService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * REST Controller for aircraft management in backoffice
 */
@RestController
@RequestMapping("/backoffice/aircraft")
@RequiredArgsConstructor
@Slf4j
public class BackofficeAircraftController {

    private final BackofficeAircraftService backofficeAircraftService;

    /**
     * Get all aircraft with pagination and filtering for backoffice
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllAircraft(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search) {

        log.info("Fetching aircraft for backoffice: page={}, size={}, search={}", page, size, search);
        
        try {
            Map<String, Object> response = backofficeAircraftService.getAllAircraft(page, size, search);
            log.info("Found {} aircraft for backoffice", ((List<?>) response.getOrDefault("content", List.of())).size());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching aircraft for backoffice", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch aircraft", e.getMessage()));
        }
    }

    /**
     * Get aircraft by ID for backoffice
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AircraftDto>> getAircraft(@PathVariable Long id) {
        log.info("Fetching aircraft details for backoffice: ID={}", id);
        
        try {
            AircraftDto response = backofficeAircraftService.getAircraft(id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Aircraft not found for backoffice: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Aircraft not found", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching aircraft details for backoffice: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch aircraft details", e.getMessage()));
        }
    }

    /**
     * Create a new aircraft
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AircraftDto>> createAircraft(@Valid @RequestBody AircraftRequestDto aircraftRequestDto) {
        log.info("Creating new aircraft: {}", aircraftRequestDto.getModel());
        
        try {
            AircraftDto response = backofficeAircraftService.createAircraft(aircraftRequestDto);
            log.info("Aircraft created successfully: {}", aircraftRequestDto.getModel());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            log.error("Invalid aircraft data", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid aircraft data", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating aircraft", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create aircraft", e.getMessage()));
        }
    }

    /**
     * Update an existing aircraft
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AircraftDto>> updateAircraft(@PathVariable Long id, @Valid @RequestBody AircraftRequestDto aircraftRequestDto) {
        log.info("Updating aircraft: ID={}", id);
        
        try {
            AircraftDto response = backofficeAircraftService.updateAircraft(id, aircraftRequestDto);
            log.info("Aircraft updated successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Aircraft not found for update: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Aircraft not found", e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.error("Invalid aircraft data for update", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid aircraft data", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating aircraft: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update aircraft", e.getMessage()));
        }
    }

    /**
     * Delete an aircraft (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteAircraft(@PathVariable Long id) {
        log.info("Deleting aircraft: ID={}", id);
        
        try {
            backofficeAircraftService.deleteAircraft(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Aircraft deleted successfully");
            log.info("Aircraft deleted successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Aircraft not found for deletion: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Aircraft not found", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting aircraft: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete aircraft", e.getMessage()));
        }
    }

    /**
     * Search aircraft for autocomplete functionality
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> searchAircraft(@RequestParam String query) {
        log.info("Searching aircraft for autocomplete: query={}", query);
        
        try {
            List<Map<String, Object>> response = backofficeAircraftService.searchAircraft(query);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error searching aircraft", e);
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
    }

    /**
     * Get aircraft statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAircraftStatistics() {
        log.info("Fetching aircraft statistics for backoffice");
        
        try {
            Map<String, Object> response = backofficeAircraftService.getAircraftStatistics();
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching aircraft statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch aircraft statistics", e.getMessage()));
        }
    }
}