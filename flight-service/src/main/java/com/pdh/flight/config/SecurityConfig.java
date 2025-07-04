package com.pdh.flight.config;

import com.nimbusds.jose.JOSEObjectType;
import com.nimbusds.jose.proc.DefaultJOSEObjectTypeVerifier;
import com.nimbusds.jose.proc.SecurityContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.web.server.SecurityWebFilterChain;

/**
 * Security Configuration for Flight Service
 * Configures OAuth2 resource server while allowing public access to health endpoints
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Value("${logto.audience}")
    private String audience;

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuer;

    @Value("${spring.security.oauth2.resourceserver.jwt.jwk-set-uri}")
    private String jwksUri;

    @Bean
    public ReactiveJwtDecoder customJwtDecoder() {
        NimbusReactiveJwtDecoder jwtDecoder = NimbusReactiveJwtDecoder.withJwkSetUri(jwksUri)
                .jwsAlgorithm(SignatureAlgorithm.RS256)
                // The decoder should support the token type: Access Token + JWT.
                .jwtProcessorCustomizer(customizer -> customizer
                        .setJWETypeVerifier(new DefaultJOSEObjectTypeVerifier<>(new JOSEObjectType("at+jwt"))))
                .build();

        jwtDecoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(
                new AudienceValidator(audience),
                new JwtIssuerValidator(issuer),
                new JwtTimestampValidator()));

        return jwtDecoder;
    }
    @Bean
    SecurityWebFilterChain filterChain(ServerHttpSecurity http) {
        return http
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers("/backoffice/flight/health", "/actuator/health", "/actuator/info").permitAll()
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                      .jwt(Customizer.withDefaults())
//                          .opaqueToken(Customizer.withDefaults())
                )
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .build();
    }

}