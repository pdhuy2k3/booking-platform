package com.pdh.customer.viewmodel;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * Partner application form from public-facing partner registration page
 */
public record PartnerApplicationVm(
        @NotBlank String businessName,
        @NotBlank String contactPersonName,
        @NotBlank @Email String email,
        @NotBlank String phoneNumber,
        @NotBlank String businessAddress,
        @NotBlank String city,
        @NotBlank String country,
        
        @NotNull @Pattern(regexp = "HOTEL|TRANSPORT|ACTIVITY")
        String partnerType,
        
        String businessRegistrationNumber,
        String taxId,
        String website,
        String description,
        
        // Hotel-specific fields (optional)
        Integer starRating,
        Integer totalRooms,
        String hotelChain,
        
        // Transport-specific fields (optional)
        String vehicleTypes,
        String serviceAreas,
        
        // Activity-specific fields (optional)
        String activityTypes,
        String operatingSchedule
) {
}
