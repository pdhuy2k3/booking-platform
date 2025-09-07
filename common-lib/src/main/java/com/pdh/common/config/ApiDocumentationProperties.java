package com.pdh.common.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.Map;

/**
 * Configuration properties for OpenAPI documentation
 * 
 * This class holds service-specific metadata for API documentation
 * that can be customized through application properties.
 */
@Data
@ConfigurationProperties(prefix = "api.info")
public class ApiDocumentationProperties {

    /**
     * API title
     */
    private String title = "BookingSmart API";

    /**
     * API description
     */
    private String description = "API documentation for BookingSmart microservice";

    /**
     * API version
     */
    private String version = "1.0.0";

    /**
     * Contact information
     */
    private Contact contact = new Contact();

    /**
     * License information
     */
    private License license = new License();

    /**
     * OAuth2 configuration
     */
    private OAuth2 oauth2 = new OAuth2();

    @Data
    public static class Contact {
        private String name = "BookingSmart Development Team";
        private String email = "dev@bookingsmart.huypd.dev";
        private String url = "https://bookingsmart.huypd.dev";
    }

    @Data
    public static class License {
        private String name = "MIT License";
        private String url = "https://opensource.org/licenses/MIT";
    }

    @Data
    public static class OAuth2 {
        private String authorizationUrl = "http://localhost:8080/realms/bookingsmart/protocol/openid-connect/auth";
        private String tokenUrl = "http://localhost:8080/realms/bookingsmart/protocol/openid-connect/token";
        private String refreshUrl = "http://localhost:8080/realms/bookingsmart/protocol/openid-connect/token";
        private Map<String, String> scopes = Map.of(
                "admin", "Administrative access to all resources",
                "customer", "Customer access to booking and profile operations",
                "partner", "Partner access to integration endpoints",
                "public", "Public access to search and information endpoints"
        );
    }
}