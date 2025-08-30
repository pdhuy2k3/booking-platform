package com.pdh.flight.exception;

/**
 * Exception thrown when an airport is not found
 */
public class AirportNotFoundException extends RuntimeException {
    
    public AirportNotFoundException(String message) {
        super(message);
    }
    
    public AirportNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public AirportNotFoundException(Long airportId) {
        super("Airport not found with ID: " + airportId);
    }
    
    public AirportNotFoundException(String iataCode, boolean byCode) {
        super("Airport not found with IATA code: " + iataCode);
    }
}
