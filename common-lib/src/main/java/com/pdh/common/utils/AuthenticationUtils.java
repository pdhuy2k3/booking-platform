package com.pdh.common.utils;


import com.pdh.common.constants.ApiConstant;
import com.pdh.common.exceptions.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.Optional;
import java.util.UUID;

public final class AuthenticationUtils {

    private AuthenticationUtils() {
    }

    public static String extractUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            throw new AccessDeniedException(ApiConstant.ACCESS_DENIED);
        }
        if (authentication instanceof JwtAuthenticationToken jat) {
            return jat.getToken().getSubject();
        }
        // Fallback khi Principal đã là JwtAuthenticationToken (từ method param)
        if (authentication.getPrincipal() instanceof Jwt jwt) {
            return jwt.getSubject();
        }
        throw new AccessDeniedException("Unsupported authentication type: " + authentication.getClass());
    }
    public static String extractUsername() {
        Authentication authentication = getAuthentication();

        if (authentication instanceof AnonymousAuthenticationToken) {
            throw new AccessDeniedException(ApiConstant.ACCESS_DENIED);
        }

        JwtAuthenticationToken contextHolder = (JwtAuthenticationToken) authentication;

        return contextHolder.getToken().getClaimAsString("preferred_username");
    }
    public static UUID getCurrentUserIdFromContext() {
        String userId = extractUserId();
        try {
            return UUID.fromString(userId);
        } catch (IllegalArgumentException e) {
            throw new AccessDeniedException("Invalid user ID format: " + userId);
        }
    }
    public static String extractRole() {
        Authentication authentication = getAuthentication();

        if (authentication instanceof AnonymousAuthenticationToken) {
            throw new AccessDeniedException(ApiConstant.ACCESS_DENIED);
        }

        JwtAuthenticationToken contextHolder = (JwtAuthenticationToken) authentication;

        return contextHolder.getToken().getClaimAsString("role");
    }
    public static String extractJwt() {
        return tryExtractJwt()
            .orElseThrow(() -> new AccessDeniedException(ApiConstant.ACCESS_DENIED));
    }

    public static Optional<String> tryExtractJwt() {
        Authentication authentication = getAuthentication();

        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Jwt jwt) {
            String tokenValue = jwt.getTokenValue();
            if (tokenValue != null && !tokenValue.isBlank()) {
                return Optional.of(tokenValue);
            }
        }

        return Optional.empty();
    }

    public static Authentication getAuthentication() {
        return SecurityContextHolder.getContext().getAuthentication();
    }
}
