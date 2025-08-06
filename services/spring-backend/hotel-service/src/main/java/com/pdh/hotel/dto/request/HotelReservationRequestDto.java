package com.pdh.hotel.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO for hotel reservation requests (internal service communication)
 * Used when booking service calls hotel service to reserve rooms
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HotelReservationRequestDto {
    
    /**
     * Booking ID from booking service
     */
    @NotBlank(message = "Booking ID is required")
    private String bookingId;
    
    /**
     * Saga ID for tracking
     */
    @NotBlank(message = "Saga ID is required")
    private String sagaId;
    
    /**
     * Customer ID
     */
    @NotBlank(message = "Customer ID is required")
    private String customerId;
    
    /**
     * Hotel ID to reserve
     */
    @NotBlank(message = "Hotel ID is required")
    private String hotelId;
    
    /**
     * Room ID to reserve
     */
    @NotBlank(message = "Room ID is required")
    private String roomId;
    
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
     * Number of guests
     */
    @NotNull(message = "Number of guests is required")
    private Integer guests;
    
    /**
     * Number of rooms
     */
    @NotNull(message = "Number of rooms is required")
    private Integer rooms;
    
    /**
     * Guest information
     */
    @NotNull(message = "Guest information is required")
    private List<GuestDto> guestDetails;
    
    /**
     * Special requests or notes
     */
    private String specialRequests;
    
    /**
     * Room preferences
     */
    private RoomPreferences roomPreferences;
    
    /**
     * Nested DTO for guest information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GuestDto {
        
        @NotBlank(message = "First name is required")
        private String firstName;
        
        @NotBlank(message = "Last name is required")
        private String lastName;
        
        @NotNull(message = "Date of birth is required")
        private LocalDate dateOfBirth;
        
        private String title; // Mr, Mrs, Ms, Dr, etc.
        
        private String email;
        
        private String phone;
        
        @NotBlank(message = "Nationality is required")
        private String nationality;
        
        private String passportNumber;
        
        private String specialRequests;
        
        private Boolean isPrimaryGuest;
    }
    
    /**
     * Nested DTO for room preferences
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoomPreferences {
        
        private String bedType; // Single, Double, Twin, King, Queen
        
        private String floorPreference; // High, Low, Middle
        
        private String viewPreference; // Sea, City, Garden, Mountain
        
        private Boolean smokingRoom;
        
        private Boolean accessibleRoom;
        
        private Boolean quietRoom;
        
        private List<String> additionalAmenities;
        
        private String arrivalTime; // Expected arrival time
        
        private String departureTime; // Expected departure time
    }
}
