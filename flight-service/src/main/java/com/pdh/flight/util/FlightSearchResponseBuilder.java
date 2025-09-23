package com.pdh.flight.util;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Helper for constructing consistent flight search responses and errors.
 */
public final class FlightSearchResponseBuilder {

    private FlightSearchResponseBuilder() {
    }

    public static Map<String, Object> validationError(String message, int page, int limit) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "VALIDATION_ERROR");
        response.put("message", message != null ? message : "Invalid request parameters");
        response.put("flights", List.of());
        response.put("totalCount", 0);
        response.put("page", page);
        response.put("limit", limit);
        response.put("hasMore", false);
        return response;
    }

    public static Map<String, Object> failureResponse(String message, int page, int limit) {
        Map<String, Object> response = new HashMap<>();
        response.put("error", "Failed to search flights");
        response.put("message", message != null ? message : "Unexpected error occurred");
        response.put("flights", List.of());
        response.put("totalCount", 0);
        response.put("page", page);
        response.put("limit", limit);
        response.put("hasMore", false);
        return response;
    }
}
