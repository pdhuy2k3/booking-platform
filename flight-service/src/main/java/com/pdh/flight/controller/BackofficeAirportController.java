package com.pdh.flight.controller;

import com.pdh.common.dto.ApiResponse;
import com.pdh.flight.dto.request.AirportRequestDto;
import com.pdh.flight.dto.response.AirportDto;
import com.pdh.flight.service.BackofficeAirportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST Controller for airport management in backoffice
 */
@RestController
@RequestMapping("/backoffice/airports")
@RequiredArgsConstructor
@Slf4j
public class BackofficeAirportController {

    private final BackofficeAirportService backofficeAirportService;

    /**
     * Get all airports with pagination and filtering for backoffice
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllAirports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String country) {

        log.info("Fetching airports for backoffice: page={}, size={}, search={}, city={}, country={}", 
                page, size, search, city, country);
        
        try {
            Map<String, Object> response = backofficeAirportService.getAllAirports(page, size, search, city, country);
            log.info("Found {} airports for backoffice", ((List<?>) response.getOrDefault("content", List.of())).size());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching airports for backoffice", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch airports", e.getMessage()));
        }
    }

    /**
     * Get airport by ID for backoffice
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AirportDto>> getAirport(@PathVariable Long id) {
        log.info("Fetching airport details for backoffice: ID={}", id);
        
        try {
            AirportDto response = backofficeAirportService.getAirport(id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Airport not found for backoffice: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Airport not found", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching airport details for backoffice: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch airport details", e.getMessage()));
        }
    }

    /**
     * Create a new airport
     */
    @PostMapping
    public ResponseEntity<ApiResponse<AirportDto>> createAirport(@Valid @RequestBody AirportRequestDto airportRequestDto) {
        log.info("Creating new airport: {}", airportRequestDto.getName());
        
        try {
            AirportDto response = backofficeAirportService.createAirport(airportRequestDto);
            log.info("Airport created successfully: {}", airportRequestDto.getName());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            log.error("Invalid airport data", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid airport data", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating airport", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create airport", e.getMessage()));
        }
    }

    /**
     * Update an existing airport
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AirportDto>> updateAirport(@PathVariable Long id, @Valid @RequestBody AirportRequestDto airportRequestDto) {
        log.info("Updating airport: ID={}", id);
        
        try {
            AirportDto response = backofficeAirportService.updateAirport(id, airportRequestDto);
            log.info("Airport updated successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Airport not found for update: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Airport not found", e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.error("Invalid airport data for update", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid airport data", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating airport: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update airport", e.getMessage()));
        }
    }

    /**
     * Delete an airport (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteAirport(@PathVariable Long id) {
        log.info("Deleting airport: ID={}", id);
        
        try {
            backofficeAirportService.deleteAirport(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Airport deleted successfully");
            log.info("Airport deleted successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Airport not found for deletion: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Airport not found", e.getMessage()));
        } catch (IllegalStateException e) {
            log.error("Cannot delete airport with active flights: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(ApiResponse.error("Cannot delete airport", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting airport: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete airport", e.getMessage()));
        }
    }

    /**
     * Search airports for autocomplete functionality
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> searchAirports(@RequestParam String query) {
        log.info("Searching airports for autocomplete: query={}", query);
        
        try {
            List<Map<String, Object>> response = backofficeAirportService.searchAirports(query);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error searching airports", e);
            return ResponseEntity.ok(ApiResponse.success(List.of()));
        }
    }

    /**
     * Get airport statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAirportStatistics() {
        log.info("Fetching airport statistics for backoffice");
        
        try {
            Map<String, Object> response = backofficeAirportService.getAirportStatistics();
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching airport statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch airport statistics", e.getMessage()));
        }
    }
}
