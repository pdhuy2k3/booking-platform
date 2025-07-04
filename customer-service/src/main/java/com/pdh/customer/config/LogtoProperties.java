package com.pdh.customer.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for Logto integration
 */
@Configuration
@ConfigurationProperties(prefix = "logto")
public class LogtoProperties {
    
    private String endpoint;
    private String appId;
    private String appSecret;
    private String managementApiEndpoint;
    private String managementApiResource = "https://default.logto.app/api"; // Default Logto Management API resource
    private int connectionTimeout = 5000;
    private int readTimeout = 10000;
    
    // Getters and setters
    public String getEndpoint() {
        return endpoint;
    }
    
    public void setEndpoint(String endpoint) {
        this.endpoint = endpoint;
    }
    
    public String getAppId() {
        return appId;
    }
    
    public void setAppId(String appId) {
        this.appId = appId;
    }
    
    public String getAppSecret() {
        return appSecret;
    }
    
    public void setAppSecret(String appSecret) {
        this.appSecret = appSecret;
    }
    
    public String getManagementApiEndpoint() {
        return managementApiEndpoint;
    }
    
    public void setManagementApiEndpoint(String managementApiEndpoint) {
        this.managementApiEndpoint = managementApiEndpoint;
    }
    
    public String getManagementApiResource() {
        return managementApiResource;
    }
    
    public void setManagementApiResource(String managementApiResource) {
        this.managementApiResource = managementApiResource;
    }
    
    public int getConnectionTimeout() {
        return connectionTimeout;
    }
    
    public void setConnectionTimeout(int connectionTimeout) {
        this.connectionTimeout = connectionTimeout;
    }
    
    public int getReadTimeout() {
        return readTimeout;
    }
    
    public void setReadTimeout(int readTimeout) {
        this.readTimeout = readTimeout;
    }
}
