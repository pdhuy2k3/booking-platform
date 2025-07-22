package com.pdh.booking.dto.request;

import com.pdh.booking.model.enums.BookingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.Valid;

/**
 * DTO for creating a new booking from Storefront
 * Uses frontend-compatible data types (String for IDs, double for amounts)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class    StorefrontCreateBookingRequestDto {
    
 

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
     * Product details payload (flexible based on BookingType)
     * - For FLIGHT: FlightBookingDetailsDto
     * - For HOTEL: HotelBookingDetailsDto
     * - For COMBO: ComboBookingDetailsDto (contains both flight and hotel)
     */
    @Valid
    private Object productDetails;

    /**
     * Additional notes or special requests
     */
    private String notes;

    /**
     * Payment method type for the booking
     */
    private String paymentMethodType;

    /**
     * Payment gateway preference
     */
    private String paymentGateway;

    /**
     * Booking source (STOREFRONT)
     */
    @Builder.Default
    private String bookingSource = "STOREFRONT";
}
