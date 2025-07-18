package com.pdh.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for hotel reservation data in saga events
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelReservationData {
    private String hotelId;
    private String roomId;
    private String reservationId;
    private String checkInDate;
    private String checkOutDate;
    private Integer guests;
    private Integer rooms;
    private BigDecimal amount;
}
