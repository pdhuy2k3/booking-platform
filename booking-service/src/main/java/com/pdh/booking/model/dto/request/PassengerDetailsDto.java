package com.pdh.booking.model.dto.request;

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
 * DTO for passenger details in flight booking
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PassengerDetailsDto {
    
    /**
     * Passenger type (ADULT, CHILD, INFANT)
     */
    @NotBlank(message = "Passenger type is required")
    private String passengerType;
    
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
     * Passport number
     */
    private String passportNumber;
    
    /**
     * Passport expiry date
     */
    private LocalDate passportExpiryDate;
    
    /**
     * Passport issuing country
     */
    private String passportIssuingCountry;
    
    /**
     * Contact email
     */
    @Email(message = "Valid email is required")
    private String email;
    
    /**
     * Contact phone number
     */
    private String phoneNumber;
    
    /**
     * Frequent flyer number (optional)
     */
    private String frequentFlyerNumber;
    
    /**
     * Special assistance requirements
     */
    private String specialAssistance;
    
    /**
     * Meal preference
     */
    private String mealPreference;
    
    /**
     * Seat preference
     */
    private String seatPreference;
}
