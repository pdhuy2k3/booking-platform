package com.pdh.booking.model.dto.request;

import java.time.LocalDateTime;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload describing a storefront flight selection.
 * Clients send only identifiers plus pricing and passenger data; the booking service
 * enriches the remaining details via internal service calls.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorefrontFlightSelectionRequestDto {

    /**
     * Selected flight identifier (as provided by flight service).
     */
    @NotBlank(message = "Flight ID is required")
    private String flightId;

    /**
     * Selected schedule identifier (optional but recommended for accuracy).
     */
    private String scheduleId;

    /**
     * Selected fare identifier (optional).
     */
    private String fareId;

    /**
     * Requested seat class (ECONOMY, BUSINESS, etc.).
     */
    private String seatClass;

    /**
     * Departure timestamp supplied by client (fallback if remote lookup fails).
     */
    private LocalDateTime departureDateTime;

    /**
     * Arrival timestamp supplied by client (fallback if remote lookup fails).
     */
    private LocalDateTime arrivalDateTime;

    /**
     * Number of passengers in the booking.
     */
    @NotNull(message = "Passenger count is required")
    @Min(value = 1, message = "Passenger count must be at least 1")
    private Integer passengerCount;

    /**
     * Passenger manifests captured on the storefront.
     */
    @NotNull(message = "Passenger details are required")
    @Valid
    private List<PassengerDetailsDto> passengers;

    /**
     * Selected seat numbers (optional).
     */
    private List<String> selectedSeats;

    /**
     * Optional extra services (baggage, meals, etc.).
     */
    private List<FlightServiceDto> additionalServices;

    /**
     * Additional notes or requests for the flight.
     */
    private String specialRequests;

    /**
     * Price per passenger recorded on the storefront (used for audit/comparison).
     */
    private Double pricePerPassenger;

    /**
     * Total flight price for all passengers.
     */
    @NotNull(message = "Total flight price is required")
    @Min(value = 0, message = "Total flight price must be positive")
    private Double totalFlightPrice;
}

