package com.pdh.booking.query;

import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.model.enums.BookingType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Query to get user's bookings with filtering
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GetUserBookingsQuery {
    
    @NotNull(message = "User ID is required")
    private UUID userId;
    
    private BookingType bookingType;
    private BookingStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    @Builder.Default
    private int page = 0;
    @Builder.Default
    private int size = 20;
}
