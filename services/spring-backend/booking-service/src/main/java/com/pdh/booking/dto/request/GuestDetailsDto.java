package com.pdh.booking.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

/**
 * DTO for guest details in hotel booking
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestDetailsDto {
    
    /**
     * Guest type (PRIMARY, ADDITIONAL)
     */
    @NotBlank(message = "Guest type is required")
    private String guestType;
    
    /**
     * Title (Mr, Mrs, Ms, Dr, etc.)
     */
    @NotBlank(message = "Title is required")
    private String title;
    
    /**
     * First name
     */
    @NotBlank(message = "First name is required")
    private String firstName;
    
    /**
     * Last name
     */
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    /**
     * Date of birth
     */
    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;
    
    /**
     * Gender (M/F)
     */
    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "^(M|F)$", message = "Gender must be M or F")
    private String gender;
    
    /**
     * Nationality (country code)
     */
    @NotBlank(message = "Nationality is required")
    private String nationality;
    
    /**
     * ID/Passport number
     */
    private String idNumber;
    
    /**
     * Contact email (for primary guest)
     */
    @Email(message = "Valid email is required")
    private String email;
    
    /**
     * Contact phone number (for primary guest)
     */
    private String phoneNumber;
    
    /**
     * Loyalty program number (optional)
     */
    private String loyaltyNumber;
    
    /**
     * Special requests for this guest
     */
    private String specialRequests;
}
