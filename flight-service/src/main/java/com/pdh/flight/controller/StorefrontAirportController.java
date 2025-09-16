package com.pdh.flight.controller;

import com.pdh.flight.service.StorefrontAirportService;
import com.pdh.flight.service.CityMappingService;
import com.pdh.common.dto.SearchResponse;
import com.pdh.common.dto.DestinationSearchResult;
import com.pdh.common.dto.ErrorResponse;
import com.pdh.common.validation.SearchValidation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST Controller for airport operations in storefront
 */
@RestController
@RequestMapping("/storefront/airports")
@RequiredArgsConstructor
@Slf4j
public class StorefrontAirportController {

    private final StorefrontAirportService storefrontAirportService;
    private final CityMappingService cityMappingService;

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
     * Search airports and cities for autocomplete functionality
     */
    @GetMapping("/search")
    public ResponseEntity<SearchResponse<DestinationSearchResult>> searchAirports(
            @RequestParam(required = false) String q) {
        
        log.info("Searching airports and cities for storefront: query={}", q);
        
        try {
            // Validate input
            SearchValidation.ValidationResult validation = SearchValidation.validateSearchQuery(q);
            if (!validation.isValid()) {
                log.warn("Invalid search query: {}", validation.getErrorMessage());
                SearchResponse<DestinationSearchResult> errorResponse = SearchResponse.<DestinationSearchResult>builder()
                    .results(List.of())
                    .totalCount(0L)
                    .query(q != null ? q : "")
                    .metadata(Map.of("error", ErrorResponse.of("VALIDATION_ERROR", validation.getErrorMessage(), null, "/storefront/airports/search")))
                    .build();
                return ResponseEntity.badRequest().body(errorResponse);
            }
            
            // Sanitize input
            String sanitizedQuery = SearchValidation.sanitizeSearchQuery(q);
            
            long startTime = System.currentTimeMillis();
            
            // Use CityMappingService for comprehensive search
            List<CityMappingService.CitySearchResult> results = cityMappingService.searchCities(sanitizedQuery);
            
            List<DestinationSearchResult> destinations = results.stream()
                .<DestinationSearchResult>map(city -> DestinationSearchResult.city(
                    city.getCityName(),
                    city.getCountry(),
                    city.getIataCode()
                ).toBuilder()
                    .relevanceScore(city.getRelevanceScore())
                    .build())
                .collect(Collectors.toList());
            
            long executionTime = System.currentTimeMillis() - startTime;
            
            SearchResponse<DestinationSearchResult> response = SearchResponse.<DestinationSearchResult>builder()
                .results(destinations)
                .totalCount((long) destinations.size())
                .query(q != null ? q : "")
                .executionTimeMs(executionTime)
                .metadata(Map.of("category", "airport_city_search"))
                .build();
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error searching airports and cities for storefront", e);
            SearchResponse<DestinationSearchResult> errorResponse = SearchResponse.<DestinationSearchResult>builder()
                .results(List.of())
                .totalCount(0L)
                .query(q != null ? q : "")
                .metadata(Map.of("error", ErrorResponse.of("SEARCH_ERROR", "Airport and city search failed", e.getMessage(), "/storefront/airports/search")))
                .build();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}