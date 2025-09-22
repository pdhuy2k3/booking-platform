package com.pdh.hotel.util;

import java.util.List;
import java.util.Map;

/**
 * Builds consistent responses for hotel search endpoints.
 */
public final class HotelSearchResponseBuilder {

    private HotelSearchResponseBuilder() {
    }

    public static Map<String, Object> validationError(String message) {
        return Map.of(
            "error", "VALIDATION_ERROR",
            "message", message,
            "hotels", List.of(),
            "totalCount", 0
        );
    }

    public static Map<String, Object> pagedResponse(
            List<Map<String, Object>> hotels,
            long totalCount,
            int page,
            int limit,
            boolean hasMore,
            Map<String, Object> appliedFilters,
            Map<String, Object> availableFilters) {
        return Map.of(
            "hotels", hotels,
            "totalCount", totalCount,
            "page", page,
            "limit", limit,
            "hasMore", hasMore,
            "filters", Map.of(
                "applied", appliedFilters,
                "available", availableFilters
            )
        );
    }

    public static Map<String, Object> searchFailure(String message, int page, int limit) {
        return Map.of(
            "error", "Failed to search hotels",
            "message", message,
            "hotels", List.of(),
            "totalCount", 0,
            "page", page,
            "limit", limit,
            "hasMore", false
        );
    }
}

