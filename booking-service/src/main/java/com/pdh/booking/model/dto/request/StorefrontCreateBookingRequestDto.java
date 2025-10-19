package com.pdh.booking.model.dto.request;

import com.pdh.booking.model.enums.BookingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO for creating a new booking from Storefront
 * Uses frontend-compatible data types (String for IDs, double for amounts)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorefrontCreateBookingRequestDto {
    
 

    /**
     * Type of booking (FLIGHT, HOTEL, COMBO, etc.)
     */
    @NotNull(message = "Booking type is required")
    private BookingType bookingType;
    
    /**
     * Total amount as double (frontend-compatible)
     */
    @NotNull(message = "Total amount is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Total amount must be greater than 0")
    private Double totalAmount;
    
    /**
     * Currency code (default: VND)
     */
    @Size(min = 3, max = 3, message = "Currency must be 3 characters")
    @Builder.Default
    private String currency = "VND";
    
    /**
     * Selected flight payload (required for FLIGHT and COMBO bookings)
     */
    @Valid
    private StorefrontFlightSelectionRequestDto flightSelection;

    /**
     * Selected hotel payload (required for HOTEL and COMBO bookings)
     */
    @Valid
    private StorefrontHotelSelectionRequestDto hotelSelection;

    /**
     * Optional combo discount amount when booking both flight and hotel
     */
    private Double comboDiscount;

    /**
     * Additional notes or special requests
     */
    private String notes;

    /**
     * Booking source (STOREFRONT)
     */
    @Builder.Default
    private String bookingSource = "STOREFRONT";
}
