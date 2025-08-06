package com.pdh.common.lock;

/**
 * Status of a distributed lock
 */
public enum LockStatus {
    
    /**
     * Lock request is pending
     */
    PENDING,
    
    /**
     * Lock has been successfully acquired
     */
    ACQUIRED,
    
    /**
     * Lock has been released
     */
    RELEASED,
    
    /**
     * Lock has expired
     */
    EXPIRED,
    
    /**
     * Lock acquisition failed
     */
    FAILED,
    
    /**
     * Lock was forcibly revoked
     */
    REVOKED
}
