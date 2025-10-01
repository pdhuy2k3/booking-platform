package com.pdh.hotel.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
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
@JsonIgnoreProperties(ignoreUnknown = true)
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
     * Selected room type ID (from booking-service)
     */
    @JsonProperty("roomTypeId")
    private String roomTypeId;

    /**
     * Room type (Standard, Deluxe, Suite, etc.)
     */
    private String roomType;

    /**
     * Selected room ID (optional, if specific room allocated)
     */
    private String roomId;
    
    /**
     * Room name/description
     */
    private String roomName;
    
    /**
     * Check-in date
     */
    @JsonProperty("checkInDate")
    @JsonFormat(shape = JsonFormat.Shape.ARRAY)
    private LocalDate checkInDate;
    
    /**
     * Check-out date
     */
    @JsonProperty("checkOutDate")
    @JsonFormat(shape = JsonFormat.Shape.ARRAY)
    private LocalDate checkOutDate;
    
    /**
     * Number of nights
     */
    @JsonProperty("numberOfNights")
    private Integer numberOfNights;

    /**
     * Number of guests
     */
    @JsonProperty("numberOfGuests")
    private Integer numberOfGuests;

    /**
     * Number of rooms
     */
    @JsonProperty("numberOfRooms")
    private Integer numberOfRooms;

    /**
     * Guest information
     */
    @JsonProperty("guests")
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
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class GuestDto {
        @JsonProperty("guestType")
        private String guestType;

        private String title;
        private String firstName;
        private String lastName;
        @JsonFormat(shape = JsonFormat.Shape.ARRAY)
        private LocalDate dateOfBirth;

        @JsonProperty("gender")
        private String gender;

        private String email;

        @JsonProperty("phoneNumber")
        private String phone;

        private String nationality;

        @JsonProperty("idNumber")
        private String passportNumber;

        private String specialRequests;

        @JsonProperty("isPrimaryGuest")
        private Boolean isPrimaryGuest;

        @JsonProperty("loyaltyNumber")
        private String loyaltyNumber;
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
