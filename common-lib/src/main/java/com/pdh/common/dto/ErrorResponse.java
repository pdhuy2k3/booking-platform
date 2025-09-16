package com.pdh.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Standardized error response format for all services
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {
    
    /**
     * Error code (e.g., "VALIDATION_ERROR", "NOT_FOUND", "INTERNAL_ERROR")
     */
    private String errorCode;
    
    /**
     * Human-readable error message
     */
    private String message;
    
    /**
     * Detailed error description
     */
    private String details;
    
    /**
     * Timestamp when the error occurred
     */
    private LocalDateTime timestamp;
    
    /**
     * The request path that caused the error
     */
    private String path;
    
    /**
     * Additional error metadata
     */
    private Map<String, Object> metadata;
    
    /**
     * Create a simple error response
     */
    public static ErrorResponse of(String errorCode, String message) {
        return ErrorResponse.builder()
                .errorCode(errorCode)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();
    }
    
    /**
     * Create a detailed error response
     */
    public static ErrorResponse of(String errorCode, String message, String details, String path) {
        return ErrorResponse.builder()
                .errorCode(errorCode)
                .message(message)
                .details(details)
                .path(path)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
