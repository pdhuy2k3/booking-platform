package com.pdh.common.validation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

import java.util.HashMap;
import java.util.Map;

/**
 * Standardized validation result for all services
 * Centralized in common-lib for consistency across the platform
 * 
 * This class provides a uniform way to handle validation results
 * across all microservices, ensuring consistent error handling
 * and response patterns.
 */
@Data
@Builder
@AllArgsConstructor
public class ValidationResult {
    
    private final boolean valid;
    private final String errorMessage;
    private final String errorCode;
    
    @Builder.Default
    private final Map<String, Object> details = new HashMap<>();

    /**
     * Creates a successful validation result
     */
    public static ValidationResult valid() {
        return ValidationResult.builder()
            .valid(true)
            .build();
    }

    /**
     * Creates a failed validation result with default error code
     */
    public static ValidationResult invalid(String errorMessage) {
        return ValidationResult.builder()
            .valid(false)
            .errorMessage(errorMessage)
            .errorCode("VALIDATION_FAILED")
            .build();
    }

    /**
     * Creates a failed validation result with custom error code
     */
    public static ValidationResult invalid(String errorMessage, String errorCode) {
        return ValidationResult.builder()
            .valid(false)
            .errorMessage(errorMessage)
            .errorCode(errorCode)
            .build();
    }

    /**
     * Creates a failed validation result with custom error code and additional details
     */
    public static ValidationResult invalid(String errorMessage, String errorCode, Map<String, Object> details) {
        return ValidationResult.builder()
            .valid(false)
            .errorMessage(errorMessage)
            .errorCode(errorCode)
            .details(details != null ? details : new HashMap<>())
            .build();
    }

    /**
     * Creates a validation result for inventory not available
     */
    public static ValidationResult inventoryNotAvailable(String message) {
        return invalid(message, "INVENTORY_NOT_AVAILABLE");
    }

    /**
     * Creates a validation result for inventory service unavailable
     */
    public static ValidationResult serviceUnavailable(String message) {
        return invalid(message, "INVENTORY_SERVICE_UNAVAILABLE");
    }

    /**
     * Adds additional detail to the validation result
     */
    public ValidationResult withDetail(String key, Object value) {
        this.details.put(key, value);
        return this;
    }

    /**
     * Gets a detail value by key
     */
    public Object getDetail(String key) {
        return this.details.get(key);
    }

    /**
     * Checks if the validation result has details
     */
    public boolean hasDetails() {
        return details != null && !details.isEmpty();
    }

    /**
     * Combines multiple validation results
     * Returns invalid if any result is invalid
     */
    public static ValidationResult combine(ValidationResult... results) {
        for (ValidationResult result : results) {
            if (!result.isValid()) {
                return result; // Return first invalid result
            }
        }
        return valid();
    }

    /**
     * Combines multiple validation results with detailed error messages
     */
    public static ValidationResult combineDetailed(ValidationResult... results) {
        StringBuilder errorMessages = new StringBuilder();
        String firstErrorCode = null;
        Map<String, Object> combinedDetails = new HashMap<>();
        
        for (int i = 0; i < results.length; i++) {
            ValidationResult result = results[i];
            if (!result.isValid()) {
                if (errorMessages.length() > 0) {
                    errorMessages.append("; ");
                }
                errorMessages.append(result.getErrorMessage());
                
                if (firstErrorCode == null) {
                    firstErrorCode = result.getErrorCode();
                }
                
                if (result.hasDetails()) {
                    combinedDetails.putAll(result.getDetails());
                }
            }
        }
        
        if (errorMessages.length() > 0) {
            return invalid(errorMessages.toString(), firstErrorCode, combinedDetails);
        }
        
        return valid();
    }
}
