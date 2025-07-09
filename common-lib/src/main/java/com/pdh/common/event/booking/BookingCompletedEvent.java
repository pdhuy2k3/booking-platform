package com.pdh.common.event.booking;

import com.pdh.common.event.DomainEvent;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class BookingCompletedEvent extends DomainEvent {
    private String bookingId;
    private String customerId;
    private String confirmationNumber;
    
    @Override
    public String getAggregateId() {
        return bookingId;
    }
    
    @Override
    public String getAggregateType() {
        return "Booking";
    }
}
