package com.pdh.flight.model.enums;

/**
 * Enumeration for flight schedule status
 * Represents the current state of a flight schedule
 */
public enum ScheduleStatus {
    /**
     * Flight is scheduled but not yet active (future flight)
     */
    SCHEDULED,
    
    /**
     * Flight is currently active (within departure window)
     */
    ACTIVE,
    
    /**
     * Flight has been delayed
     */
    DELAYED,
    
    /**
     * Flight has been cancelled
     */
    CANCELLED,
    
    /**
     * Flight has completed (arrived at destination)
     */
    COMPLETED
}