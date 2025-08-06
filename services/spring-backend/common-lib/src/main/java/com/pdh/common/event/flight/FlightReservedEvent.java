package com.pdh.common.event.flight;

import com.pdh.common.event.DomainEvent;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
public class FlightReservedEvent extends DomainEvent {
    
    private String aggregateId;
    private String aggregateType = "Booking";
    private String flightId;
    private String bookingReference;
    private String reservationId;
    private Integer passengerCount;
    private BigDecimal reservationAmount;
    private ZonedDateTime departureTime;
    private ZonedDateTime arrivalTime;
    private String seatClass;
    
    public FlightReservedEvent() {
        super();
    }
    
    public FlightReservedEvent(String aggregateId, String flightId, String bookingReference, 
                              String reservationId, Integer passengerCount, BigDecimal reservationAmount) {
        super();
        this.aggregateId = aggregateId;
        this.flightId = flightId;
        this.bookingReference = bookingReference;
        this.reservationId = reservationId;
        this.passengerCount = passengerCount;
        this.reservationAmount = reservationAmount;
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
