package com.pdh.booking.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.Valid;

/**
 * DTO for combo booking details (Flight + Hotel)
 * Contains both flight and hotel information for package deals
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComboBookingDetailsDto {
    
    /**
     * Flight booking details
     */
    @NotNull(message = "Flight details are required for combo booking")
    @Valid
    private FlightBookingDetailsDto flightDetails;
    
    /**
     * Hotel booking details
     */
    @NotNull(message = "Hotel details are required for combo booking")
    @Valid
    private HotelBookingDetailsDto hotelDetails;
    
    /**
     * Combo discount amount (if any)
     */
    private Double comboDiscount;
    
    /**
     * Combo package name
     */
    private String packageName;
    
    /**
     * Special combo offers or benefits
     */
    private String comboOffers;
}
