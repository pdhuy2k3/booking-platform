package com.pdh.booking.model.dto.request;

import java.time.LocalDate;
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
 * Payload describing a storefront hotel selection.
 * The storefront sends identifiers and user-supplied data,
 * while the booking service enriches the remaining details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorefrontHotelSelectionRequestDto {

    /**
     * Selected hotel identifier (as provided by hotel service).
     */
    @NotBlank(message = "Hotel ID is required")
    private String hotelId;

    /**
     * Selected room type identifier.
     */
    @NotBlank(message = "Room type ID is required")
    private String roomTypeId;

    /**
     * Selected concrete room identifier (optional).
     */
    private String roomId;

    /**
     * Selected availability identifier (optional, used for inventory tracking).
     */
    private String roomAvailabilityId;

    /**
     * Check-in date.
     */
    @NotNull(message = "Check-in date is required")
    private LocalDate checkInDate;

    /**
     * Check-out date.
     */
    @NotNull(message = "Check-out date is required")
    private LocalDate checkOutDate;

    /**
     * Total nights calculated on storefront.
     */
    @NotNull(message = "Number of nights is required")
    @Min(value = 1, message = "Number of nights must be at least 1")
    private Integer numberOfNights;

    /**
     * Number of rooms requested.
     */
    @NotNull(message = "Number of rooms is required")
    @Min(value = 1, message = "Number of rooms must be at least 1")
    private Integer numberOfRooms;

    /**
     * Number of guests in total.
     */
    @NotNull(message = "Number of guests is required")
    @Min(value = 1, message = "Number of guests must be at least 1")
    private Integer numberOfGuests;

    /**
     * Guest manifests captured on the storefront.
     */
    @NotNull(message = "Guest details are required")
    @Valid
    private List<GuestDetailsDto> guests;

    /**
     * Room price per night recorded on storefront.
     */
    @NotNull(message = "Price per night is required")
    @Min(value = 0, message = "Price per night must be positive")
    private Double pricePerNight;

    /**
     * Total room price for the stay.
     */
    @NotNull(message = "Total room price is required")
    @Min(value = 0, message = "Total room price must be positive")
    private Double totalRoomPrice;

    /**
     * Preferred bed type.
     */
    private String bedType;

    /**
     * Selected room amenities (optional references).
     */
    private List<String> amenities;

    /**
     * Additional services requested.
     */
    private List<HotelServiceDto> additionalServices;

    /**
     * Additional notes or requests for the stay.
     */
    private String specialRequests;

    /**
     * Specific cancellation policy snapshot selected on storefront.
     */
    private String cancellationPolicy;
}

