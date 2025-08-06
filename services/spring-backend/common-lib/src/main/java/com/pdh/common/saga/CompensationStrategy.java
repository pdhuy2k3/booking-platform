package com.pdh.common.saga;

/**
 * Compensation strategy for saga operations
 * Defines how to handle failures and rollback operations
 */
public enum CompensationStrategy {
    
    /**
     * Immediate compensation - rollback as soon as failure is detected
     */
    IMMEDIATE,
    
    /**
     * Retry with compensation - attempt retry before compensation
     */
    RETRY_THEN_COMPENSATE,
    
    /**
     * Best effort compensation - try to compensate but don't fail if compensation fails
     */
    BEST_EFFORT,
    
    /**
     * Manual compensation - requires manual intervention
     */
    MANUAL,
    
    /**
     * No compensation - just mark as failed (for non-critical operations)
     */
    NONE
}
