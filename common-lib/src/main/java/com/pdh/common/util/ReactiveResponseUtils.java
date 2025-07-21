package com.pdh.common.util;

import com.pdh.common.dto.ApiResponse;
import reactor.core.publisher.Mono;

/**
 * Reactive utility class for creating standardized Mono<ApiResponse<T>> objects
 * for WebFlux controllers that use reactive programming
 */
public class ReactiveResponseUtils {
    
    private ReactiveResponseUtils() {
        // Utility class - prevent instantiation
    }
    
    // === SUCCESS RESPONSES ===
    
    /**
     * Create a successful reactive response with data
     */
    public static <T> Mono<ApiResponse<T>> ok(T data) {
        return Mono.just(ApiResponse.success(data));
    }
    
    /**
     * Create a successful reactive response with data and custom message
     */
    public static <T> Mono<ApiResponse<T>> ok(T data, String message) {
        return Mono.just(ApiResponse.success(data, message));
    }
    
    /**
     * Create a successful reactive response with data, message, and metadata
     */
    public static <T> Mono<ApiResponse<T>> ok(T data, String message, Object metadata) {
        return Mono.just(ApiResponse.success(data, message, metadata));
    }
    
    /**
     * Create a successful reactive response for creation
     */
    public static <T> Mono<ApiResponse<T>> created(T data) {
        return Mono.just(ApiResponse.success(data, "Resource created successfully"));
    }
    
    /**
     * Create a successful reactive response for creation with custom message
     */
    public static <T> Mono<ApiResponse<T>> created(T data, String message) {
        return Mono.just(ApiResponse.success(data, message));
    }
    
    // === ERROR RESPONSES ===
    
    /**
     * Create a reactive bad request response
     */
    public static <T> Mono<ApiResponse<T>> badRequest(String message) {
        return Mono.just(ApiResponse.validationError(message));
    }
    
    /**
     * Create a reactive bad request response with error code
     */
    public static <T> Mono<ApiResponse<T>> badRequest(String message, String errorCode) {
        return Mono.just(ApiResponse.error(message, errorCode));
    }
    
    /**
     * Create a reactive unauthorized response
     */
    public static <T> Mono<ApiResponse<T>> unauthorized(String message) {
        return Mono.just(ApiResponse.unauthorized(message));
    }
    
    /**
     * Create a reactive forbidden response
     */
    public static <T> Mono<ApiResponse<T>> forbidden(String message) {
        return Mono.just(ApiResponse.forbidden(message));
    }
    
    /**
     * Create a reactive not found response
     */
    public static <T> Mono<ApiResponse<T>> notFound(String message) {
        return Mono.just(ApiResponse.notFound(message));
    }
    
    /**
     * Create a reactive internal server error response
     */
    public static <T> Mono<ApiResponse<T>> internalError(String message) {
        return Mono.just(ApiResponse.internalError(message));
    }
    
    /**
     * Create a reactive service unavailable response
     */
    public static <T> Mono<ApiResponse<T>> serviceUnavailable(String message) {
        return Mono.just(ApiResponse.serviceUnavailable(message));
    }
    
    // === CONDITIONAL RESPONSES ===
    
    /**
     * Create reactive response based on data presence
     */
    public static <T> Mono<ApiResponse<T>> okOrNotFound(T data, String notFoundMessage) {
        if (data != null) {
            return ok(data);
        } else {
            return notFound(notFoundMessage);
        }
    }
    
    /**
     * Create reactive response based on operation success
     */
    public static <T> Mono<ApiResponse<T>> conditionalResponse(
            boolean success, T data, String successMessage, String errorMessage) {
        if (success) {
            return ok(data, successMessage);
        } else {
            return badRequest(errorMessage);
        }
    }
    
    // === EXCEPTION HANDLING ===
    
    /**
     * Handle exceptions and return appropriate reactive responses
     */
    public static <T> Mono<ApiResponse<T>> handleException(Throwable e) {
        if (e instanceof IllegalArgumentException) {
            return badRequest(e.getMessage(), "INVALID_ARGUMENT");
        } else if (e instanceof SecurityException) {
            return forbidden(e.getMessage());
        } else {
            return internalError("An unexpected error occurred: " + e.getMessage());
        }
    }
    
    /**
     * Handle exceptions with custom error mapping
     */
    public static <T> Mono<ApiResponse<T>> handleException(Throwable e, String defaultMessage) {
        if (e instanceof IllegalArgumentException) {
            return badRequest(e.getMessage(), "INVALID_ARGUMENT");
        } else if (e instanceof SecurityException) {
            return forbidden(e.getMessage());
        } else {
            return internalError(defaultMessage);
        }
    }
    
    // === TRANSFORMATION HELPERS ===
    
    /**
     * Transform a Mono<T> to Mono<ApiResponse<T>> with success wrapper
     */
    public static <T> Mono<ApiResponse<T>> wrapSuccess(Mono<T> mono) {
        return mono.map(ApiResponse::success);
    }
    
    /**
     * Transform a Mono<T> to Mono<ApiResponse<T>> with success wrapper and custom message
     */
    public static <T> Mono<ApiResponse<T>> wrapSuccess(Mono<T> mono, String message) {
        return mono.map(data -> ApiResponse.success(data, message));
    }
    
    /**
     * Transform a Mono<T> to Mono<ApiResponse<T>> with error handling
     */
    public static <T> Mono<ApiResponse<T>> wrapWithErrorHandling(Mono<T> mono) {
        return mono
                .map(ApiResponse::success)
                .onErrorResume(ReactiveResponseUtils::handleException);
    }
    
    /**
     * Transform a Mono<T> to Mono<ApiResponse<T>> with error handling and custom message
     */
    public static <T> Mono<ApiResponse<T>> wrapWithErrorHandling(Mono<T> mono, String successMessage, String errorMessage) {
        return mono
                .map(data -> ApiResponse.success(data, successMessage))
                .onErrorResume(e -> handleException(e, errorMessage));
    }
}
