package com.pdh.booking.saga;

import com.pdh.booking.model.Booking;
import com.pdh.common.event.DomainEvent;
import com.pdh.common.saga.SagaState;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Legacy Booking Saga State Machine 
 * 
 * This class has been superseded by BookingSagaOrchestrator which provides
 * a more modern event-driven approach using Kafka + Debezium.
 * 
 * @deprecated Use BookingSagaOrchestrator instead
 * @see BookingSagaOrchestrator
 */
@Component
@Slf4j
@Deprecated
public class BookingSagaStateMachine {
    
    /**
     * @deprecated This logic has been moved to BookingSagaOrchestrator
     */
    @Deprecated
    public SagaState processEvent(SagaState currentState, DomainEvent event) {
        log.warn("BookingSagaStateMachine is deprecated. Use BookingSagaOrchestrator instead.");
        return currentState;
    }
    
    /**
     * @deprecated This logic has been moved to BookingSagaOrchestrator  
     */
    @Deprecated
    public void executeAction(SagaState state, Booking booking, DomainEvent triggerEvent) {
        log.warn("BookingSagaStateMachine is deprecated. Use BookingSagaOrchestrator instead.");
    }
}
