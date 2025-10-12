package com.pdh.booking.model.dto.response;

import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.model.enums.BookingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Lightweight projection representing a single booking in a user's history.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingHistoryItemDto {

    private String bookingId;
    private String bookingReference;
    private BookingType bookingType;
    private BookingStatus status;
    private String sagaState;
    private BigDecimal totalAmount;
    private String currency;
    private String createdAt;
    private String updatedAt;
    private String productSummary;
    private String confirmationNumber;
    private String productDetailsJson;
    private String sagaId;
    private Double originLatitude;
    private Double originLongitude;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private Double hotelLatitude;
    private Double hotelLongitude;
    private String reservationLockedAt;
    private String reservationExpiresAt;
}
