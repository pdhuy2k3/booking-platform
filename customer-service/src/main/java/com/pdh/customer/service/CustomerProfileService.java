package com.pdh.customer.service;

import com.pdh.common.utils.AuthenticationUtils;
import com.pdh.customer.model.CustomerProfile;
import com.pdh.customer.model.CustomerAddress;
import com.pdh.customer.model.CustomerLoyalty;
import com.pdh.customer.model.LoyaltyTransaction;
import com.pdh.customer.repository.CustomerProfileRepository;
import com.pdh.customer.repository.CustomerAddressRepository;
import com.pdh.customer.repository.CustomerLoyaltyRepository;
import com.pdh.customer.repository.LoyaltyTransactionRepository;
import com.pdh.customer.dto.request.UpdateProfileRequest;
import com.pdh.customer.dto.response.CustomerProfileResponse;
import com.pdh.customer.dto.response.StorefrontCustomerProfileResponse;
import com.pdh.customer.dto.response.LoyaltyBalanceResponse;
import com.pdh.customer.dto.response.AddressResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class CustomerProfileService {
    
    private final CustomerProfileRepository customerProfileRepository;
    private final CustomerAddressRepository customerAddressRepository;
    private final CustomerLoyaltyRepository customerLoyaltyRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    
    /**
     * Get customer profile using userId from JWT token
     */
    @Transactional(readOnly = true)
    public CustomerProfileResponse getProfile() {
        UUID userId = UUID.fromString(AuthenticationUtils.extractUserId());
        log.debug("Getting profile for user: {}", userId);

        CustomerProfile profile = customerProfileRepository.findByUserIdAndIsDeletedFalse(userId)
                .orElseGet(() -> createDefaultProfile(userId));

        return mapToProfileResponse(profile);
    }

    /**
     * Get storefront-compatible customer profile using userId from JWT token
     */
    @Transactional(readOnly = true)
    public StorefrontCustomerProfileResponse getStorefrontProfile() {
        UUID userId = UUID.fromString(AuthenticationUtils.extractUserId());
        log.debug("Getting storefront profile for user: {}", userId);

        // Get profile data
        CustomerProfile profile = customerProfileRepository.findByUserIdAndIsDeletedFalse(userId)
                .orElseGet(() -> createDefaultProfile(userId));

        // Get loyalty data
        CustomerLoyalty loyalty = customerLoyaltyRepository.findByUserIdAndIsDeletedFalse(userId)
                .orElseGet(() -> createDefaultLoyaltyProgram(userId));

        // Get addresses
        List<CustomerAddress> addresses = customerAddressRepository
                .findByUserIdAndIsDeletedFalseOrderByIsDefaultDescCreatedAtDesc(userId);

        // Convert to responses
        CustomerProfileResponse profileResponse = mapToProfileResponse(profile);
        LoyaltyBalanceResponse loyaltyResponse = mapToLoyaltyBalanceResponse(loyalty);
        List<AddressResponse> addressResponses = addresses.stream()
                .map(this::mapToAddressResponse)
                .collect(Collectors.toList());

        // Create storefront response with mock Keycloak data (in production, get from Keycloak)
        StorefrontCustomerProfileResponse storefrontResponse = StorefrontCustomerProfileResponse
                .fromCustomerProfileResponse(
                        profileResponse,
                        "user" + userId.toString().substring(0, 8), // Mock username
                        "user@example.com", // Mock email - should come from Keycloak
                        "John", // Mock firstName - should come from Keycloak
                        "Doe", // Mock lastName - should come from Keycloak
                        loyaltyResponse
                );

        // Add address information
        return StorefrontCustomerProfileResponse.withAddress(storefrontResponse, addressResponses);
    }
    
    /**
     * Update customer profile using userId from JWT token
     */
    public CustomerProfileResponse updateProfile(UpdateProfileRequest request) {
        UUID userId = UUID.fromString(AuthenticationUtils.extractUserId());
        log.debug("Updating profile for user: {}", userId);
        
        CustomerProfile profile = customerProfileRepository.findByUserIdAndIsDeletedFalse(userId)
                .orElseGet(() -> createDefaultProfile(userId));
        
        // Update profile fields
        if (request.getDateOfBirth() != null) {
            profile.setDateOfBirth(request.getDateOfBirth());
        }
        if (request.getNationality() != null) {
            profile.setNationality(request.getNationality());
        }
        if (request.getPassportNumber() != null) {
            profile.setPassportNumber(request.getPassportNumber());
        }
        if (request.getPassportExpiry() != null) {
            profile.setPassportExpiry(request.getPassportExpiry());
        }
        if (request.getPassportIssuingCountry() != null) {
            profile.setPassportIssuingCountry(request.getPassportIssuingCountry());
        }
        if (request.getGender() != null) {
            profile.setGender(request.getGender());
        }
        if (request.getOccupation() != null) {
            profile.setOccupation(request.getOccupation());
        }
        if (request.getEmergencyContactName() != null) {
            profile.setEmergencyContactName(request.getEmergencyContactName());
        }
        if (request.getEmergencyContactPhone() != null) {
            profile.setEmergencyContactPhone(request.getEmergencyContactPhone());
        }
        if (request.getEmergencyContactRelationship() != null) {
            profile.setEmergencyContactRelationship(request.getEmergencyContactRelationship());
        }
        if (request.getPreferredLanguage() != null) {
            profile.setPreferredLanguage(request.getPreferredLanguage());
        }
        if (request.getPreferredCurrency() != null) {
            profile.setPreferredCurrency(request.getPreferredCurrency());
        }
        if (request.getTimezone() != null) {
            profile.setTimezone(request.getTimezone());
        }
        
        CustomerProfile savedProfile = customerProfileRepository.save(profile);
        return mapToProfileResponse(savedProfile);
    }
    
    /**
     * Get customer addresses using userId from JWT token
     */
    @Transactional(readOnly = true)
    public List<AddressResponse> getAddresses() {
        UUID userId = UUID.fromString(AuthenticationUtils.extractUserId());
        log.debug("Getting addresses for user: {}", userId);
        
        List<CustomerAddress> addresses = customerAddressRepository
                .findByUserIdAndIsDeletedFalseOrderByIsDefaultDescCreatedAtDesc(userId);
        
        return addresses.stream()
                .map(this::mapToAddressResponse)
                .collect(Collectors.toList());
    }
    
    /**
     * Get loyalty balance using userId from JWT token
     */
    @Transactional(readOnly = true)
    public LoyaltyBalanceResponse getLoyaltyBalance() {
        UUID userId = UUID.fromString(AuthenticationUtils.extractUserId());
        log.debug("Getting loyalty balance for user: {}", userId);
        
        CustomerLoyalty loyalty = customerLoyaltyRepository.findByUserIdAndIsDeletedFalse(userId)
                .orElseGet(() -> createDefaultLoyaltyProgram(userId));
        
        return mapToLoyaltyBalanceResponse(loyalty);
    }
    
    /**
     * Get loyalty transaction history using userId from JWT token
     */
    @Transactional(readOnly = true)
    public Page<LoyaltyTransaction> getLoyaltyHistory(Pageable pageable) {
        UUID userId = UUID.fromString(AuthenticationUtils.extractUserId());
        log.debug("Getting loyalty history for user: {}", userId);
        
        return loyaltyTransactionRepository.findByUserIdAndIsDeletedFalseOrderByCreatedAtDesc(userId, pageable);
    }
    
    /**
     * Create default profile for new user
     */
    private CustomerProfile createDefaultProfile(UUID userId) {
        log.info("Creating default profile for user: {}", userId);
        
        CustomerProfile profile = new CustomerProfile();
        profile.setUserId(userId);
        profile.setPreferredLanguage("en");
        profile.setPreferredCurrency("VND");
        profile.setTimezone("Asia/Ho_Chi_Minh");
        
        return customerProfileRepository.save(profile);
    }
    
    /**
     * Create default loyalty program for new user
     */
    private CustomerLoyalty createDefaultLoyaltyProgram(UUID userId) {
        log.info("Creating default loyalty program for user: {}", userId);
        
        CustomerLoyalty loyalty = new CustomerLoyalty();
        loyalty.setUserId(userId);
        loyalty.setMemberId(generateMemberId());
        loyalty.setTier(CustomerLoyalty.LoyaltyTier.BRONZE);
        loyalty.setCurrentPoints(0);
        loyalty.setLifetimePoints(0);
        loyalty.setTierAchievedDate(LocalDate.now());
        loyalty.setIsActive(true);
        
        // Calculate next tier points
        CustomerLoyalty.LoyaltyTier nextTier = loyalty.getTier().getNextTier();
        if (nextTier != loyalty.getTier()) {
            loyalty.setNextTierPoints(nextTier.getMinPoints());
        }
        
        return customerLoyaltyRepository.save(loyalty);
    }
    
    /**
     * Generate unique member ID
     */
    private String generateMemberId() {
        String prefix = "BS";
        long timestamp = System.currentTimeMillis();
        int random = (int) (Math.random() * 1000);
        return String.format("%s%d%03d", prefix, timestamp % 100000000, random);
    }
    
    /**
     * Map CustomerProfile to CustomerProfileResponse
     */
    private CustomerProfileResponse mapToProfileResponse(CustomerProfile profile) {
        return CustomerProfileResponse.builder()
                .profileId(profile.getProfileId())
                .userId(profile.getUserId())
                .dateOfBirth(profile.getDateOfBirth())
                .nationality(profile.getNationality())
                .passportNumber(profile.getPassportNumber())
                .passportExpiry(profile.getPassportExpiry())
                .passportIssuingCountry(profile.getPassportIssuingCountry())
                .gender(profile.getGender())
                .occupation(profile.getOccupation())
                .emergencyContactName(profile.getEmergencyContactName())
                .emergencyContactPhone(profile.getEmergencyContactPhone())
                .emergencyContactRelationship(profile.getEmergencyContactRelationship())
                .preferredLanguage(profile.getPreferredLanguage())
                .preferredCurrency(profile.getPreferredCurrency())
                .timezone(profile.getTimezone())
                .createdAt(profile.getCreatedAt())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
    
    /**
     * Map CustomerAddress to AddressResponse
     */
    private AddressResponse mapToAddressResponse(CustomerAddress address) {
        return AddressResponse.builder()
                .addressId(address.getAddressId())
                .addressType(address.getAddressType())
                .isDefault(address.getIsDefault())
                .streetAddress(address.getStreetAddress())
                .apartmentUnit(address.getApartmentUnit())
                .city(address.getCity())
                .stateProvince(address.getStateProvince())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .recipientName(address.getRecipientName())
                .recipientPhone(address.getRecipientPhone())
                .deliveryInstructions(address.getDeliveryInstructions())
                .build();
    }
    
    /**
     * Map CustomerLoyalty to LoyaltyBalanceResponse
     */
    private LoyaltyBalanceResponse mapToLoyaltyBalanceResponse(CustomerLoyalty loyalty) {
        CustomerLoyalty.LoyaltyTier nextTier = loyalty.getTier().getNextTier();
        int pointsToNextTier = loyalty.getTier().getPointsToNextTier(loyalty.getCurrentPoints());
        
        return LoyaltyBalanceResponse.builder()
                .memberId(loyalty.getMemberId())
                .tier(loyalty.getTier().name())
                .currentPoints(loyalty.getCurrentPoints())
                .lifetimePoints(loyalty.getLifetimePoints())
                .nextTierPoints(pointsToNextTier)
                .nextTierName(nextTier != loyalty.getTier() ? nextTier.name() : null)
                .pointsExpiryDate(loyalty.getPointsExpiryDate())
                .isActive(loyalty.getIsActive())
                .build();
    }
}
