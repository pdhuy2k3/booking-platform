package com.pdh.common.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.OAuthFlow;
import io.swagger.v3.oas.models.security.OAuthFlows;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

/**
 * OpenAPI Configuration for BookingSmart Services
 * 
 * This configuration provides standardized OpenAPI documentation setup
 * that can be used across all microservices in the BookingSmart platform.
 */
@Configuration
@EnableConfigurationProperties(ApiDocumentationProperties.class)
@RequiredArgsConstructor
public class OpenApiConfig {

    private final ApiDocumentationProperties apiProperties;

    /**
     * Creates the main OpenAPI configuration
     */
    @Bean
    public OpenAPI createOpenAPI() {
        return new OpenAPI()
                .info(createApiInfo())
                .servers(createServers())
                .components(createComponents())
                .addSecurityItem(createSecurityRequirement());
    }

    /**
     * Creates API information from properties
     */
    private Info createApiInfo() {
        return new Info()
                .title(apiProperties.getTitle())
                .description(apiProperties.getDescription())
                .version(apiProperties.getVersion())
                .contact(createContact())
                .license(createLicense());
    }

    /**
     * Creates contact information
     */
    private Contact createContact() {
        return new Contact()
                .name(apiProperties.getContact().getName())
                .email(apiProperties.getContact().getEmail())
                .url(apiProperties.getContact().getUrl());
    }

    /**
     * Creates license information
     */
    private License createLicense() {
        return new License()
                .name(apiProperties.getLicense().getName())
                .url(apiProperties.getLicense().getUrl());
    }

    /**
     * Creates server information
     */
    private List<Server> createServers() {
        return Arrays.asList(
                new Server().url("http://localhost:8080").description("Local Development Server"),
                new Server().url("https://api.bookingsmart.dev").description("Development Server"),
                new Server().url("https://api.bookingsmart.com").description("Production Server")
        );
    }

    /**
     * Creates security components including OAuth2 scheme
     */
    private Components createComponents() {
        return new Components()
                .addSecuritySchemes("oauth2", createOAuth2SecurityScheme())
                .addSecuritySchemes("bearerAuth", createBearerSecurityScheme());
    }

    /**
     * Creates OAuth2 security scheme for Keycloak integration
     */
    private SecurityScheme createOAuth2SecurityScheme() {
        // Create scopes from properties
        io.swagger.v3.oas.models.security.Scopes scopes = new io.swagger.v3.oas.models.security.Scopes();
        apiProperties.getOauth2().getScopes().forEach(scopes::addString);
        
        return new SecurityScheme()
                .type(SecurityScheme.Type.OAUTH2)
                .description("OAuth2 authentication via Keycloak")
                .flows(new OAuthFlows()
                        .authorizationCode(new OAuthFlow()
                                .authorizationUrl(apiProperties.getOauth2().getAuthorizationUrl())
                                .tokenUrl(apiProperties.getOauth2().getTokenUrl())
                                .refreshUrl(apiProperties.getOauth2().getRefreshUrl())
                                .scopes(scopes)
                        )
                );
    }

    /**
     * Creates Bearer token security scheme
     */
    private SecurityScheme createBearerSecurityScheme() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT")
                .description("JWT Bearer token authentication");
    }

    /**
     * Creates security requirement
     */
    private SecurityRequirement createSecurityRequirement() {
        return new SecurityRequirement()
                .addList("oauth2", Arrays.asList("admin", "customer", "partner"))
                .addList("bearerAuth");
    }

    /**
     * Public API group for customer-facing endpoints
     */
    @Bean
    public GroupedOpenApi publicApi() {
        return GroupedOpenApi.builder()
                .group("public")
                .displayName("Public API")
                .pathsToMatch("/api/public/**", "/storefront/**")
                .build();
    }

    /**
     * Admin API group for administrative operations
     */
    @Bean
    public GroupedOpenApi adminApi() {
        return GroupedOpenApi.builder()
                .group("admin")
                .displayName("Admin API")
                .pathsToMatch("/api/admin/**", "/backoffice/**")
                .build();
    }

    /**
     * Internal API group for service-to-service communication
     */
    @Bean
    public GroupedOpenApi internalApi() {
        return GroupedOpenApi.builder()
                .group("internal")
                .displayName("Internal API")
                .pathsToMatch("/api/internal/**", "/reserve", "/process", "/saga/**")
                .build();
    }

    /**
     * Partner API group for partner integrations
     */
    @Bean
    public GroupedOpenApi partnerApi() {
        return GroupedOpenApi.builder()
                .group("partner")
                .displayName("Partner API")
                .pathsToMatch("/api/partner/**")
                .build();
    }

    /**
     * Health and monitoring API group
     */
    @Bean
    public GroupedOpenApi monitoringApi() {
        return GroupedOpenApi.builder()
                .group("monitoring")
                .displayName("Monitoring & Health")
                .pathsToMatch("/actuator/**", "**/health")
                .build();
    }
}