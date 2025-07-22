package com.pdh.customer.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerProfileResponse {
    
    private UUID profileId;
    private UUID userId;
    
    // Extended profile information
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;
    
    private String nationality;
    private String passportNumber;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate passportExpiry;
    
    private String passportIssuingCountry;
    private String gender;
    private String occupation;
    
    // Emergency contact
    private String emergencyContactName;
    private String emergencyContactPhone;
    private String emergencyContactRelationship;
    
    // Preferences
    private String preferredLanguage;
    private String preferredCurrency;
    private String timezone;
    
    // Audit fields
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private ZonedDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private ZonedDateTime updatedAt;
}
