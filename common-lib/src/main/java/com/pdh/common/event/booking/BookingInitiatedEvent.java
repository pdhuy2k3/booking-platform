package com.pdh.common.event.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Event published when booking is initiated
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingInitiatedEvent {
    private UUID bookingId;
    private String sagaId;
    private UUID userId;
    private String bookingReference;
    private String bookingType; // Will use String instead of enum to avoid cross-module dependency
    private BigDecimal totalAmount;
    private String currency;
    private ZonedDateTime timestamp;
}
