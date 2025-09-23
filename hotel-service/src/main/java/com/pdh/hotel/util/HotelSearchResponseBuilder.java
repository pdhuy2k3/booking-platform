package com.pdh.hotel.util;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Builds consistent responses for hotel search endpoints.
 */
public final class HotelSearchResponseBuilder {

    private HotelSearchResponseBuilder() {
    }

    public static Map<String, Object> validationError(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "VALIDATION_ERROR");
        response.put("message", message != null ? message : "Invalid request parameters");
        response.put("hotels", List.of());
        response.put("totalCount", 0);
        return response;
    }

    public static Map<String, Object> pagedResponse(
            List<Map<String, Object>> hotels,
            long totalCount,
            int page,
            int limit,
            boolean hasMore,
            Map<String, Object> appliedFilters,
            Map<String, Object> availableFilters) {
        Map<String, Object> filters = new HashMap<>();
        filters.put("applied", appliedFilters != null ? appliedFilters : Map.of());
        filters.put("available", availableFilters != null ? availableFilters : Map.of());

        Map<String, Object> response = new HashMap<>();
        response.put("hotels", hotels != null ? hotels : List.of());
        response.put("totalCount", totalCount);
        response.put("page", page);
        response.put("limit", limit);
        response.put("hasMore", hasMore);
        response.put("filters", filters);
        return response;
    }

    public static Map<String, Object> searchFailure(String message, int page, int limit) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Failed to search hotels");
        response.put("message", message != null ? message : "Unexpected error occurred");
        response.put("hotels", List.of());
        response.put("totalCount", 0);
        response.put("page", page);
        response.put("limit", limit);
        response.put("hasMore", false);
        return response;
    }
}
