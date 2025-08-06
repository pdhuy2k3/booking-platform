package com.pdh.payment.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Stripe Configuration Properties
 */
@Configuration
@ConfigurationProperties(prefix = "payment.gateways.stripe")
@Data
public class StripeConfig {
    
    private Api api = new Api();
    private Settings settings = new Settings();
    
    @Data
    public static class Api {
        private String publishableKey;
        private String secretKey;
        private String apiVersion;
    }
    

    @Data
    public static class Settings {
        private String captureMethod = "automatic";
        private String confirmationMethod = "automatic";
        private String currency = "usd";
        private String statementDescriptor = "BookingSmart";
        private boolean receiptEmail = true;
    }
    
    /**
     * Validate Stripe configuration
     */
    public boolean isValid() {
        return api.secretKey != null && !api.secretKey.trim().isEmpty() &&
               api.publishableKey != null && !api.publishableKey.trim().isEmpty();
    }
    
    /**
     * Check if running in test mode
     */
    public boolean isTestMode() {
        return api.secretKey != null && api.secretKey.startsWith("sk_test_");
    }
    
    /**
     * Get secret key for Stripe API
     */
    public String getSecretKey() {
        return api.secretKey;
    }
    
    /**
     * Get publishable key for frontend
     */
    public String getPublishableKey() {
        return api.publishableKey;
    }
    

}
