package com.pdh.customer.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Customer Profile Response DTO for Storefront
 * Matches the TypeScript CustomerProfile interface exactly
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StorefrontCustomerProfileResponse {
    
    // Basic profile information (matching frontend interface)
    private String id; // profileId as string for frontend compatibility
    private String username; // From Keycloak
    private String email; // From Keycloak
    private String firstName; // From Keycloak
    private String lastName; // From Keycloak
    private String phone;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private String dateOfBirth; // As string for frontend compatibility
    
    private String nationality;
    private String passportNumber;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private String passportExpiry; // As string for frontend compatibility
    
    // Nested address object (matching frontend interface)
    private AddressInfo address;
    
    // Nested preferences object (matching frontend interface)
    private PreferencesInfo preferences;
    
    // Nested loyalty program object (matching frontend interface)
    private LoyaltyProgramInfo loyaltyProgram;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private String createdAt; // As string for frontend compatibility
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss'Z'")
    private String updatedAt; // As string for frontend compatibility
    
    private boolean isVerified;
    private boolean isActive;
    
    /**
     * Nested class for address information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressInfo {
        private String street;
        private String city;
        private String state;
        private String country;
        private String postalCode;
    }
    
    /**
     * Nested class for preferences information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PreferencesInfo {
        private String language;
        private String currency;
        private NotificationPreferences notifications;
        private boolean marketing;
        
        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class NotificationPreferences {
            private boolean email;
            private boolean sms;
            private boolean push;
        }
    }
    
    /**
     * Nested class for loyalty program information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LoyaltyProgramInfo {
        private String memberId;
        private String tier; // 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
        private int points;
        private int nextTierPoints;
    }
    
    /**
     * Factory method to create from existing CustomerProfileResponse
     */
    public static StorefrontCustomerProfileResponse fromCustomerProfileResponse(
            CustomerProfileResponse profile, 
            String username, 
            String email, 
            String firstName, 
            String lastName,
            LoyaltyBalanceResponse loyalty) {
        
        return StorefrontCustomerProfileResponse.builder()
                .id(profile.getProfileId() != null ? profile.getProfileId().toString() : null)
                .username(username)
                .email(email)
                .firstName(firstName)
                .lastName(lastName)
                .phone(null) // Not available in current profile
                .dateOfBirth(profile.getDateOfBirth() != null ? profile.getDateOfBirth().toString() : null)
                .nationality(profile.getNationality())
                .passportNumber(profile.getPassportNumber())
                .passportExpiry(profile.getPassportExpiry() != null ? profile.getPassportExpiry().toString() : null)
                .address(null) // Will be populated from addresses endpoint
                .preferences(PreferencesInfo.builder()
                        .language(profile.getPreferredLanguage())
                        .currency(profile.getPreferredCurrency())
                        .notifications(PreferencesInfo.NotificationPreferences.builder()
                                .email(true) // Default values - should come from notification preferences
                                .sms(true)
                                .push(true)
                                .build())
                        .marketing(false) // Default value - should come from notification preferences
                        .build())
                .loyaltyProgram(loyalty != null ? LoyaltyProgramInfo.builder()
                        .memberId(loyalty.getMemberId())
                        .tier(loyalty.getTier())
                        .points(loyalty.getCurrentPoints())
                        .nextTierPoints(loyalty.getNextTierPoints())
                        .build() : null)
                .createdAt(profile.getCreatedAt() != null ? profile.getCreatedAt().toString() + "Z" : null)
                .updatedAt(profile.getUpdatedAt() != null ? profile.getUpdatedAt().toString() + "Z" : null)
                .isVerified(true) // Default - should come from Keycloak
                .isActive(true) // Default - should come from Keycloak
                .build();
    }
    
    /**
     * Factory method to create with address information
     */
    public static StorefrontCustomerProfileResponse withAddress(
            StorefrontCustomerProfileResponse profile,
            java.util.List<AddressResponse> addresses) {
        
        if (addresses != null && !addresses.isEmpty()) {
            // Find default address or use first one
            AddressResponse defaultAddress = addresses.stream()
                    .filter(addr -> addr.getIsDefault() != null && addr.getIsDefault())
                    .findFirst()
                    .orElse(addresses.get(0));
            
            AddressInfo addressInfo = AddressInfo.builder()
                    .street(defaultAddress.getStreetAddress())
                    .city(defaultAddress.getCity())
                    .state(defaultAddress.getStateProvince())
                    .country(defaultAddress.getCountry())
                    .postalCode(defaultAddress.getPostalCode())
                    .build();
            
            profile.setAddress(addressInfo);
        }
        
        return profile;
    }
}
