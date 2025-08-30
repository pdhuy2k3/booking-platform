package com.pdh.customer.service;

import com.pdh.common.exceptions.*;
import com.pdh.customer.common.Constants;
import com.pdh.customer.config.KeycloakPropsConfig;
import com.pdh.customer.viewmodel.*;
import jakarta.ws.rs.core.Response;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.apache.commons.validator.routines.EmailValidator;
import org.keycloak.admin.client.CreatedResponseUtil;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.RealmResource;
import org.keycloak.admin.client.resource.UserResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.RoleRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.stereotype.Service;

@Service
public class PartnerService {

    private static final String PARTNER_ROLE = "PARTNER";
    private static final String ERROR_FORMAT = "%s: Client %s don't have access right for this resource";
    private static final int PARTNER_PER_PAGE = 20;
    
    private final Keycloak keycloak;
    private final KeycloakPropsConfig keycloakPropsConfig;
    private final CustomerService customerService;

    public PartnerService(Keycloak keycloak, KeycloakPropsConfig keycloakPropsConfig, CustomerService customerService) {
        this.keycloak = keycloak;
        this.keycloakPropsConfig = keycloakPropsConfig;
        this.customerService = customerService;
    }

    /**
     * Create partner application (public endpoint)
     */
    public String submitPartnerApplication(PartnerApplicationVm application) {
        RealmResource realmResource = keycloak.realm(keycloakPropsConfig.getRealm());
        
        // Check if email already exists
        if (customerService.checkEmailExists(realmResource, application.email())) {
            throw new DuplicatedException(Constants.ErrorCode.USER_WITH_EMAIL_ALREADY_EXITED, application.email());
        }
        
        // Generate temporary password
        String tempPassword = generateTemporaryPassword();
        
        // Create user representation
        UserRepresentation user = new UserRepresentation();
        user.setUsername(application.email());
        user.setEmail(application.email());
        user.setFirstName(application.contactPersonName().split(" ")[0]);
        user.setLastName(application.contactPersonName().contains(" ") 
            ? application.contactPersonName().substring(application.contactPersonName().indexOf(" ") + 1)
            : "");
        user.setEnabled(false); // Disabled until approved
        user.setEmailVerified(false);
        
        // Set partner-specific attributes
        Map<String, List<String>> attributes = new HashMap<>();
        attributes.put("partner_type", List.of(application.partnerType()));
        attributes.put("approval_status", List.of("pending"));
        attributes.put("onboarding_status", List.of("incomplete"));
        attributes.put("business_name", List.of(application.businessName()));
        attributes.put("contact_person_name", List.of(application.contactPersonName()));
        attributes.put("phone_number", List.of(application.phoneNumber()));
        attributes.put("business_address", List.of(application.businessAddress()));
        attributes.put("city", List.of(application.city()));
        attributes.put("country", List.of(application.country()));
        
        if (application.businessRegistrationNumber() != null) {
            attributes.put("business_registration_number", List.of(application.businessRegistrationNumber()));
        }
        if (application.taxId() != null) {
            attributes.put("tax_id", List.of(application.taxId()));
        }
        if (application.website() != null) {
            attributes.put("website", List.of(application.website()));
        }
        if (application.description() != null) {
            attributes.put("description", List.of(application.description()));
        }
        
        // Hotel-specific attributes
        if ("HOTEL".equals(application.partnerType())) {
            if (application.starRating() != null) {
                attributes.put("star_rating", List.of(application.starRating().toString()));
            }
            if (application.totalRooms() != null) {
                attributes.put("total_rooms", List.of(application.totalRooms().toString()));
            }
            if (application.hotelChain() != null) {
                attributes.put("hotel_chain", List.of(application.hotelChain()));
            }
        }
        
        // Transport-specific attributes
        if ("TRANSPORT".equals(application.partnerType())) {
            if (application.vehicleTypes() != null) {
                attributes.put("vehicle_types", List.of(application.vehicleTypes()));
            }
            if (application.serviceAreas() != null) {
                attributes.put("service_areas", List.of(application.serviceAreas()));
            }
        }
        
        // Activity-specific attributes
        if ("ACTIVITY".equals(application.partnerType())) {
            if (application.activityTypes() != null) {
                attributes.put("activity_types", List.of(application.activityTypes()));
            }
            if (application.operatingSchedule() != null) {
                attributes.put("operating_schedule", List.of(application.operatingSchedule()));
            }
        }
        
        attributes.put("application_date", List.of(LocalDateTime.now().toString()));
        user.setAttributes(attributes);
        
        // Set temporary password
        CredentialRepresentation credential = CustomerService.createPasswordCredentials(tempPassword);
        user.setCredentials(Collections.singletonList(credential));
        
        // Create user
        Response response = realmResource.users().create(user);
        String userId = CreatedResponseUtil.getCreatedId(response);
        
        // Assign PARTNER role
        UserResource userResource = realmResource.users().get(userId);
        RoleRepresentation partnerRole = realmResource.roles().get(PARTNER_ROLE).toRepresentation();
        userResource.roles().realmLevel().add(Collections.singletonList(partnerRole));
        
        // TODO: Send application confirmation email
        // TODO: Notify admin about new application
        
        return userId;
    }
    
