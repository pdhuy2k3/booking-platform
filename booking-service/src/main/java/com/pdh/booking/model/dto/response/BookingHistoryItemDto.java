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
}
