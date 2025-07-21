package com.pdh.customer.model;


import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "customer_profiles")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class CustomerProfile extends AbstractAuditEntity {
    
    @Id
    @Column(name = "profile_id")
    private UUID profileId = UUID.randomUUID();
    
    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId; // From Keycloak JWT token
    
    // Extended profile information
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "nationality", length = 100)
    private String nationality;
    
    @Column(name = "passport_number", length = 50)
    private String passportNumber;
    
    @Column(name = "passport_expiry")
    private LocalDate passportExpiry;
    
    @Column(name = "passport_issuing_country", length = 100)
    private String passportIssuingCountry;
    
    @Column(name = "gender", length = 20)
    private String gender;
    
    @Column(name = "occupation", length = 100)
    private String occupation;
    
    @Column(name = "emergency_contact_name", length = 255)
    private String emergencyContactName;
    
    @Column(name = "emergency_contact_phone", length = 50)
    private String emergencyContactPhone;
    
    @Column(name = "emergency_contact_relationship", length = 100)
    private String emergencyContactRelationship;
    
    // Preferences
    @Column(name = "preferred_language", length = 10, nullable = false)
    private String preferredLanguage = "en";
    
    @Column(name = "preferred_currency", length = 3, nullable = false)
    private String preferredCurrency = "VND";
    
    @Column(name = "timezone", length = 50, nullable = false)
    private String timezone = "Asia/Ho_Chi_Minh";
}