    /**
     * Get all partner applications for admin review
     */
    public List<PartnerAdminVm> getPendingApplications() {
        return getPartnersByStatus("pending");
    }
    
    /**
     * Get partners by approval status
     */
    public List<PartnerAdminVm> getPartnersByStatus(String status) {
        try {
            return keycloak.realm(keycloakPropsConfig.getRealm())
                    .users()
                    .list()
                    .stream()
                    .filter(user -> hasPartnerRole(user))
                    .filter(user -> status.equals(getAttributeValue(user.getAttributes(), "approval_status")))
                    .map(PartnerAdminVm::fromUserRepresentation)
                    .collect(Collectors.toList());
                    
        } catch (Exception e) {
            throw new AccessDeniedException("Failed to retrieve partners");
        }
    }
    
    /**
     * Approve partner application
     */
    public void approvePartner(String partnerId, String adminUserId, String notes) {
        UserResource userResource = keycloak.realm(keycloakPropsConfig.getRealm()).users().get(partnerId);
        UserRepresentation user = userResource.toRepresentation();
        
        if (user == null) {
            throw new NotFoundException("Partner not found");
        }
        
        // Update attributes
        Map<String, List<String>> attributes = user.getAttributes();
        attributes.put("approval_status", List.of("approved"));
        attributes.put("approved_by", List.of(adminUserId));
        attributes.put("approved_date", List.of(LocalDateTime.now().toString()));
        if (notes != null) {
            attributes.put("approval_notes", List.of(notes));
        }
        user.setAttributes(attributes);
        
        // Enable user account
        user.setEnabled(true);
        
        // Update user
        userResource.update(user);
        
        // TODO: Send approval email with login instructions
        // TODO: Create notification for partner
    }
    
    /**
     * Reject partner application
     */
    public void rejectPartner(String partnerId, String adminUserId, String reason) {
        UserResource userResource = keycloak.realm(keycloakPropsConfig.getRealm()).users().get(partnerId);
        UserRepresentation user = userResource.toRepresentation();
        
        if (user == null) {
            throw new NotFoundException("Partner not found");
        }
        
        // Update attributes
        Map<String, List<String>> attributes = user.getAttributes();
        attributes.put("approval_status", List.of("rejected"));
        attributes.put("rejected_by", List.of(adminUserId));
        attributes.put("rejected_date", List.of(LocalDateTime.now().toString()));
        attributes.put("rejection_reason", List.of(reason));
        user.setAttributes(attributes);
        
        // Keep user disabled
        user.setEnabled(false);
        
        // Update user
        userResource.update(user);
        
        // TODO: Send rejection email
    }
    
    /**
     * Update partner onboarding status
     */
    public void updateOnboardingStatus(String partnerId, String status) {
        UserResource userResource = keycloak.realm(keycloakPropsConfig.getRealm()).users().get(partnerId);
        UserRepresentation user = userResource.toRepresentation();
        
        if (user == null) {
            throw new NotFoundException("Partner not found");
        }
        
        Map<String, List<String>> attributes = user.getAttributes();
        attributes.put("onboarding_status", List.of(status));
        user.setAttributes(attributes);
        
        userResource.update(user);
    }
    
    private boolean hasPartnerRole(UserRepresentation user) {
        // This would need to be implemented based on how roles are retrieved
        // For now, checking if user has partner-specific attributes
        Map<String, List<String>> attributes = user.getAttributes();
        return attributes != null && attributes.containsKey("partner_type");
    }
    
    private String getAttributeValue(Map<String, List<String>> attributes, String key) {
        if (attributes == null || !attributes.containsKey(key)) {
            return null;
        }
        List<String> values = attributes.get(key);
        return values.isEmpty() ? null : values.get(0);
    }
    
    private String generateTemporaryPassword() {
        SecureRandom random = new SecureRandom();
        byte[] bytes = new byte[16];
        random.nextBytes(bytes);
        Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();
        return encoder.encodeToString(bytes);
    }
}
