package com.pdh.common.validation;

import lombok.experimental.UtilityClass;
import org.springframework.util.StringUtils;

import java.util.regex.Pattern;

/**
 * Utility class for search input validation
 */
@UtilityClass
public class SearchValidation {
    
    // Maximum length for search queries
    private static final int MAX_QUERY_LENGTH = 100;
    
    // Minimum length for meaningful search
    private static final int MIN_QUERY_LENGTH = 1;
    
    // Pattern for valid search characters (Unicode letters, numbers, spaces, hyphens, apostrophes)
    // Supports Vietnamese and other international characters
    private static final Pattern VALID_SEARCH_PATTERN = Pattern.compile("^[\\p{L}\\p{N}\\s\\-']+$", Pattern.UNICODE_CASE);
    
    // Pattern for IATA codes (3 letters)
    private static final Pattern IATA_CODE_PATTERN = Pattern.compile("^[A-Z]{3}$");
    
    /**
     * Validate search query input
     * @param query the search query to validate
     * @return validation result with error message if invalid
     */
    public static ValidationResult validateSearchQuery(String query) {
        if (!StringUtils.hasText(query)) {
            return ValidationResult.valid(); // Empty query is allowed for popular destinations
        }
        
        String trimmed = query.trim();
        
        // Check length
        if (trimmed.length() < MIN_QUERY_LENGTH) {
            return ValidationResult.invalid("Search query must be at least " + MIN_QUERY_LENGTH + " character long");
        }
        
        if (trimmed.length() > MAX_QUERY_LENGTH) {
            return ValidationResult.invalid("Search query must be no more than " + MAX_QUERY_LENGTH + " characters long");
        }
        
        // Check for valid characters
        if (!VALID_SEARCH_PATTERN.matcher(trimmed).matches()) {
            return ValidationResult.invalid("Search query contains invalid characters. Only letters, numbers, spaces, hyphens, and apostrophes are allowed");
        }
        
        // Check for SQL injection patterns
        if (containsSqlInjectionPatterns(trimmed)) {
            return ValidationResult.invalid("Search query contains potentially harmful content");
        }
        
        return ValidationResult.valid();
    }
    
    /**
     * Validate IATA code format
     * @param iataCode the IATA code to validate
     * @return validation result
     */
    public static ValidationResult validateIataCode(String iataCode) {
        if (!StringUtils.hasText(iataCode)) {
            return ValidationResult.valid(); // Empty is allowed
        }
        
        String trimmed = iataCode.trim().toUpperCase();
        
        if (!IATA_CODE_PATTERN.matcher(trimmed).matches()) {
            return ValidationResult.invalid("IATA code must be exactly 3 letters");
        }
        
        return ValidationResult.valid();
    }
    
    /**
     * Sanitize search query by removing potentially harmful content
     * @param query the query to sanitize
     * @return sanitized query
     */
    public static String sanitizeSearchQuery(String query) {
        if (!StringUtils.hasText(query)) {
            return "";
        }
        
        String sanitized = query.trim();
        
        // Remove SQL injection patterns
        sanitized = sanitized.replaceAll("(?i)(union|select|insert|update|delete|drop|create|alter|exec|execute)", "");
        
        // Remove script tags
        sanitized = sanitized.replaceAll("(?i)<script[^>]*>.*?</script>", "");
        
        // Remove HTML tags
        sanitized = sanitized.replaceAll("<[^>]+>", "");
        
        // Limit length
        if (sanitized.length() > MAX_QUERY_LENGTH) {
            sanitized = sanitized.substring(0, MAX_QUERY_LENGTH);
        }
        
        return sanitized.trim();
    }
    
    /**
     * Check if query contains SQL injection patterns
     * @param query the query to check
     * @return true if potentially harmful patterns are found
     */
    private static boolean containsSqlInjectionPatterns(String query) {
        String lowerQuery = query.toLowerCase();
        
        // Common SQL injection patterns
        String[] patterns = {
            "union", "select", "insert", "update", "delete", "drop", "create", "alter",
            "exec", "execute", "script", "javascript", "vbscript", "onload", "onerror"
        };
        
        for (String pattern : patterns) {
            if (lowerQuery.contains(pattern)) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Validation result class
     */
    public static class ValidationResult {
        private final boolean valid;
        private final String errorMessage;
        
        private ValidationResult(boolean valid, String errorMessage) {
            this.valid = valid;
            this.errorMessage = errorMessage;
        }
        
        public static ValidationResult valid() {
            return new ValidationResult(true, null);
        }
        
        public static ValidationResult invalid(String errorMessage) {
            return new ValidationResult(false, errorMessage);
        }
        
        public boolean isValid() {
            return valid;
        }
        
        public String getErrorMessage() {
            return errorMessage;
        }
    }
}
