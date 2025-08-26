package com.pdh.customer.viewmodel;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import org.keycloak.representations.idm.UserRepresentation;

/**
 * Partner view for admin management
 */
public record PartnerAdminVm(
        String id,
        String username,
        String email,
        String firstName,
        String lastName,
        LocalDateTime createdTimestamp,
        boolean enabled,
        
        // Partner-specific attributes
        String partnerType,
        String approvalStatus,
        String onboardingStatus,
        String businessName,
        String contactPersonName,
        String phoneNumber,
        String businessAddress,
        String businessRegistrationNumber,
        String taxId,
        
        // Additional metadata
        LocalDateTime lastLogin,
        int totalProperties,  // For hotels
        String accountManager  // Assigned admin
) {
    
    public static PartnerAdminVm fromUserRepresentation(UserRepresentation userRepresentation) {
        Map<String, java.util.List<String>> attributes = userRepresentation.getAttributes();
        
        return new PartnerAdminVm(
                userRepresentation.getId(),
                userRepresentation.getUsername(),
                userRepresentation.getEmail(),
                userRepresentation.getFirstName(),
                userRepresentation.getLastName(),
                LocalDateTime.ofInstant(
                    java.time.Instant.ofEpochMilli(userRepresentation.getCreatedTimestamp()),
                    java.util.TimeZone.getDefault().toZoneId()
                ),
                userRepresentation.isEnabled(),
                
                // Partner attributes
                getAttributeValue(attributes, "partner_type"),
                getAttributeValue(attributes, "approval_status"),
                getAttributeValue(attributes, "onboarding_status"),
                getAttributeValue(attributes, "business_name"),
                getAttributeValue(attributes, "contact_person_name"),
                getAttributeValue(attributes, "phone_number"),
                getAttributeValue(attributes, "business_address"),
                getAttributeValue(attributes, "business_registration_number"),
                getAttributeValue(attributes, "tax_id"),
                
                // Metadata
                null, // lastLogin - would need to be retrieved separately
                0,    // totalProperties - would need to be retrieved from hotel-service
                getAttributeValue(attributes, "account_manager")
        );
    }
    
    private static String getAttributeValue(Map<String, java.util.List<String>> attributes, String key) {
        return Optional.ofNullable(attributes)
                .map(attrs -> attrs.get(key))
                .filter(list -> !list.isEmpty())
                .map(list -> list.get(0))
                .orElse(null);
    }
}
