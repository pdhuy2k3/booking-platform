package com.pdh.customer.service;

import java.util.UUID;

/**
 * Service interface for integrating with Logto Identity Provider
 * Handles communication with Logto API for user authentication data
 */
public interface LogtoUserService {
    
    /**
     * Retrieve user information from Logto by user ID
     */
    LogtoUserInfo getUserById(UUID userId);
    
    /**
     * Retrieve user information from Logto by subject ID
     */
    LogtoUserInfo getUserBySubId(String subId);
    
    /**
     * Update user information in Logto (if allowed)
     */
    LogtoUserInfo updateUser(UUID userId, LogtoUserUpdateRequest request);
    
    /**
     * Check if user exists in Logto
     */
    boolean userExists(UUID userId);
    
    /**
     * Data class representing user information from Logto
     */
    record LogtoUserInfo(
            UUID id,
            String subId,
            String email,
            String fullName,
            String profilePictureUrl,
            String phoneNumber,
            boolean isActive,
            long createdAt,
            long updatedAt
    ) {}
    
    /**
     * Data class for updating user information in Logto
     */
    record LogtoUserUpdateRequest(
            String fullName,
            String profilePictureUrl,
            String phoneNumber
    ) {}
}
