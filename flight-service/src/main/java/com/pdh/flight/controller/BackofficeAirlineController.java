package com.pdh.flight.controller;

import com.pdh.common.dto.ApiResponse;
import com.pdh.flight.dto.request.AirlineRequestDto;
import com.pdh.flight.dto.response.AirlineDto;

import com.pdh.flight.service.BackofficeAirlineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * REST Controller for airline management in backoffice
 */
@RestController
@RequestMapping("/backoffice/airlines")
@RequiredArgsConstructor
@Slf4j
public class BackofficeAirlineController {

    private final BackofficeAirlineService backofficeAirlineService;

    /**
     * Get all airlines with pagination and filtering for backoffice
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllAirlines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String country) {

        log.info("Fetching airlines for backoffice: page={}, size={}, search={}, country={}", page, size, search, country);
        
        try {
            Map<String, Object> response = backofficeAirlineService.getAllAirlines(page, size, search, country);
            log.info("Found {} airlines for backoffice", ((List<?>) response.getOrDefault("content", List.of())).size());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching airlines for backoffice", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch airlines", e.getMessage()));
        }
    }

    /**
     * Get airline by ID for backoffice
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AirlineDto>> getAirline(@PathVariable Long id) {
        log.info("Fetching airline details for backoffice: ID={}", id);
        
        try {
            AirlineDto response = backofficeAirlineService.getAirline(id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Airline not found for backoffice: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Airline not found", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching airline details for backoffice: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch airline details", e.getMessage()));
        }
    }

    /**
     * Create a new airline
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AirlineDto>> createAirline(@Valid @RequestBody AirlineRequestDto airlineRequestDto) {
        log.info("Creating new airline: {}", airlineRequestDto.getName());
        
        try {
            AirlineDto response = backofficeAirlineService.createAirline(airlineRequestDto);
            log.info("Airline created successfully: {}", airlineRequestDto.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            log.error("Invalid airline data", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid airline data", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating airline", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create airline", e.getMessage()));
        }
    }

    /**
     * Update an existing airline
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AirlineDto>> updateAirline(@PathVariable Long id, @Valid @RequestBody AirlineRequestDto airlineRequestDto) {
        log.info("Updating airline: ID={}", id);
        
        try {
            AirlineDto response = backofficeAirlineService.updateAirline(id, airlineRequestDto);
            log.info("Airline updated successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Airline not found for update: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Airline not found", e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.error("Invalid airline data for update", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid airline data", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating airline: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update airline", e.getMessage()));
        }
    }

    /**
     * Delete an airline (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteAirline(@PathVariable Long id) {
        log.info("Deleting airline: ID={}", id);
        
        try {
            backofficeAirlineService.deleteAirline(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Airline deleted successfully");
            log.info("Airline deleted successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Airline not found for deletion: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Airline not found", e.getMessage()));
        } catch (IllegalStateException e) {
            log.error("Cannot delete airline with active flights: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Cannot delete airline", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting airline: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete airline", e.getMessage()));
        }
    }

    /**
     * Get airline statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAirlineStatistics() {
        log.info("Fetching airline statistics for backoffice");
        
        try {
            Map<String, Object> response = backofficeAirlineService.getAirlineStatistics();
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching airline statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch airline statistics", e.getMessage()));
        }
    }
}
