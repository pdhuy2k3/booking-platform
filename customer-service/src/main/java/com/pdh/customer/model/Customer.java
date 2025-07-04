package com.pdh.customer.model;

import com.pdh.customer.model.enums.SystemRole;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Customer Entity - Application-specific customer data
 * Authentication data is managed by Logto, this entity stores business-specific information
 */
@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {
    
    @Id
    @Column(name = "customer_id")
    private UUID customerId; // This will be the Logto user ID
    
    @Column(name = "logto_sub_id", nullable = false, unique = true, length = 255)
    private String logtoSubId; // Logto's subject identifier
    
    // Application-specific fields
    @Enumerated(EnumType.STRING)
    @Column(name = "system_role", nullable = false)
    private SystemRole systemRole = SystemRole.TRAVELLER;
    
    @Column(name = "preferred_language", length = 10)
    private String preferredLanguage = "vi";
    
    @Column(name = "preferred_currency", length = 3)
    private String preferredCurrency = "VND";
    
    @Column(name = "phone_number", length = 20)
    private String phoneNumber;
    
    @Column(name = "emergency_contact_name", length = 255)
    private String emergencyContactName;
    
    @Column(name = "emergency_contact_phone", length = 20)
    private String emergencyContactPhone;
    
    @Column(name = "travel_preferences", columnDefinition = "JSONB")
    private String travelPreferences;
    
    @Column(name = "loyalty_points")
    private Integer loyaltyPoints = 0;
    
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    // Audit fields
    @Column(name = "created_at", nullable = false)
    private ZonedDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = ZonedDateTime.now();
        updatedAt = ZonedDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
    }
}
