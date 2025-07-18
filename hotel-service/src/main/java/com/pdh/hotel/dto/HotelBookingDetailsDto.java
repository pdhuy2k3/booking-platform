package com.pdh.hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO for hotel booking details (Hotel Service local copy)
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
    private String hotelId;
    
    /**
     * Hotel name
     */
    private String hotelName;
    
    /**
     * Hotel address
     */
    private String hotelAddress;
    
    /**
     * Hotel city
     */
    private String city;
    
    /**
     * Hotel country
     */
    private String country;
    
    /**
     * Hotel star rating
     */
    private Integer starRating;
    
    /**
     * Selected room ID
     */
    private String roomId;
    
    /**
     * Room type (Standard, Deluxe, Suite, etc.)
     */
    private String roomType;
    
    /**
     * Room name/description
     */
    private String roomName;
    
    /**
     * Check-in date
     */
    private LocalDate checkInDate;
    
    /**
     * Check-out date
     */
    private LocalDate checkOutDate;
    
    /**
     * Number of nights
     */
    private Integer nights;
    
    /**
     * Number of guests
     */
    private Integer guests;
    
    /**
     * Number of rooms
     */
    private Integer rooms;
    
    /**
     * Guest information
     */
    private List<GuestDto> guestDetails;
    
    /**
     * Room price per night
     */
    private Double pricePerNight;
    
    /**
     * Total room price (price * nights * rooms)
     */
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
    
    /**
     * Nested DTO for guest information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GuestDto {
        private String firstName;
        private String lastName;
        private LocalDate dateOfBirth;
        private String title;
        private String email;
        private String phone;
        private String nationality;
        private String passportNumber;
        private String specialRequests;
        private Boolean isPrimaryGuest;
    }
    
    /**
     * Nested DTO for hotel services
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HotelServiceDto {
        private String serviceId;
        private String serviceName;
        private String description;
        private Double price;
        private String currency;
        private Boolean isSelected;
    }
}
