package com.pdh.common.event.flight;

import com.pdh.common.event.DomainEvent;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class FlightReservationFailedEvent extends DomainEvent {
    
    private String aggregateId;
    private String aggregateType = "Booking";
    private String flightId;
    private String bookingReference;
    private String failureReason;
    private String errorCode;
    
    public FlightReservationFailedEvent() {
        super();
    }
    
    public FlightReservationFailedEvent(String aggregateId, String flightId, String bookingReference, 
                                       String failureReason, String errorCode) {
        super();
        this.aggregateId = aggregateId;
        this.flightId = flightId;
        this.bookingReference = bookingReference;
        this.failureReason = failureReason;
        this.errorCode = errorCode;
    }
    
    @Override
    public String getAggregateId() {
        return aggregateId;
    }
    
    @Override
    public String getAggregateType() {
        return aggregateType;
    }
}
