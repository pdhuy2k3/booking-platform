package com.pdh.common.event.booking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Event published when booking is confirmed
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingConfirmedEvent {
    private UUID bookingId;
    private String sagaId;
    private UUID userId;
    private String bookingReference;
    private String confirmationNumber;
    private ZonedDateTime timestamp;
}
