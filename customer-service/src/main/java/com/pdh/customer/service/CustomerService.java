package com.pdh.customer.service;

import com.pdh.customer.model.Customer;

import java.util.UUID;

/**
 * Service for managing customer data
 * Works in conjunction with Logto for complete customer management
 */
public interface CustomerService {
    
    /**
     * Create a new customer profile when user first logs in via Logto
     */
    Customer createCustomer(UUID logtoUserId, String logtoSubId);
    
    /**
     * Get customer by Logto user ID
     */
    Customer getCustomer(UUID customerId);
    
    /**
     * Get customer by Logto subject ID
     */
    Customer getCustomerBySubId(String subId);
    
    /**
     * Update customer with application-specific data
     */
    Customer updateCustomer(UUID customerId, CustomerUpdateRequest request);
    
    /**
     * Get complete customer information (Logto + Profile)
     */
    CompleteCustomerInfo getCompleteCustomerInfo(UUID customerId);
    
    /**
     * Add loyalty points to customer
     */
    Customer addLoyaltyPoints(UUID customerId, Integer points);
    
    /**
     * Data class for updating customer profile
     */
    record CustomerUpdateRequest(
            String preferredLanguage,
            String preferredCurrency,
            String phoneNumber,
            String emergencyContactName,
            String emergencyContactPhone,
            String travelPreferences
    ) {}
    
    /**
     * Combined customer information from Logto and local profile
     */
    record CompleteCustomerInfo(
            UUID customerId,
            String subId,
            String email,
            String fullName,
            String profilePictureUrl,
            String phoneNumber,
            String preferredLanguage,
            String preferredCurrency,
            String emergencyContactName,
            String emergencyContactPhone,
            String travelPreferences,
            Integer loyaltyPoints,
            boolean isActive
    ) {}
}
