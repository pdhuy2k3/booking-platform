package com.pdh.flight.controller;

import com.pdh.common.dto.ApiResponse;
import com.pdh.flight.dto.request.FlightFareCreateDto;
import com.pdh.flight.dto.request.FlightFareUpdateDto;
import com.pdh.flight.dto.request.FlightFareCalculationRequestDto;
import com.pdh.flight.dto.request.BulkFlightFareRequestDto;
import com.pdh.flight.dto.request.FareClassMultiplierConfigDto;
import com.pdh.flight.dto.request.PricingStrategyConfigDto;
import com.pdh.flight.dto.response.FlightFareDto;
import com.pdh.flight.dto.response.FlightFareCalculationResultDto;
import com.pdh.flight.dto.response.FareClassMultiplierConfigResponseDto;
import com.pdh.flight.dto.response.PricingStrategyConfigResponseDto;
import com.pdh.flight.service.BackofficeFlightFareService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * REST Controller for flight fare management in backoffice
 */
@RestController
@RequestMapping("/backoffice/flight-fares")
@RequiredArgsConstructor
@Slf4j
public class BackofficeFlightFareController {

    private final BackofficeFlightFareService backofficeFlightFareService;

    /**
     * Get all flight fares with pagination and filtering for backoffice
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllFlightFares(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String fareClass,
            @RequestParam(required = false) UUID scheduleId) {

        log.info("Fetching flight fares for backoffice: page={}, size={}, search={}, fareClass={}, scheduleId={}", 
                page, size, search, fareClass, scheduleId);
        
        try {
            Map<String, Object> response = backofficeFlightFareService.getAllFlightFares(page, size, search, fareClass, scheduleId);
            log.info("Found {} flight fares for backoffice", ((List<?>) response.getOrDefault("content", List.of())).size());
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching flight fares for backoffice", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch flight fares", e.getMessage()));
        }
    }

    /**
     * Get flight fare by ID for backoffice
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FlightFareDto>> getFlightFare(@PathVariable UUID id) {
        log.info("Fetching flight fare details for backoffice: ID={}", id);
        
        try {
            FlightFareDto response = backofficeFlightFareService.getFlightFare(id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Flight fare not found for backoffice: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Flight fare not found", e.getMessage()));
        } catch (Exception e) {
            log.error("Error fetching flight fare details for backoffice: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch flight fare details", e.getMessage()));
        }
    }

    /**
     * Create a new flight fare
     */
    @PostMapping
    public ResponseEntity<ApiResponse<FlightFareDto>> createFlightFare(@Valid @RequestBody FlightFareCreateDto flightFareCreateDto) {
        log.info("Creating new flight fare for schedule: {}", flightFareCreateDto.getScheduleId());
        
        try {
            FlightFareDto response = backofficeFlightFareService.createFlightFare(flightFareCreateDto);
            log.info("Flight fare created successfully for schedule: {}", flightFareCreateDto.getScheduleId());
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
        } catch (IllegalArgumentException e) {
            log.error("Invalid flight fare data", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid flight fare data", e.getMessage()));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Referenced entity not found", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Referenced entity not found", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating flight fare", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create flight fare", e.getMessage()));
        }
    }

    /**
     * Update an existing flight fare
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FlightFareDto>> updateFlightFare(@PathVariable UUID id, @Valid @RequestBody FlightFareUpdateDto flightFareUpdateDto) {
        log.info("Updating flight fare: ID={}", id);
        
        try {
            FlightFareDto response = backofficeFlightFareService.updateFlightFare(id, flightFareUpdateDto);
            log.info("Flight fare updated successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Flight fare not found for update: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Flight fare not found", e.getMessage()));
        } catch (IllegalArgumentException e) {
            log.error("Invalid flight fare data for update", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid flight fare data", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating flight fare: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update flight fare", e.getMessage()));
        }
    }

    /**
     * Delete a flight fare (soft delete)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteFlightFare(@PathVariable UUID id) {
        log.info("Deleting flight fare: ID={}", id);
        
        try {
            backofficeFlightFareService.deleteFlightFare(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Flight fare deleted successfully");
            log.info("Flight fare deleted successfully with ID: {}", id);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Flight fare not found for deletion: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Flight fare not found", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting flight fare: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete flight fare", e.getMessage()));
        }
    }

    /**
     * Get flight fares by schedule ID
     */
    @GetMapping("/schedule/{scheduleId}")
    public ResponseEntity<ApiResponse<List<FlightFareDto>>> getFlightFaresBySchedule(@PathVariable UUID scheduleId) {
        log.info("Fetching flight fares for schedule ID: {}", scheduleId);
        
        try {
            List<FlightFareDto> response = backofficeFlightFareService.getFlightFaresByScheduleId(scheduleId);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching flight fares for schedule: {}", scheduleId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch flight fares for schedule", e.getMessage()));
        }
    }

    /**
     * Get flight fare statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFlightFareStatistics() {
        log.info("Fetching flight fare statistics for backoffice");
        
        try {
            Map<String, Object> response = backofficeFlightFareService.getFlightFareStatistics();
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching flight fare statistics", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch flight fare statistics", e.getMessage()));
        }
    }

    /**
     * Calculate suggested flight fares based on pricing algorithm
     */
    @PostMapping("/calculate")
    public ResponseEntity<ApiResponse<List<FlightFareCalculationResultDto>>> calculateFlightFares(
            @Valid @RequestBody FlightFareCalculationRequestDto calculationRequest) {
        log.info("Calculating flight fares for {} schedules, fare class: {}", 
                calculationRequest.getScheduleIds().size(), calculationRequest.getFareClass());
        
        try {
            List<FlightFareCalculationResultDto> response = backofficeFlightFareService.calculateFlightFares(calculationRequest);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error calculating flight fares", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to calculate flight fares", e.getMessage()));
        }
    }

    /**
     * Create flight fares in bulk
     */
    @PostMapping("/bulk")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createFlightFaresBulk(
            @Valid @RequestBody BulkFlightFareRequestDto bulkRequest) {
        log.info("Creating flight fares in bulk for {} schedules, fare class: {}", 
                bulkRequest.getScheduleIds().size(), bulkRequest.getFareClass());
        
        try {
            Map<String, Object> response = backofficeFlightFareService.createFlightFaresBulk(bulkRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error creating flight fares in bulk", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create flight fares in bulk", e.getMessage()));
        }
    }

    /**
     * Update flight fare availability (seats)
     */
    @PutMapping("/{id}/availability")
    public ResponseEntity<ApiResponse<FlightFareDto>> updateFlightFareAvailability(
            @PathVariable UUID id, 
            @RequestParam Integer availableSeats) {
        log.info("Updating flight fare availability: ID={}, seats={}", id, availableSeats);
        
        try {
            FlightFareDto response = backofficeFlightFareService.updateFlightFareAvailability(id, availableSeats);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (jakarta.persistence.EntityNotFoundException e) {
            log.error("Flight fare not found for availability update: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Flight fare not found", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating flight fare availability: ID={}", id, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update flight fare availability", e.getMessage()));
        }
    }

    /**
     * Get all fare class multipliers
     */
    @GetMapping("/multipliers")
    public ResponseEntity<ApiResponse<List<FareClassMultiplierConfigResponseDto>>> getFareClassMultipliers() {
        log.info("Fetching fare class multipliers");
        
        try {
            List<FareClassMultiplierConfigResponseDto> response = backofficeFlightFareService.getFareClassMultipliers();
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching fare class multipliers", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch fare class multipliers", e.getMessage()));
        }
    }

    /**
     * Update fare class multiplier
     */
    @PutMapping("/multipliers")
    public ResponseEntity<ApiResponse<FareClassMultiplierConfigResponseDto>> updateFareClassMultiplier(
            @Valid @RequestBody FareClassMultiplierConfigDto configDto) {
        log.info("Updating fare class multiplier for: {}", configDto.getFareClass());
        
        try {
            FareClassMultiplierConfigResponseDto response = backofficeFlightFareService.updateFareClassMultiplier(configDto);
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error updating fare class multiplier", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update fare class multiplier", e.getMessage()));
        }
    }

    /**
     * Get fare class multiplier by fare class
     */
    @GetMapping("/multipliers/{fareClass}")
    public ResponseEntity<ApiResponse<FareClassMultiplierConfigResponseDto>> getFareClassMultiplier(
            @PathVariable String fareClass) {
        log.info("Fetching fare class multiplier for: {}", fareClass);
        
        try {
            FareClassMultiplierConfigResponseDto response = backofficeFlightFareService.getFareClassMultiplier(fareClass);
            if (response == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Fare class multiplier not found", "No multiplier found for fare class: " + fareClass));
            }
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching fare class multiplier", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch fare class multiplier", e.getMessage()));
        }
    }

    /**
     * Get all pricing strategies
     */
    @GetMapping("/strategies")
    public ResponseEntity<ApiResponse<List<PricingStrategyConfigResponseDto>>> getPricingStrategies() {
        log.info("Fetching all pricing strategies");
        
        try {
            List<PricingStrategyConfigResponseDto> response = backofficeFlightFareService.getPricingStrategies();
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching pricing strategies", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch pricing strategies", e.getMessage()));
        }
    }

    /**
     * Get pricing strategy by ID
     */
    @GetMapping("/strategies/{strategyId}")
    public ResponseEntity<ApiResponse<PricingStrategyConfigResponseDto>> getPricingStrategy(
            @PathVariable Long strategyId) {
        log.info("Fetching pricing strategy: {}", strategyId);
        
        try {
            PricingStrategyConfigResponseDto response = backofficeFlightFareService.getPricingStrategy(strategyId);
            if (response == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Pricing strategy not found", "No strategy found with ID: " + strategyId));
            }
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error fetching pricing strategy", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to fetch pricing strategy", e.getMessage()));
        }
    }

    /**
     * Create or update pricing strategy
     */
    @PostMapping("/strategies")
    public ResponseEntity<ApiResponse<PricingStrategyConfigResponseDto>> savePricingStrategy(
            @Valid @RequestBody PricingStrategyConfigDto strategyDto) {
        log.info("Saving pricing strategy: {}", strategyDto.getStrategyName());
        
        try {
            PricingStrategyConfigResponseDto response = backofficeFlightFareService.savePricingStrategy(strategyDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error saving pricing strategy", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to save pricing strategy", e.getMessage()));
        }
    }

    /**
     * Delete pricing strategy
     */
    @DeleteMapping("/strategies/{strategyId}")
    public ResponseEntity<ApiResponse<Map<String, String>>> deletePricingStrategy(
            @PathVariable Long strategyId) {
        log.info("Deleting pricing strategy: {}", strategyId);
        
        try {
            boolean deleted = backofficeFlightFareService.deletePricingStrategy(strategyId);
            if (deleted) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Pricing strategy deleted successfully");
                return ResponseEntity.ok(ApiResponse.success(response));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Pricing strategy not found", "No strategy found with ID: " + strategyId));
            }
        } catch (Exception e) {
            log.error("Error deleting pricing strategy", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete pricing strategy", e.getMessage()));
        }
    }

    /**
     * Set active pricing strategy
     */
    @PutMapping("/strategies/{strategyId}/activate")
    public ResponseEntity<ApiResponse<PricingStrategyConfigResponseDto>> activatePricingStrategy(
            @PathVariable Long strategyId) {
        log.info("Activating pricing strategy: {}", strategyId);
        
        try {
            PricingStrategyConfigResponseDto response = backofficeFlightFareService.activatePricingStrategy(strategyId);
            if (response == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(ApiResponse.error("Pricing strategy not found", "No strategy found with ID: " + strategyId));
            }
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error activating pricing strategy", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to activate pricing strategy", e.getMessage()));
        }
    }
}
