package com.pdh.common.util;

import com.pdh.common.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Utility class for creating standardized ResponseEntity objects
 * with ApiResponse wrapper for consistent API responses
 */
public class ResponseUtils {
    
    private ResponseUtils() {
        // Utility class - prevent instantiation
    }
    
    // === SUCCESS RESPONSES ===
    
    /**
     * Create a successful response with data
     */
    public static <T> ResponseEntity<ApiResponse<T>> ok(T data) {
        return ResponseEntity.ok(ApiResponse.success(data));
    }
    
    /**
     * Create a successful response with data and custom message
     */
    public static <T> ResponseEntity<ApiResponse<T>> ok(T data, String message) {
        return ResponseEntity.ok(ApiResponse.success(data, message));
    }
    
    /**
     * Create a successful response with data, message, and metadata
     */
    public static <T> ResponseEntity<ApiResponse<T>> ok(T data, String message, Object metadata) {
        return ResponseEntity.ok(ApiResponse.success(data, message, metadata));
    }
    
    /**
     * Create a successful response for creation (201 Created)
     */
    public static <T> ResponseEntity<ApiResponse<T>> created(T data) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(data, "Resource created successfully"));
    }
    
    /**
     * Create a successful response for creation with custom message
     */
    public static <T> ResponseEntity<ApiResponse<T>> created(T data, String message) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(data, message));
    }
    
    /**
     * Create a successful response with no content (204 No Content)
     */
    public static <T> ResponseEntity<ApiResponse<T>> noContent() {
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success(null, "Operation completed successfully"));
    }
    
    /**
     * Create a successful response with no content and custom message
     */
    public static <T> ResponseEntity<ApiResponse<T>> noContent(String message) {
        return ResponseEntity.status(HttpStatus.NO_CONTENT)
                .body(ApiResponse.success(null, message));
    }
    
    // === ERROR RESPONSES ===
    
    /**
     * Create a bad request response (400)
     */
    public static <T> ResponseEntity<ApiResponse<T>> badRequest(String message) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.validationError(message));
    }
    
    /**
     * Create a bad request response with error code
     */
    public static <T> ResponseEntity<ApiResponse<T>> badRequest(String message, String errorCode) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.error(message, errorCode));
    }
    
    /**
     * Create a validation error response from BindingResult
     */
    public static <T> ResponseEntity<ApiResponse<T>> validationError(BindingResult bindingResult) {
        List<String> errors = bindingResult.getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.toList());
        
        String message = "Validation failed: " + String.join(", ", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResponse.validationError(message));
    }
    
    /**
     * Create an unauthorized response (401)
     */
    public static <T> ResponseEntity<ApiResponse<T>> unauthorized(String message) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.unauthorized(message));
    }
    
    /**
     * Create a forbidden response (403)
     */
    public static <T> ResponseEntity<ApiResponse<T>> forbidden(String message) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.forbidden(message));
    }
    
    /**
     * Create a not found response (404)
     */
    public static <T> ResponseEntity<ApiResponse<T>> notFound(String message) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.notFound(message));
    }
    
    /**
     * Create a conflict response (409)
     */
    public static <T> ResponseEntity<ApiResponse<T>> conflict(String message) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.error(message, "CONFLICT"));
    }
    
    /**
     * Create an internal server error response (500)
     */
    public static <T> ResponseEntity<ApiResponse<T>> internalError(String message) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.internalError(message));
    }
    
    /**
     * Create a service unavailable response (503)
     */
    public static <T> ResponseEntity<ApiResponse<T>> serviceUnavailable(String message) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(ApiResponse.serviceUnavailable(message));
    }
    
    // === CONDITIONAL RESPONSES ===
    
    /**
     * Create response based on data presence
     * Returns 200 OK if data is present, 404 Not Found if null
     */
    public static <T> ResponseEntity<ApiResponse<T>> okOrNotFound(T data, String notFoundMessage) {
        if (data != null) {
            return ok(data);
        } else {
            return notFound(notFoundMessage);
        }
    }
    
    /**
     * Create response based on operation success
     */
    public static <T> ResponseEntity<ApiResponse<T>> conditionalResponse(
            boolean success, T data, String successMessage, String errorMessage) {
        if (success) {
            return ok(data, successMessage);
        } else {
            return badRequest(errorMessage);
        }
    }
    
    // === PAGINATION RESPONSES ===
    
    /**
     * Create a paginated response with metadata
     */
    public static <T> ResponseEntity<ApiResponse<T>> paginated(T data, PaginationMetadata pagination) {
        return ok(data, "Data retrieved successfully", pagination);
    }

    public static ResponseEntity<ApiResponse<Void>> accepted(String message) {
        return ResponseEntity.accepted().body(ApiResponse.success(null, message));
    }
    public static ResponseEntity<ApiResponse<Void>> accepted(String message, String errorCode) {
        return ResponseEntity.accepted().body(ApiResponse.error(message, errorCode));
    }

    /**
     * Pagination metadata helper class
     */
    public static class PaginationMetadata {
        private final int page;
        private final int size;
        private final long totalElements;
        private final int totalPages;
        private final boolean hasNext;
        private final boolean hasPrevious;
        
        public PaginationMetadata(int page, int size, long totalElements, int totalPages) {
            this.page = page;
            this.size = size;
            this.totalElements = totalElements;
            this.totalPages = totalPages;
            this.hasNext = page < totalPages - 1;
            this.hasPrevious = page > 0;
        }
        
        // Getters
        public int getPage() { return page; }
        public int getSize() { return size; }
        public long getTotalElements() { return totalElements; }
        public int getTotalPages() { return totalPages; }
        public boolean isHasNext() { return hasNext; }
        public boolean isHasPrevious() { return hasPrevious; }
    }
    
    // === EXCEPTION HANDLING ===
    
    /**
     * Handle common exceptions and return appropriate responses
     */
    public static <T> ResponseEntity<ApiResponse<T>> handleException(Exception e) {
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
    public static <T> ResponseEntity<ApiResponse<T>> handleException(Exception e, String defaultMessage) {
        if (e instanceof IllegalArgumentException) {
            return badRequest(e.getMessage(), "INVALID_ARGUMENT");
        } else if (e instanceof SecurityException) {
            return forbidden(e.getMessage());
        } else {
            return internalError(defaultMessage);
        }
    }
}
