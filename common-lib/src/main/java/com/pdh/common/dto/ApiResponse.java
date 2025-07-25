package com.pdh.common.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standardized API Response wrapper for all BookingSmart services
 * Provides consistent response format across all REST endpoints
 *
 * @param <T> The type of data being returned
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    /**
     * Indicates if the operation was successful
     */
    private boolean success;

    /**
     * Human-readable message describing the result
     */
    private String message;

    /**
     * The actual data payload (null for error responses)
     */
    private T data;

    /**
     * Error code for failed operations (null for successful responses)
     */
    private String errorCode;

    /**
     * Timestamp when the response was generated
     */
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    private LocalDateTime timestamp;

    /**
     * Additional metadata (optional)
     */
    private Object metadata;

    /**
     * Request tracking ID for debugging (optional)
     */
    private String requestId;

    // === STATIC FACTORY METHODS ===

    /**
     * Create a successful response with data
     */
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message("Operation completed successfully")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a successful response with data and custom message
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a successful response with data, message, and metadata
     */
    public static <T> ApiResponse<T> success(T data, String message, Object metadata) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .metadata(metadata)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create an error response with message and error code
     */
    public static <T> ApiResponse<T> error(String message, String errorCode) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode(errorCode)
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create an error response with message only
     */
    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode("GENERAL_ERROR")
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a validation error response
     */
    public static <T> ApiResponse<T> validationError(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode("VALIDATION_ERROR")
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a not found error response
     */
    public static <T> ApiResponse<T> notFound(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode("NOT_FOUND")
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create an unauthorized error response
     */
    public static <T> ApiResponse<T> unauthorized(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode("UNAUTHORIZED")
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a forbidden error response
     */
    public static <T> ApiResponse<T> forbidden(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode("FORBIDDEN")
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create an internal server error response
     */
    public static <T> ApiResponse<T> internalError(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode("INTERNAL_SERVER_ERROR")
                .timestamp(LocalDateTime.now())
                .build();
    }

    /**
     * Create a service unavailable error response
     */
    public static <T> ApiResponse<T> serviceUnavailable(String message) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode("SERVICE_UNAVAILABLE")
                .timestamp(LocalDateTime.now())
                .build();
    }

    // === UTILITY METHODS ===

    /**
     * Check if this response represents a successful operation
     */
    public boolean isSuccess() {
        return success;
    }

    /**
     * Check if this response represents an error
     */
    public boolean isError() {
        return !success;
    }

    /**
     * Get data if successful, otherwise return null
     */
    public T getDataOrNull() {
        return success ? data : null;
    }

    /**
     * Set request ID for tracking
     */
    public ApiResponse<T> withRequestId(String requestId) {
        this.requestId = requestId;
        return this;
    }

    /**
     * Set metadata
     */
    public ApiResponse<T> withMetadata(Object metadata) {
        this.metadata = metadata;
        return this;
    }

    /**
     * Create a copy with different data type (for transformations)
     */
    public <U> ApiResponse<U> map(U newData) {
        return ApiResponse.<U>builder()
                .success(this.success)
                .message(this.message)
                .data(newData)
                .errorCode(this.errorCode)
                .timestamp(this.timestamp)
                .metadata(this.metadata)
                .requestId(this.requestId)
                .build();
    }
}