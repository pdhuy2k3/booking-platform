package com.pdh.common.event.hotel;

import com.pdh.common.event.DomainEvent;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class HotelReservationFailedEvent extends DomainEvent {
    
    private String aggregateId;
    private String aggregateType = "Booking";
    private String hotelId;
    private String roomId;
    private String bookingReference;
    private String failureReason;
    private String errorCode;
    
    public HotelReservationFailedEvent() {
        super();
    }
    
    public HotelReservationFailedEvent(String aggregateId, String hotelId, String roomId, 
                                      String bookingReference, String failureReason, String errorCode) {
        super();
        this.aggregateId = aggregateId;
        this.hotelId = hotelId;
        this.roomId = roomId;
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
