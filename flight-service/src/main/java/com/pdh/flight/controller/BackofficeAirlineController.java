package com.pdh.flight.controller;

import com.pdh.flight.dto.request.AirlineRequestDto;
import com.pdh.flight.service.BackofficeAirlineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
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
}
