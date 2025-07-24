package com.pdh.common.saga;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Context for compensation operations
 * Contains all necessary information to perform compensation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompensationContext {
    
    /**
     * Saga ID that requires compensation
     */
    private String sagaId;
    
    /**
     * Original operation that failed
     */
    private String failedOperation;
    
    /**
     * Reason for failure
     */
    private String failureReason;
    
    /**
     * Error code for categorization
     */
    private String errorCode;
    
    /**
     * Compensation strategy to use
     */
    private CompensationStrategy strategy;
    
    /**
     * Number of retry attempts made
     */
    @Builder.Default
    private int retryCount = 0;
    
    /**
     * Maximum retry attempts allowed
     */
    @Builder.Default
    private int maxRetries = 3;
    
    /**
     * When the failure occurred
     */
    @Builder.Default
    private Instant failureTimestamp = Instant.now();
    
    /**
     * Additional context data for compensation
     */
    @Builder.Default
    private Map<String, Object> contextData = new HashMap<>();
    
    /**
     * Operations that need to be compensated (in reverse order)
     */
    @Builder.Default
    private Map<String, Object> compensationData = new HashMap<>();
    
    /**
     * Whether this is a compensation operation itself
     */
    @Builder.Default
    private boolean isCompensation = false;
    
    /**
     * Priority of compensation (higher = more urgent)
     */
    @Builder.Default
    private int priority = 5;
    
    /**
     * Adds context data
     */
    public CompensationContext withContextData(String key, Object value) {
        this.contextData.put(key, value);
        return this;
    }
    
    /**
     * Adds compensation data
     */
    public CompensationContext withCompensationData(String operation, Object data) {
        this.compensationData.put(operation, data);
        return this;
    }
    
    /**
     * Checks if retry should be attempted
     */
    public boolean shouldRetry() {
        return strategy == CompensationStrategy.RETRY_THEN_COMPENSATE && 
               retryCount < maxRetries;
    }
    
    /**
     * Increments retry count
     */
    public void incrementRetry() {
        this.retryCount++;
    }
    
    /**
     * Checks if compensation should be attempted
     */
    public boolean shouldCompensate() {
        return strategy != CompensationStrategy.NONE && 
               strategy != CompensationStrategy.MANUAL;
    }
    
    /**
     * Checks if this is a critical failure requiring immediate attention
     */
    public boolean isCriticalFailure() {
        return strategy == CompensationStrategy.IMMEDIATE || 
               priority >= 8;
    }
    
    /**
     * Creates a compensation context for retry
     */
    public CompensationContext forRetry() {
        return CompensationContext.builder()
            .sagaId(this.sagaId)
            .failedOperation(this.failedOperation)
            .failureReason(this.failureReason)
            .errorCode(this.errorCode)
            .strategy(this.strategy)
            .retryCount(this.retryCount + 1)
            .maxRetries(this.maxRetries)
            .failureTimestamp(this.failureTimestamp)
            .contextData(new HashMap<>(this.contextData))
            .compensationData(new HashMap<>(this.compensationData))
            .isCompensation(false)
            .priority(this.priority)
            .build();
    }
    
    /**
     * Creates a compensation context for actual compensation
     */
    public CompensationContext forCompensation() {
        return CompensationContext.builder()
            .sagaId(this.sagaId)
            .failedOperation(this.failedOperation)
            .failureReason(this.failureReason)
            .errorCode(this.errorCode)
            .strategy(this.strategy)
            .retryCount(this.retryCount)
            .maxRetries(this.maxRetries)
            .failureTimestamp(this.failureTimestamp)
            .contextData(new HashMap<>(this.contextData))
            .compensationData(new HashMap<>(this.compensationData))
            .isCompensation(true)
            .priority(Math.min(this.priority + 2, 10)) // Increase priority for compensation
            .build();
    }
}
