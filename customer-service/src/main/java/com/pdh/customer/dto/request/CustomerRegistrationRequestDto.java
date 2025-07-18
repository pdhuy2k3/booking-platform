package com.pdh.customer.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

/**
 * DTO for customer registration requests
 * Used for both storefront and backoffice customer creation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerRegistrationRequestDto {
    
    /**
     * Personal information
     */
    @NotBlank(message = "First name is required")
    @Size(max = 50, message = "First name must not exceed 50 characters")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    @Size(max = 50, message = "Last name must not exceed 50 characters")
    private String lastName;
    
    @Email(message = "Valid email is required")
    @NotBlank(message = "Email is required")
    private String email;
    
    @NotBlank(message = "Phone number is required")
    private String phone;
    
    @Past(message = "Date of birth must be in the past")
    private LocalDate dateOfBirth;
    
    private String title; // Mr, Mrs, Ms, Dr, etc.
    private String nationality;
    
    /**
     * Address information
     */
    private String address;
    private String city;
    private String state;
    private String country;
    private String postalCode;
    
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
     * Nested DTO for travel preferences
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TravelPreferencesDto {
        
        private String preferredSeatClass; // ECONOMY, BUSINESS, FIRST
        private String preferredMealType; // VEGETARIAN, HALAL, KOSHER, etc.
        private String preferredRoomType; // SINGLE, DOUBLE, SUITE
        private Boolean smokingPreference;
        private String specialAssistance;
        private String loyaltyPrograms; // Comma-separated airline/hotel loyalty numbers
    }
}
