package com.pdh.common.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standard API Response wrapper for all BookingSmart services
 * 
 * This class provides a consistent response format across all microservices
 * and includes proper OpenAPI documentation annotations.
 * 
 * @param <T> The type of data being returned
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Standard API response wrapper")
public class ApiResponse<T> {

    @Schema(description = "Indicates if the operation was successful", example = "true")
    private boolean success;

    @Schema(description = "Human-readable message describing the result", example = "Operation completed successfully")
    private String message;

    @Schema(description = "The actual response data")
    private T data;

    @Schema(description = "Timestamp when the response was generated", example = "2024-02-15T10:30:00")
    private LocalDateTime timestamp;

    @Schema(description = "Unique request identifier for tracing", example = "req-12345-abcde")
    private String requestId;

    @Schema(description = "Error details if the operation failed")
    private ErrorDetails error;

    /**
     * Creates a successful response with data
     */
    public static <T> ApiResponse<T> success(T data) {
        return success(data, "Operation completed successfully");
    }

    /**
     * Creates a successful response with data and custom message
     */
    public static <T> ApiResponse<T> success(T data, String message) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(true);
        response.setMessage(message);
        response.setData(data);
        response.setTimestamp(LocalDateTime.now());
        return response;
    }

    /**
     * Creates an error response with message
     */
    public static <T> ApiResponse<T> error(String message) {
        return error(message, null);
    }

    /**
     * Creates an error response with message and error details
     */
    public static <T> ApiResponse<T> error(String message, ErrorDetails errorDetails) {
        ApiResponse<T> response = new ApiResponse<>();
        response.setSuccess(false);
        response.setMessage(message);
        response.setError(errorDetails);
        response.setTimestamp(LocalDateTime.now());
        return response;
    }

    /**
     * Sets the request ID for tracing
     */
    public ApiResponse<T> withRequestId(String requestId) {
        this.requestId = requestId;
        return this;
    }
}