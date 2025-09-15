package com.pdh.flight.controller;

import com.pdh.flight.dto.response.AirportDto;
import com.pdh.flight.service.StorefrontAirportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for airport operations in storefront
 */
@RestController
@RequestMapping("/storefront/airports")
@RequiredArgsConstructor
@Slf4j
public class StorefrontAirportController {

    private final StorefrontAirportService storefrontAirportService;

    /**
     * Get all airports with pagination for storefront
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllAirports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("Fetching airports for storefront: page={}, size={}", page, size);
        
        try {
            Map<String, Object> response = storefrontAirportService.getAllAirports(page, size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching airports for storefront", e);
            return ResponseEntity.ok(Map.of(
                "content", List.of(),
                "totalElements", 0,
                "totalPages", 0,
                "currentPage", page
            ));
        }
    }

    /**
     * Search airports for autocomplete functionality
     */
    @GetMapping("/search")
    public ResponseEntity<List<AirportDto>> searchAirports(@RequestParam String query) {
        log.info("Searching airports for storefront: query={}", query);
        
        try {
            List<AirportDto> response = storefrontAirportService.searchAirports(query);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error searching airports for storefront", e);
            return ResponseEntity.ok(List.of());
        }
    }
}