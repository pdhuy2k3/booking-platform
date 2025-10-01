package com.pdh.booking.model.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for hotel booking details
 * Contains all information about the selected hotel and room
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelBookingDetailsDto {
    
    /**
     * Selected hotel ID from hotel service
     */
    @NotBlank(message = "Hotel ID is required")
    private String hotelId;
    
    /**
     * Hotel name
     */
    @NotBlank(message = "Hotel name is required")
    private String hotelName;
    
    /**
     * Hotel address
     */
    @NotBlank(message = "Hotel address is required")
    private String hotelAddress;
    
    /**
     * Hotel city
     */
    @NotBlank(message = "Hotel city is required")
    private String city;
    
    /**
     * Hotel country
     */
    @NotBlank(message = "Hotel country is required")
    private String country;
    
    /**
     * Hotel star rating
     */
    @Min(value = 1, message = "Star rating must be at least 1")
    @Max(value = 5, message = "Star rating must be at most 5")
    private Integer starRating;
    
    /**
     * Selected room type ID
     */
    @NotBlank(message = "Room type ID is required")
    private String roomTypeId;

    /**
     * Selected room ID (optional)
     */
    private String roomId;
    
    /**
     * Room type (Standard, Deluxe, Suite, etc.)
     */
    @NotBlank(message = "Room type is required")
    private String roomType;
    
    /**
     * Room name/description
     */
    @NotBlank(message = "Room name is required")
    private String roomName;
    
    /**
     * Check-in date
     */
    @NotNull(message = "Check-in date is required")
    private LocalDate checkInDate;
    
    /**
     * Check-out date
     */
    @NotNull(message = "Check-out date is required")
    private LocalDate checkOutDate;
    
    /**
     * Number of nights
     */
    @NotNull(message = "Number of nights is required")
    @Min(value = 1, message = "At least 1 night is required")
    private Integer numberOfNights;
    
    /**
     * Number of rooms
     */
    @NotNull(message = "Number of rooms is required")
    @Min(value = 1, message = "At least 1 room is required")
    private Integer numberOfRooms;
    
    /**
     * Number of guests
     */
    @NotNull(message = "Number of guests is required")
    @Min(value = 1, message = "At least 1 guest is required")
    private Integer numberOfGuests;
    
    /**
     * Guest details
     */
    @NotNull(message = "Guest details are required")
    private List<GuestDetailsDto> guests;
    
    /**
     * Room price per night
     */
    @NotNull(message = "Room price is required")
    @Min(value = 0, message = "Room price must be positive")
    private Double pricePerNight;
    
    /**
     * Total room price (price * nights * rooms)
     */
    @NotNull(message = "Total room price is required")
    @Min(value = 0, message = "Total room price must be positive")
    private Double totalRoomPrice;
    
    /**
     * Bed type preference
     */
    private String bedType;
    
    /**
     * Room amenities
     */
    private List<String> amenities;
    
    /**
     * Additional hotel services (spa, restaurant, etc.)
     */
    private List<HotelServiceDto> additionalServices;
    
    /**
     * Special requests or notes
     */
    private String specialRequests;
    
    /**
     * Cancellation policy
     */
    private String cancellationPolicy;
}
