package com.pdh.customer.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO for customer profile response
 * Used for both storefront and backoffice customer information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerProfileResponseDto {
    
    /**
     * Customer identifier
     */
    private String customerId;
    
    /**
     * Personal information
     */
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private LocalDate dateOfBirth;
    private String title;
    private String nationality;
    
    /**
     * Address information
     */
    private AddressDto address;
    
    /**
     * Account information
     */
    private String accountStatus; // ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private Boolean emailVerified;
    private Boolean phoneVerified;
    
    /**
     * Preferences
     */
    private String preferredLanguage;
    private String preferredCurrency;
    private Boolean marketingOptIn;
    private Boolean newsletterOptIn;
    
    /**
     * Travel preferences
     */
    private TravelPreferencesDto travelPreferences;
    
    /**
     * Loyalty and rewards
     */
    private LoyaltyInfoDto loyaltyInfo;
    
    /**
     * Recent activity summary
     */
    private ActivitySummaryDto activitySummary;
    
    /**
     * Nested DTO for address
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressDto {
        private String street;
        private String city;
        private String state;
        private String country;
        private String postalCode;
        private String formattedAddress;
    }
    
    /**
     * Nested DTO for travel preferences
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TravelPreferencesDto {
        private String preferredSeatClass;
        private String preferredMealType;
        private String preferredRoomType;
        private Boolean smokingPreference;
        private String specialAssistance;
        private List<String> loyaltyPrograms;
    }
    
    /**
     * Nested DTO for loyalty information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoyaltyInfoDto {
        private String membershipTier; // BRONZE, SILVER, GOLD, PLATINUM
        private Integer totalPoints;
        private Integer availablePoints;
        private String nextTierRequirement;
        private LocalDate memberSince;
    }
    
    /**
     * Nested DTO for activity summary
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivitySummaryDto {
        private Integer totalBookings;
        private Integer completedBookings;
        private Integer cancelledBookings;
        private String lastBookingDate;
        private String favoriteDestination;
        private Double totalSpent;
        private String currency;
    }
}
