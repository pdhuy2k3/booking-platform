package com.pdh.flight.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for flight reservation data in saga events
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlightReservationData {
    private String flightId;
    private String reservationId;
    private String departureDate;
    private String returnDate;
    private Integer passengers;
    private String seatClass;
    private BigDecimal amount;
}
