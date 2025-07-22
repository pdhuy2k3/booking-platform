package com.pdh.customer.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProfileRequest {
    
    @Past(message = "Date of birth must be in the past")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate dateOfBirth;
    
    @Size(max = 100, message = "Nationality must not exceed 100 characters")
    private String nationality;
    
    @Size(max = 50, message = "Passport number must not exceed 50 characters")
    private String passportNumber;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate passportExpiry;
    
    @Size(max = 100, message = "Passport issuing country must not exceed 100 characters")
    private String passportIssuingCountry;
    
    @Pattern(regexp = "^(Male|Female|Other|Prefer not to say)$", message = "Gender must be Male, Female, Other, or Prefer not to say")
    private String gender;
    
    @Size(max = 100, message = "Occupation must not exceed 100 characters")
    private String occupation;
    
    @Size(max = 255, message = "Emergency contact name must not exceed 255 characters")
    private String emergencyContactName;
    
    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Invalid phone number format")
    private String emergencyContactPhone;
    
    @Size(max = 100, message = "Emergency contact relationship must not exceed 100 characters")
    private String emergencyContactRelationship;
    
    @Pattern(regexp = "^[a-z]{2}(-[A-Z]{2})?$", message = "Invalid language code format (e.g., en, vi, en-US)")
    private String preferredLanguage;
    
    @Pattern(regexp = "^[A-Z]{3}$", message = "Currency must be a 3-letter ISO code (e.g., USD, VND)")
    private String preferredCurrency;
    
    @Size(max = 50, message = "Timezone must not exceed 50 characters")
    private String timezone;
}
