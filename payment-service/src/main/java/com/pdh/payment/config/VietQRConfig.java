package com.pdh.payment.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * VietQR Configuration Properties
 */
@Configuration
@ConfigurationProperties(prefix = "payment.gateways.vietqr")
@Data
public class VietQRConfig {
    
    private Api api = new Api();
    private Bank bank = new Bank();
    private Callback callback = new Callback();
    private Settings settings = new Settings();
    
    @Data
    public static class Api {
        private String baseUrl ;
        private String clientId;
        private String apiKey;
        private int timeoutSeconds = 30;
    }
    
    @Data
    public static class Bank {
        private String accountNumber;
        private String accountName;
        private String bankCode;
        private String bankName;
    }
    
    @Data
    public static class Callback {
        private String endpointPath;
        private String secret;
    }
    
    @Data
    public static class Settings {
        private int qrExpirationMinutes = 30;
        private String currency ;
        private String template ;
    }
    
    /**
     * Validate VietQR configuration
     */
    public boolean isValid() {
        return api.clientId != null && !api.clientId.trim().isEmpty() &&
               api.apiKey != null && !api.apiKey.trim().isEmpty() &&
               bank.accountNumber != null && !bank.accountNumber.trim().isEmpty() &&
               bank.accountName != null && !bank.accountName.trim().isEmpty() &&
               bank.bankCode != null && !bank.bankCode.trim().isEmpty();
    }
    
    /**
     * Get full API URL
     */
    public String getApiUrl(String endpoint) {
        return api.baseUrl + (endpoint.startsWith("/") ? endpoint : "/" + endpoint);
    }
    
    /**
     * Get QR code generation URL
     */
    public String getQrGenerateUrl() {
        return getApiUrl("/v2/generate");
    }
    
    /**
     * Get transaction lookup URL
     */
    public String getTransactionLookupUrl() {
        return getApiUrl("/v2/lookup");
    }
}
