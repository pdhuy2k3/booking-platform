package com.pdh.common.outbox.service;

/**
 * Common interface for outbox event publishing
 * Each service should implement this interface with their specific outbox entity
 */
public interface OutboxEventService {
    
    /**
     * Publish an event to the outbox table
     * 
     * @param eventType The type of event (e.g., "FlightReserved", "HotelBooked")
     * @param aggregateType The type of aggregate (e.g., "Flight", "Hotel", "Booking")
     * @param aggregateId The ID of the aggregate
     * @param eventPayload The event payload as object (will be serialized to JSON)
     */
    void publishEvent(String eventType, String aggregateType, String aggregateId, Object eventPayload);

    /**
     * Process any queued events that have not yet been delivered. Default is a no-op.
     */
    default void processUnprocessedEvents() {
        // Optional operation
    }

    /**
     * Retry delivery for events that previously failed. Default is a no-op.
     */
    default void processRetryableEvents() {
        // Optional operation
    }

    /**
     * Remove processed events older than the implementation-defined retention window.
     */
    default void cleanupOldEvents() {
        // Optional operation
    }

    /**
     * Remove events whose retry window has expired.
     */
    default void cleanupExpiredEvents() {
        // Optional operation
    }

    /**
     * Retrieve simple Health/diagnostic statistics for the outbox implementation.
     */
    default OutboxStatistics getStatistics() {
        return OutboxStatistics.EMPTY;
    }

    /**
     * Simple value object for reporting counts from an outbox implementation.
     */
    final class OutboxStatistics {
        public static final OutboxStatistics EMPTY = new OutboxStatistics(0, 0);

        private final long unprocessedCount;
        private final long failedCount;

        public OutboxStatistics(long unprocessedCount, long failedCount) {
            this.unprocessedCount = unprocessedCount;
            this.failedCount = failedCount;
        }

        public long getUnprocessedCount() {
            return unprocessedCount;
        }

        public long getFailedCount() {
            return failedCount;
        }

        public boolean hasFailures() {
            return failedCount > 0;
        }

        @Override
        public String toString() {
            return "OutboxStatistics{" +
                "unprocessed=" + unprocessedCount +
                ", failed=" + failedCount +
                '}';
        }
    }
}
