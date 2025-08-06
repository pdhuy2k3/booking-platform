package com.pdh.common.lock;

/**
 * Types of resources that can be locked
 */
public enum LockResourceType {
    
    /**
     * Flight inventory lock
     */
    FLIGHT,
    
    /**
     * Hotel inventory lock
     */
    HOTEL,
    
    /**
     * Room inventory lock
     */
    ROOM,
    
    /**
     * Seat inventory lock
     */
    SEAT,
    
    /**
     * General inventory lock
     */
    INVENTORY,
    
    /**
     * Payment processing lock
     */
    PAYMENT,
    
    /**
     * Booking process lock
     */
    BOOKING
}
