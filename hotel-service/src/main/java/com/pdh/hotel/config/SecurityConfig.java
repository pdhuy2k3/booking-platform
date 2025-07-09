package com.pdh.hotel.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import reactor.core.publisher.Flux;

import java.util.Collection;
import java.util.Map;

/**
 * Security Configuration for Hotel Service
 * Configures OAuth2 resource server while allowing public access to health endpoints
 */
@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    SecurityWebFilterChain filterChain(ServerHttpSecurity http) {
        return http
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers("/backoffice/hotel/health", "/actuator/health", "/actuator/info").permitAll()
                        .anyExchange().permitAll()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(Customizer.withDefaults())
                )
                .httpBasic(ServerHttpSecurity.HttpBasicSpec::disable)
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .formLogin(ServerHttpSecurity.FormLoginSpec::disable)
                .build();
    }
    @Bean
    public ReactiveJwtAuthenticationConverter authenticationConverterForKeycloak() {
        Converter<Jwt, Flux<GrantedAuthority>> jwtGrantedAuthoritiesConverter = jwt -> {
            Map<String, Collection<String>> realmAccess = jwt.getClaim("realm_access");
            Collection<String> roles = realmAccess.get("roles");
            return Flux.fromIterable(roles)
                    .map(role -> new SimpleGrantedAuthority("ROLE_" + role)); };

        var jwtAuthenticationConverter = new ReactiveJwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);

        return jwtAuthenticationConverter;
    }
}
