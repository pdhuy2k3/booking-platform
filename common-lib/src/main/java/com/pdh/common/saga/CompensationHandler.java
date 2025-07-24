package com.pdh.common.saga;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

/**
 * Compensation Handler - Centralized in common-lib
 * Handles compensation logic and retry strategies for saga operations
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CompensationHandler {

    /**
     * Determines the appropriate compensation strategy based on the failure context
     */
    public CompensationStrategy determineStrategy(String operation, String errorCode, int retryCount) {
        log.debug("Determining compensation strategy for operation: {}, errorCode: {}, retryCount: {}", 
            operation, errorCode, retryCount);
        
        // Critical operations require immediate compensation
        if (isCriticalOperation(operation)) {
            return CompensationStrategy.IMMEDIATE;
        }
        
        // Network/timeout errors can be retried
        if (isRetryableError(errorCode) && retryCount < 3) {
            return CompensationStrategy.RETRY_THEN_COMPENSATE;
        }
        
        // Payment operations need careful handling
        if (isPaymentOperation(operation)) {
            return CompensationStrategy.RETRY_THEN_COMPENSATE;
        }
        
        // Inventory operations can use best effort
        if (isInventoryOperation(operation)) {
            return CompensationStrategy.BEST_EFFORT;
        }
        
        // Default strategy
        return CompensationStrategy.IMMEDIATE;
    }
    
    /**
     * Calculates retry delay based on attempt count (exponential backoff)
     */
    public Duration calculateRetryDelay(int retryCount) {
        // Exponential backoff: 1s, 2s, 4s, 8s, etc.
        long delaySeconds = Math.min(1L << retryCount, 60L); // Max 60 seconds
        return Duration.ofSeconds(delaySeconds);
    }
    
    /**
     * Calculates compensation priority based on operation and context
     */
    public int calculatePriority(String operation, String errorCode, Instant failureTime) {
        int basePriority = 5; // Default priority
        
        // Critical operations get higher priority
        if (isCriticalOperation(operation)) {
            basePriority += 3;
        }
        
        // Payment operations get higher priority
        if (isPaymentOperation(operation)) {
            basePriority += 2;
        }
        
        // Older failures get higher priority
        Duration age = Duration.between(failureTime, Instant.now());
        if (age.toMinutes() > 30) {
            basePriority += 2;
        } else if (age.toMinutes() > 10) {
            basePriority += 1;
        }
        
        // Critical errors get higher priority
        if (isCriticalError(errorCode)) {
            basePriority += 2;
        }
        
        return Math.min(basePriority, 10); // Max priority is 10
    }
    
    /**
     * Executes compensation with retry logic
     */
    public CompletableFuture<Boolean> executeCompensation(
            CompensationContext context, 
            CompensationExecutor executor) {
        
        log.info("Executing compensation for saga: {}, operation: {}, strategy: {}", 
            context.getSagaId(), context.getFailedOperation(), context.getStrategy());
        
        return CompletableFuture.supplyAsync(() -> {
            try {
                switch (context.getStrategy()) {
                    case IMMEDIATE:
                        return executeImmediateCompensation(context, executor);
                    
                    case RETRY_THEN_COMPENSATE:
                        return executeRetryThenCompensate(context, executor);
                    
                    case BEST_EFFORT:
                        return executeBestEffortCompensation(context, executor);
                    
                    case MANUAL:
                        return scheduleManualCompensation(context);
                    
                    case NONE:
                        log.info("No compensation required for saga: {}", context.getSagaId());
                        return true;
                    
                    default:
                        log.warn("Unknown compensation strategy: {}", context.getStrategy());
                        return false;
                }
            } catch (Exception e) {
                log.error("Error executing compensation for saga: {}", context.getSagaId(), e);
                return false;
            }
        });
    }
    
    /**
     * Executes immediate compensation
     */
    private boolean executeImmediateCompensation(CompensationContext context, CompensationExecutor executor) {
        try {
            return executor.compensate(context);
        } catch (Exception e) {
            log.error("Immediate compensation failed for saga: {}", context.getSagaId(), e);
            return false;
        }
    }
    
    /**
     * Executes retry then compensate strategy
     */
    private boolean executeRetryThenCompensate(CompensationContext context, CompensationExecutor executor) {
        if (context.shouldRetry()) {
            log.info("Attempting retry {} for saga: {}", context.getRetryCount() + 1, context.getSagaId());
            
            try {
                // Wait for retry delay
                Duration delay = calculateRetryDelay(context.getRetryCount());
                TimeUnit.MILLISECONDS.sleep(delay.toMillis());
                
                // Attempt retry
                if (executor.retry(context)) {
                    log.info("Retry successful for saga: {}", context.getSagaId());
                    return true;
                }
                
                // Retry failed, increment count and try again or compensate
                context.incrementRetry();
                if (context.shouldRetry()) {
                    return executeRetryThenCompensate(context, executor);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.warn("Retry interrupted for saga: {}", context.getSagaId());
            } catch (Exception e) {
                log.error("Retry failed for saga: {}", context.getSagaId(), e);
            }
        }
        
        // All retries exhausted, perform compensation
        log.info("Retries exhausted, performing compensation for saga: {}", context.getSagaId());
        return executeImmediateCompensation(context, executor);
    }
    
    /**
     * Executes best effort compensation
     */
    private boolean executeBestEffortCompensation(CompensationContext context, CompensationExecutor executor) {
        try {
            return executor.compensate(context);
        } catch (Exception e) {
            log.warn("Best effort compensation failed for saga: {}, continuing anyway", context.getSagaId(), e);
            return true; // Return true for best effort - we tried our best
        }
    }
    
    /**
     * Schedules manual compensation
     */
    private boolean scheduleManualCompensation(CompensationContext context) {
        log.warn("Manual compensation required for saga: {}, operation: {}, reason: {}", 
            context.getSagaId(), context.getFailedOperation(), context.getFailureReason());
        
        // In a real system, this would create a manual task/ticket
        // For now, we just log it
        return true;
    }
    
    // Helper methods for operation classification
    
    private boolean isCriticalOperation(String operation) {
        return operation != null && (
            operation.contains("PAYMENT") || 
            operation.contains("CONFIRM") ||
            operation.equals("PROCESS_PAYMENT")
        );
    }
    
    private boolean isPaymentOperation(String operation) {
        return operation != null && (
            operation.contains("PAYMENT") || 
            operation.contains("REFUND") ||
            operation.equals("PROCESS_PAYMENT")
        );
    }
    
    private boolean isInventoryOperation(String operation) {
        return operation != null && (
            operation.contains("RESERVE") || 
            operation.contains("INVENTORY")
        );
    }
    
    private boolean isRetryableError(String errorCode) {
        return errorCode != null && (
            errorCode.contains("TIMEOUT") ||
            errorCode.contains("CONNECTION") ||
            errorCode.contains("SERVICE_UNAVAILABLE") ||
            errorCode.equals("INVENTORY_SERVICE_UNAVAILABLE")
        );
    }
    
    private boolean isCriticalError(String errorCode) {
        return errorCode != null && (
            errorCode.contains("PAYMENT_FAILED") ||
            errorCode.contains("FRAUD") ||
            errorCode.contains("SECURITY")
        );
    }
    
    /**
     * Interface for compensation execution
     */
    public interface CompensationExecutor {
        boolean compensate(CompensationContext context);
        boolean retry(CompensationContext context);
    }
}
