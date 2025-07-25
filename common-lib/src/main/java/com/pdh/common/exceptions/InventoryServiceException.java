package com.pdh.common.exceptions;

/**
 * Exception thrown when inventory service operations fail
 * Follows existing common-lib exception patterns for consistency
 * 
 * This exception is used to indicate failures in inventory-related
 * operations such as availability checks, reservations, or releases.
 */
public class InventoryServiceException extends RuntimeException {
    
    private final String serviceType;
    private final String operation;

    public InventoryServiceException(String message) {
        super(message);
        this.serviceType = null;
        this.operation = null;
    }
    
    public InventoryServiceException(String message, Throwable cause) {
        super(message, cause);
        this.serviceType = null;
        this.operation = null;
    }

    public InventoryServiceException(String serviceType, String operation, String message) {
        super(String.format("[%s] %s failed: %s", serviceType, operation, message));
        this.serviceType = serviceType;
        this.operation = operation;
    }

    public InventoryServiceException(String serviceType, String operation, String message, Throwable cause) {
        super(String.format("[%s] %s failed: %s", serviceType, operation, message), cause);
        this.serviceType = serviceType;
        this.operation = operation;
    }

    public String getServiceType() {
        return serviceType;
    }

    public String getOperation() {
        return operation;
    }

    /**
     * Creates an exception for flight inventory operations
     */
    public static InventoryServiceException flightInventory(String operation, String message) {
        return new InventoryServiceException("FLIGHT", operation, message);
    }

    /**
     * Creates an exception for hotel inventory operations
     */
    public static InventoryServiceException hotelInventory(String operation, String message) {
        return new InventoryServiceException("HOTEL", operation, message);
    }

    /**
     * Creates an exception for flight inventory operations with cause
     */
    public static InventoryServiceException flightInventory(String operation, String message, Throwable cause) {
        return new InventoryServiceException("FLIGHT", operation, message, cause);
    }

    /**
     * Creates an exception for hotel inventory operations with cause
     */
    public static InventoryServiceException hotelInventory(String operation, String message, Throwable cause) {
        return new InventoryServiceException("HOTEL", operation, message, cause);
    }
}
