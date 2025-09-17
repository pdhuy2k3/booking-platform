package com.pdh.booking.command;

import com.pdh.booking.model.enums.BookingType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Command to create a new booking
 * This is the entry point for the booking saga orchestration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingCommand {
    
    @NotNull(message = "User ID is required")
    private UUID userId;
    
    @NotNull(message = "Booking type is required")
    private BookingType bookingType;
    
    @NotNull(message = "Total amount is required")
    @Positive(message = "Total amount must be positive")
    private BigDecimal totalAmount;
    
    @NotNull(message = "Currency is required")
    @Builder.Default
    private String currency = "VND";
    
    @NotNull(message = "Product details are required")
    private String productDetailsJson;
    
    private String notes;
    @Builder.Default
    private String bookingSource = "WEB";
    
    // For saga orchestration
    private String sagaId;
    private String correlationId;
}
