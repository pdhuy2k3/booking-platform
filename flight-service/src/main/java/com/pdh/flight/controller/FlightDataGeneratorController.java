package com.pdh.flight.controller;

import com.pdh.flight.service.FlightDataGeneratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

/**
 * Controller for managing flight data generation for demo purposes
 */
@RestController
@RequestMapping("/api/v1/flight-data-generator")
public class FlightDataGeneratorController {

    @Autowired
    private FlightDataGeneratorService flightDataGeneratorService;

    /**
     * Generate flight schedules and fares for a specific date
     * POST /api/v1/flight-data-generator/generate-daily?targetDate=2025-07-09
     */
    @PostMapping("/generate-daily")
    public ResponseEntity<Map<String, Object>> generateDailyFlightData(
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate targetDate) {
        
        try {
            Integer schedulesCreated = flightDataGeneratorService.generateDailyFlightData(targetDate);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Flight data generated successfully",
                "target_date", targetDate != null ? targetDate.toString() : LocalDate.now().plusDays(1).toString(),
                "schedules_created", schedulesCreated
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "Failed to generate flight data: " + e.getMessage()
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Generate flight data for a range of dates
     * POST /api/v1/flight-data-generator/generate-range?startDate=2025-07-09&endDate=2025-07-15
     */
    @PostMapping("/generate-range")
    public ResponseEntity<Map<String, Object>> generateFlightDataRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        
        try {
            Map<String, Object> result = flightDataGeneratorService.generateFlightDataRange(startDate, endDate);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Flight data range generated successfully",
                "start_date", startDate.toString(),
                "end_date", endDate.toString(),
                "data", result
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "Failed to generate flight data range: " + e.getMessage()
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Generate data for the next N days
     * POST /api/v1/flight-data-generator/generate-next-days?numberOfDays=7
     */
    @PostMapping("/generate-next-days")
    public ResponseEntity<Map<String, Object>> generateDataForNextDays(
            @RequestParam(defaultValue = "7") Integer numberOfDays) {
        
        try {
            Map<String, Object> result = flightDataGeneratorService.generateDataForNextDays(numberOfDays);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Flight data generated for next " + numberOfDays + " days",
                "data", result
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "Failed to generate flight data: " + e.getMessage()
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Clean up old flight data
     * DELETE /api/v1/flight-data-generator/cleanup?daysToKeep=30
     */
    @DeleteMapping("/cleanup")
    public ResponseEntity<Map<String, Object>> cleanupOldFlightData(
            @RequestParam(defaultValue = "30") Integer daysToKeep) {
        
        try {
            Integer deletedSchedules = flightDataGeneratorService.cleanupOldFlightData(daysToKeep);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "message", "Old flight data cleaned up successfully",
                "days_kept", daysToKeep,
                "deleted_schedules", deletedSchedules
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "Failed to cleanup flight data: " + e.getMessage()
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Get flight statistics for a specific date
     * GET /api/v1/flight-data-generator/statistics?targetDate=2025-07-09
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getFlightStatistics(
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate targetDate) {
        
        try {
            Map<String, Object> statistics = flightDataGeneratorService.getFlightStatistics(targetDate);
            
            Map<String, Object> response = Map.of(
                "success", true,
                "target_date", targetDate != null ? targetDate.toString() : LocalDate.now().toString(),
                "statistics", statistics
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "message", "Failed to get flight statistics: " + e.getMessage()
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Health check endpoint
     * GET /api/v1/flight-data-generator/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> response = Map.of(
            "status", "healthy",
            "service", "flight-data-generator",
            "timestamp", System.currentTimeMillis()
        );
        return ResponseEntity.ok(response);
    }
}
