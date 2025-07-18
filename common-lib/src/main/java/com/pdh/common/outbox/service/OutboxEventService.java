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
}
