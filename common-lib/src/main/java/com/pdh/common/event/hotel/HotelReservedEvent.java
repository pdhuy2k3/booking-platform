package com.pdh.common.event.hotel;

import com.pdh.common.event.DomainEvent;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
public class HotelReservedEvent extends DomainEvent {
    
    private String aggregateId;
    private String aggregateType = "Booking";
    private String hotelId;
    private String roomId;
    private String bookingReference;
    private String reservationId;
    private LocalDate checkInDate;
    private LocalDate checkOutDate;
    private Integer guestCount;
    private BigDecimal reservationAmount;
    private String roomType;
    
    public HotelReservedEvent() {
        super();
    }
    
    public HotelReservedEvent(String aggregateId, String hotelId, String roomId, String bookingReference, 
                             String reservationId, LocalDate checkInDate, LocalDate checkOutDate, 
                             Integer guestCount, BigDecimal reservationAmount) {
        super();
        this.aggregateId = aggregateId;
        this.hotelId = hotelId;
        this.roomId = roomId;
        this.bookingReference = bookingReference;
        this.reservationId = reservationId;
        this.checkInDate = checkInDate;
        this.checkOutDate = checkOutDate;
        this.guestCount = guestCount;
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
