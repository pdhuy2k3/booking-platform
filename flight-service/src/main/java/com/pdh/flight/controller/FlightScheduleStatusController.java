package com.pdh.flight.controller;

import com.pdh.flight.model.enums.ScheduleStatus;
import com.pdh.flight.service.FlightScheduleStatusService;
import com.pdh.flight.service.FlightScheduleStatusService.FlightScheduleStatusStats;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.ZonedDateTime;
import java.util.Map;

/**
 * Controller for managing flight schedule status updates and monitoring
 * Provides endpoints for manual status updates and statistics
 */
@RestController
@RequestMapping("/backoffice/flight-schedules/status")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Flight Schedule Status Management", description = "APIs for managing flight schedule status updates")
@SecurityRequirement(name = "oauth2")
public class FlightScheduleStatusController {
    
    private final FlightScheduleStatusService statusService;
    
    /**
     * Get flight schedule status statistics
     * GET /backoffice/flight-schedules/status/statistics
     */
    @Operation(
        summary = "Get flight schedule status statistics",
        description = "Retrieve comprehensive statistics about flight schedule statuses"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status statistics retrieved successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<FlightScheduleStatusStats> getStatusStatistics() {
        log.info("Getting flight schedule status statistics");
        
        try {
            FlightScheduleStatusStats stats = statusService.getStatusStatistics();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error retrieving status statistics: {}", e.getMessage(), e);
            throw e;
        }
    }
    
    /**
     * Manually trigger status update for completed schedules
     * POST /backoffice/flight-schedules/status/update-completed
     */
    @Operation(
        summary = "Manually update completed schedules",
        description = "Manually trigger the update of flight schedules to COMPLETED status"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status update completed successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping("/update-completed")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> updateCompletedSchedules() {
        log.info("Manual trigger for completed schedules update");
        
        try {
            statusService.updateCompletedFlightSchedules();
            
            Map<String, Object> response = Map.of(
                "message", "Completed schedules update triggered successfully",
                "timestamp", ZonedDateTime.now(),
                "status", "success"
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error triggering completed schedules update: {}", e.getMessage(), e);
            
            Map<String, Object> response = Map.of(
                "message", "Error triggering completed schedules update: " + e.getMessage(),
                "timestamp", ZonedDateTime.now(),
                "status", "error"
            );
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Manually trigger status update for active schedules
     * POST /backoffice/flight-schedules/status/update-active
     */
    @Operation(
        summary = "Manually update active schedules",
        description = "Manually trigger the update of flight schedules to ACTIVE status"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status update completed successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping("/update-active")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> updateActiveSchedules() {
        log.info("Manual trigger for active schedules update");
        
        try {
            statusService.updateActiveFlightSchedules();
            
            Map<String, Object> response = Map.of(
                "message", "Active schedules update triggered successfully",
                "timestamp", ZonedDateTime.now(),
                "status", "success"
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error triggering active schedules update: {}", e.getMessage(), e);
            
            Map<String, Object> response = Map.of(
                "message", "Error triggering active schedules update: " + e.getMessage(),
                "timestamp", ZonedDateTime.now(),
                "status", "error"
            );
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Manually update flight schedule status based on conditions
     * POST /backoffice/flight-schedules/status/manual-update
     */
    @Operation(
        summary = "Manual status update with conditions",
        description = "Manually update flight schedule status from one state to another based on time conditions"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Status update completed successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request parameters"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping("/manual-update")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> manualStatusUpdate(
            @Parameter(description = "Source status to update from", required = true)
            @RequestParam ScheduleStatus fromStatus,
            
            @Parameter(description = "Target status to update to", required = true)
            @RequestParam ScheduleStatus toStatus,
            
            @Parameter(description = "Time condition for the update (ISO 8601 format)", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) ZonedDateTime timeCondition
    ) {
        log.info("Manual status update requested: {} -> {} for schedules before {}", fromStatus, toStatus, timeCondition);
        
        try {
            int updatedCount = statusService.updateFlightScheduleStatus(fromStatus, toStatus, timeCondition);
            
            Map<String, Object> response = Map.of(
                "message", "Manual status update completed successfully",
                "updatedCount", updatedCount,
                "fromStatus", fromStatus,
                "toStatus", toStatus,
                "timeCondition", timeCondition,
                "timestamp", ZonedDateTime.now(),
                "status", "success"
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in manual status update: {}", e.getMessage(), e);
            
            Map<String, Object> response = Map.of(
                "message", "Error in manual status update: " + e.getMessage(),
                "timestamp", ZonedDateTime.now(),
                "status", "error"
            );
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Manually trigger cleanup of old completed schedules
     * POST /backoffice/flight-schedules/status/cleanup
     */
    @Operation(
        summary = "Cleanup old completed schedules",
        description = "Manually trigger the cleanup of old completed flight schedules"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Cleanup completed successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PostMapping("/cleanup")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> cleanupOldSchedules() {
        log.info("Manual trigger for old schedules cleanup");
        
        try {
            statusService.cleanupOldCompletedSchedules();
            
            Map<String, Object> response = Map.of(
                "message", "Old schedules cleanup triggered successfully",
                "timestamp", ZonedDateTime.now(),
                "status", "success"
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error triggering old schedules cleanup: {}", e.getMessage(), e);
            
            Map<String, Object> response = Map.of(
                "message", "Error triggering old schedules cleanup: " + e.getMessage(),
                "timestamp", ZonedDateTime.now(),
                "status", "error"
            );
            
            return ResponseEntity.status(500).body(response);
        }
    }
    
    /**
     * Health check for status management service
     * GET /backoffice/flight-schedules/status/health
     */
    @Operation(
        summary = "Status service health check",
        description = "Check the health and configuration of the flight schedule status service"
    )
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = Map.of(
            "service", "flight-schedule-status-service",
            "status", "healthy",
            "timestamp", ZonedDateTime.now(),
            "scheduling", Map.of(
                "completedUpdates", "Daily at 1:00 AM (Asia/Ho_Chi_Minh)",
                "activeUpdates", "Every 30 minutes",
                "cleanup", "Weekly on Sunday at 2:00 AM (Asia/Ho_Chi_Minh)"
            )
        );
        
        return ResponseEntity.ok(health);
    }
}