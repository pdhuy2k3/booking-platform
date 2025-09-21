package com.pdh.flight.controller;

import com.pdh.flight.dto.response.AirlineDto;
import com.pdh.flight.service.StorefrontAirlineService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for airline operations in storefront
 */
@RestController
@RequestMapping("/storefront/airlines")
@RequiredArgsConstructor
@Slf4j
public class StorefrontAirlineController {

    private final StorefrontAirlineService storefrontAirlineService;

    /**
     * Get all airlines with pagination for storefront
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllAirlines(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("Fetching airlines for storefront: page={}, size={}", page, size);
        
        try {
            Map<String, Object> response = storefrontAirlineService.getAllAirlines(page, size);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching airlines for storefront", e);
            return ResponseEntity.ok(Map.of(
                "content", List.of(),
                "totalElements", 0,
                "totalPages", 0,
                "currentPage", page
            ));
        }
    }

    /**
     * Search airlines for autocomplete functionality
     */
    @GetMapping("/search")
    public ResponseEntity<List<AirlineDto>> searchAirlines(@RequestParam String query) {
        log.info("Searching airlines for storefront: query={}", query);
        
        try {
            List<AirlineDto> response = storefrontAirlineService.searchAirlines(query);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error searching airlines for storefront", e);
            return ResponseEntity.ok(List.of());
        }
    }
}