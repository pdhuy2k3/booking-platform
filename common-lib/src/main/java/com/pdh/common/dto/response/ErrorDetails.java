package com.pdh.common.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Error details for API responses
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Detailed error information")
public class ErrorDetails {

    @Schema(description = "Error code for programmatic handling", example = "VALIDATION_ERROR")
    private String errorCode;

    @Schema(description = "Detailed error message", example = "The provided email format is invalid")
    private String errorMessage;

    @Schema(description = "Field name that caused the error (for validation errors)", example = "email")
    private String field;

    @Schema(description = "The rejected value that caused the error", example = "invalid-email")
    private Object rejectedValue;

    /**
     * Creates error details for validation errors
     */
    public static ErrorDetails validationError(String field, Object rejectedValue, String message) {
        return new ErrorDetails("VALIDATION_ERROR", message, field, rejectedValue);
    }

    /**
     * Creates error details for business logic errors
     */
    public static ErrorDetails businessError(String errorCode, String message) {
        return new ErrorDetails(errorCode, message, null, null);
    }

    /**
     * Creates error details for system errors
     */
    public static ErrorDetails systemError(String message) {
        return new ErrorDetails("SYSTEM_ERROR", message, null, null);
    }
}