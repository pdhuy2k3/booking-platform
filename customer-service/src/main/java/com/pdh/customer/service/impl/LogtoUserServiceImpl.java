package com.pdh.customer.service.impl;

import com.pdh.customer.config.LogtoProperties;
import com.pdh.customer.service.LogtoUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.UUID;
import java.util.Map;
import java.util.HashMap;

/**
 * Implementation of LogtoUserService that integrates with Logto Management API
 * Based on Logto API documentation:
 * - Management API: https://docs.logto.io/end-user-flows/account-settings/by-management-api
 * - OpenAPI Users: https://openapi.logto.io/group/endpoint-users
 */
@Service
public class LogtoUserServiceImpl implements LogtoUserService {
    
    private static final Logger logger = LoggerFactory.getLogger(LogtoUserServiceImpl.class);
    
    private final LogtoProperties logtoProperties;
    private final RestTemplate restTemplate;
    
    // Logto API endpoints
    private static final String USERS_ENDPOINT = "/api/users";
    private static final String USER_BY_ID_ENDPOINT = "/api/users/{userId}";
    private static final String TOKEN_ENDPOINT = "/oidc/token";
    
    public LogtoUserServiceImpl(LogtoProperties logtoProperties, RestTemplate restTemplate) {
        this.logtoProperties = logtoProperties;
        this.restTemplate = restTemplate;
    }
    
    @Override
    public LogtoUserInfo getUserById(UUID userId) {
        try {
            String accessToken = getManagementApiAccessToken();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            String url = logtoProperties.getManagementApiEndpoint() + USER_BY_ID_ENDPOINT;
            ResponseEntity<LogtoUserApiResponse> response = restTemplate.exchange(
                    url, 
                    HttpMethod.GET, 
                    request, 
                    LogtoUserApiResponse.class,
                    userId.toString()
            );
            
            LogtoUserApiResponse apiResponse = response.getBody();
            if (apiResponse != null) {
                return mapToLogtoUserInfo(apiResponse);
            }
            
            return null;
            
        } catch (RestClientException e) {
            logger.error("Error fetching user from Logto API for userId: {}", userId, e);
            return null;
        }
    }
    
    @Override
    public LogtoUserInfo getUserBySubId(String subId) {
        try {
            String accessToken = getManagementApiAccessToken();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            // Search user by sub (subject) ID
            String url = logtoProperties.getManagementApiEndpoint() + USERS_ENDPOINT + "?search=" + subId;
            ResponseEntity<LogtoUserApiResponse[]> response = restTemplate.exchange(
                    url, 
                    HttpMethod.GET, 
                    request, 
                    LogtoUserApiResponse[].class
            );
            
            LogtoUserApiResponse[] apiResponse = response.getBody();
            if (apiResponse != null && apiResponse.length > 0) {
                // Find user with matching sub ID
                for (LogtoUserApiResponse user : apiResponse) {
                    if (subId.equals(user.id())) {
                        return mapToLogtoUserInfo(user);
                    }
                }
            }
            
            return null;
            
        } catch (RestClientException e) {
            logger.error("Error fetching user from Logto API for subId: {}", subId, e);
            return null;
        }
    }
    
    @Override
    public LogtoUserInfo updateUser(UUID userId, LogtoUserUpdateRequest request) {
        try {
            String accessToken = getManagementApiAccessToken();
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(accessToken);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Map update request to Logto API format
            Map<String, Object> updateData = new HashMap<>();
            if (request.fullName() != null) {
                updateData.put("name", request.fullName());
            }
            if (request.profilePictureUrl() != null) {
                updateData.put("avatar", request.profilePictureUrl());
            }
            if (request.phoneNumber() != null) {
                updateData.put("primaryPhone", request.phoneNumber());
            }
            
            HttpEntity<Map<String, Object>> httpRequest = new HttpEntity<>(updateData, headers);
            
            String url = logtoProperties.getManagementApiEndpoint() + USER_BY_ID_ENDPOINT;
            ResponseEntity<LogtoUserApiResponse> response = restTemplate.exchange(
                    url, 
                    HttpMethod.PATCH, 
                    httpRequest, 
                    LogtoUserApiResponse.class,
                    userId.toString()
            );
            
            LogtoUserApiResponse apiResponse = response.getBody();
            if (apiResponse != null) {
                return mapToLogtoUserInfo(apiResponse);
            }
            
            return null;
            
        } catch (RestClientException e) {
            logger.error("Error updating user in Logto API for userId: {}", userId, e);
            return null;
        }
    }
    
    @Override
    public boolean userExists(UUID userId) {
        LogtoUserInfo userInfo = getUserById(userId);
        return userInfo != null;
    }
    
    /**
     * Get access token for Logto Management API
     * Using client credentials flow
     */
    private String getManagementApiAccessToken() {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            Map<String, String> tokenRequest = new HashMap<>();
            tokenRequest.put("grant_type", "client_credentials");
            tokenRequest.put("client_id", logtoProperties.getAppId());
            tokenRequest.put("client_secret", logtoProperties.getAppSecret());
            tokenRequest.put("resource", logtoProperties.getManagementApiResource());
            tokenRequest.put("scope", "all");
            
            HttpEntity<Map<String, String>> request = new HttpEntity<>(tokenRequest, headers);
            
            String url = logtoProperties.getEndpoint() + TOKEN_ENDPOINT;
            ResponseEntity<TokenResponse> response = restTemplate.exchange(
                    url, 
                    HttpMethod.POST, 
                    request, 
                    TokenResponse.class
            );
            
            TokenResponse tokenResponse = response.getBody();
            if (tokenResponse != null) {
                return tokenResponse.accessToken();
            }
            
            throw new RuntimeException("Unable to get access token from Logto");
            
        } catch (RestClientException e) {
            logger.error("Error getting access token from Logto", e);
            throw new RuntimeException("Unable to get access token from Logto", e);
        }
    }
    
    /**
     * Map Logto API response to our LogtoUserInfo record
     */
    private LogtoUserInfo mapToLogtoUserInfo(LogtoUserApiResponse apiResponse) {
        return new LogtoUserInfo(
                UUID.fromString(apiResponse.id()),
                apiResponse.id(),
                apiResponse.primaryEmail(),
                apiResponse.name(),
                apiResponse.avatar(),
                apiResponse.primaryPhone(),
                !apiResponse.isSuspended(),
                apiResponse.createdAt(),
                apiResponse.updatedAt()
        );
    }
    
    /**
     * Logto API User response model
     * Based on Logto OpenAPI specification
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record LogtoUserApiResponse(
            @JsonProperty("id") String id,
            @JsonProperty("username") String username,
            @JsonProperty("primaryEmail") String primaryEmail,
            @JsonProperty("primaryPhone") String primaryPhone,
            @JsonProperty("name") String name,
            @JsonProperty("avatar") String avatar,
            @JsonProperty("customData") Map<String, Object> customData,
            @JsonProperty("identities") Map<String, Object> identities,
            @JsonProperty("lastSignInAt") Long lastSignInAt,
            @JsonProperty("createdAt") Long createdAt,
            @JsonProperty("updatedAt") Long updatedAt,
            @JsonProperty("profile") Map<String, Object> profile,
            @JsonProperty("applicationId") String applicationId,
            @JsonProperty("isSuspended") Boolean isSuspended
    ) {}
    
    /**
     * Token response model for OAuth2 client credentials flow
     */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record TokenResponse(
            @JsonProperty("access_token") String accessToken,
            @JsonProperty("token_type") String tokenType,
            @JsonProperty("expires_in") Integer expiresIn,
            @JsonProperty("scope") String scope
    ) {}
}
