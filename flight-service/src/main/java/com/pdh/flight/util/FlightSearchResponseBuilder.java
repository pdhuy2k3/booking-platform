package com.pdh.flight.util;

import java.util.List;
import java.util.Map;

/**
 * Helper for constructing consistent flight search responses and errors.
 */
public final class FlightSearchResponseBuilder {

    private FlightSearchResponseBuilder() {
    }

    public static Map<String, Object> validationError(String message, int page, int limit) {
        return Map.of(
            "error", "VALIDATION_ERROR",
            "message", message,
            "flights", List.of(),
            "totalCount", 0,
            "page", page,
            "limit", limit,
            "hasMore", false
        );
    }

    public static Map<String, Object> failureResponse(String message, int page, int limit) {
        return Map.of(
            "error", "Failed to search flights",
            "message", message,
            "flights", List.of(),
            "totalCount", 0,
            "page", page,
            "limit", limit,
            "hasMore", false
        );
    }
}

