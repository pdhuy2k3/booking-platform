package com.pdh.flight.exception;

/**
 * Exception thrown when an airline is not found
 */
public class AirlineNotFoundException extends RuntimeException {
    
    public AirlineNotFoundException(String message) {
        super(message);
    }
    
    public AirlineNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public AirlineNotFoundException(Long airlineId) {
        super("Airline not found with ID: " + airlineId);
    }
    
    public AirlineNotFoundException(String iataCode, boolean byCode) {
        super("Airline not found with IATA code: " + iataCode);
    }
}
