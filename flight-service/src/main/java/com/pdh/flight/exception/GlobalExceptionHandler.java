package com.pdh.flight.exception;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Global exception handler for flight management system
 */
@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    /**
     * Handle validation errors from @Valid annotations
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationExceptions(
            MethodArgumentNotValidException ex, WebRequest request) {
        
        log.warn("Validation error: {}", ex.getMessage());
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        Map<String, Object> response = createErrorResponse(
                "Validation failed",
                "One or more fields have invalid values",
                HttpStatus.BAD_REQUEST,
                request.getDescription(false)
        );
        response.put("fieldErrors", errors);
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle constraint violations from Bean Validation
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolationException(
            ConstraintViolationException ex, WebRequest request) {
        
        log.warn("Constraint violation: {}", ex.getMessage());
        
        Map<String, String> errors = new HashMap<>();
        Set<ConstraintViolation<?>> violations = ex.getConstraintViolations();
        
        for (ConstraintViolation<?> violation : violations) {
            String fieldName = violation.getPropertyPath().toString();
            String errorMessage = violation.getMessage();
            errors.put(fieldName, errorMessage);
        }

        Map<String, Object> response = createErrorResponse(
                "Constraint violation",
                "One or more constraints were violated",
                HttpStatus.BAD_REQUEST,
                request.getDescription(false)
        );
        response.put("fieldErrors", errors);
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle entity not found exceptions
     */
    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleEntityNotFoundException(
            EntityNotFoundException ex, WebRequest request) {
        
        log.warn("Entity not found: {}", ex.getMessage());
        
        Map<String, Object> response = createErrorResponse(
                "Resource not found",
                ex.getMessage(),
                HttpStatus.NOT_FOUND,
                request.getDescription(false)
        );
        
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle custom flight exceptions
     */
    @ExceptionHandler(FlightNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleFlightNotFoundException(
            FlightNotFoundException ex, WebRequest request) {
        
        log.warn("Flight not found: {}", ex.getMessage());
        
        Map<String, Object> response = createErrorResponse(
                "Flight not found",
                ex.getMessage(),
                HttpStatus.NOT_FOUND,
                request.getDescription(false)
        );
        
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle custom airline exceptions
     */
    @ExceptionHandler(AirlineNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleAirlineNotFoundException(
            AirlineNotFoundException ex, WebRequest request) {
        
        log.warn("Airline not found: {}", ex.getMessage());
        
        Map<String, Object> response = createErrorResponse(
                "Airline not found",
                ex.getMessage(),
                HttpStatus.NOT_FOUND,
                request.getDescription(false)
        );
        
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle custom airport exceptions
     */
    @ExceptionHandler(AirportNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleAirportNotFoundException(
            AirportNotFoundException ex, WebRequest request) {
        
        log.warn("Airport not found: {}", ex.getMessage());
        
        Map<String, Object> response = createErrorResponse(
                "Airport not found",
                ex.getMessage(),
                HttpStatus.NOT_FOUND,
                request.getDescription(false)
        );
        
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    /**
     * Handle duplicate resource exceptions
     */
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicateResourceException(
            DuplicateResourceException ex, WebRequest request) {
        
        log.warn("Duplicate resource: {}", ex.getMessage());
        
        Map<String, Object> response = createErrorResponse(
                "Duplicate resource",
                ex.getMessage(),
                HttpStatus.CONFLICT,
                request.getDescription(false)
        );
        
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    /**
     * Handle business rule violations
     */
    @ExceptionHandler(BusinessRuleViolationException.class)
    public ResponseEntity<Map<String, Object>> handleBusinessRuleViolationException(
            BusinessRuleViolationException ex, WebRequest request) {
        
        log.warn("Business rule violation: {}", ex.getMessage());
        
        Map<String, Object> response = createErrorResponse(
                "Business rule violation",
                ex.getMessage(),
                HttpStatus.BAD_REQUEST,
                request.getDescription(false)
        );
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle data integrity violations (e.g., foreign key constraints, unique constraints)
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>> handleDataIntegrityViolationException(
            DataIntegrityViolationException ex, WebRequest request) {
        
        log.warn("Data integrity violation: {}", ex.getMessage());
        
        String message = "Data integrity constraint violated";
        
        // Check for common constraint violations
        if (ex.getMessage() != null) {
            if (ex.getMessage().contains("unique constraint") || ex.getMessage().contains("Duplicate entry")) {
                message = "A record with the same unique identifier already exists";
            } else if (ex.getMessage().contains("foreign key constraint")) {
                message = "Cannot perform operation due to related data dependencies";
            } else if (ex.getMessage().contains("not-null constraint")) {
                message = "Required fields cannot be empty";
            }
        }

        Map<String, Object> response = createErrorResponse(
                "Data integrity error",
                message,
                HttpStatus.CONFLICT,
                request.getDescription(false)
        );
        
        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    /**
     * Handle illegal arguments
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgumentException(
            IllegalArgumentException ex, WebRequest request) {
        
        log.warn("Illegal argument: {}", ex.getMessage());
        
        Map<String, Object> response = createErrorResponse(
                "Invalid argument",
                ex.getMessage(),
                HttpStatus.BAD_REQUEST,
                request.getDescription(false)
        );
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle illegal state exceptions
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalStateException(
            IllegalStateException ex, WebRequest request) {
        
        log.warn("Illegal state: {}", ex.getMessage());
        
        Map<String, Object> response = createErrorResponse(
                "Invalid operation",
                ex.getMessage(),
                HttpStatus.BAD_REQUEST,
                request.getDescription(false)
        );
        
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handle all other exceptions
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGlobalException(
            Exception ex, WebRequest request) {
        
        log.error("Unexpected error occurred", ex);
        
        Map<String, Object> response = createErrorResponse(
                "Internal server error",
                "An unexpected error occurred. Please try again later.",
                HttpStatus.INTERNAL_SERVER_ERROR,
                request.getDescription(false)
        );
        
        return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    /**
     * Create a standardized error response
     */
    private Map<String, Object> createErrorResponse(String error, String message, HttpStatus status, String path) {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", ZonedDateTime.now());
        response.put("status", status.value());
        response.put("error", error);
        response.put("message", message);
        response.put("path", path);
        return response;
    }
}
