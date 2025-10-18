package com.pdh.customer.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.nio.charset.StandardCharsets;

@Component
public class TurnstileValidator {

    private static final Logger log = LoggerFactory.getLogger(TurnstileValidator.class);
    private static final String VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

    private final HttpClient httpClient;
    private final String turnstileSecretKey;

    public TurnstileValidator(@Value("${turnstile.secret-key:}") String turnstileSecretKey) {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.turnstileSecretKey = turnstileSecretKey;
    }

    /**
     * Validates the Cloudflare Turnstile token
     * @param token The token to validate (typically from cf-turnstile-response form field)
     * @param remoteIp Optional IP address of the client making the request
     * @return true if the token is valid, false otherwise
     */
    public boolean validateToken(String token, String remoteIp) {
        if (turnstileSecretKey == null || turnstileSecretKey.trim().isEmpty()) {
            log.warn("Turnstile secret key is not configured. Skipping validation.");
            // In development, we might want to allow requests without validation
            // In production, you should require the secret key to be set
            return true; // Allow in development
        }

        if (token == null || token.trim().isEmpty()) {
            log.warn("No Turnstile token provided");
            return false;
        }

        try {
            // Prepare the form data for validation request
            StringBuilder formData = new StringBuilder();
            formData.append("secret=").append(URLEncoder.encode(turnstileSecretKey, StandardCharsets.UTF_8.name()));
            formData.append("&response=").append(URLEncoder.encode(token, StandardCharsets.UTF_8.name()));
            if (remoteIp != null && !remoteIp.trim().isEmpty()) {
                formData.append("&remoteip=").append(URLEncoder.encode(remoteIp, StandardCharsets.UTF_8.name()));
            }

            // Create HTTP request to Cloudflare API
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(VERIFY_URL))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(formData.toString()))
                    .timeout(Duration.ofSeconds(30))
                    .build();

            // Send request and get response
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Turnstile validation failed with status code: {}", response.statusCode());
                return false;
            }

            // Parse the JSON response
            ObjectMapper mapper = new ObjectMapper();
            JsonNode jsonNode = mapper.readTree(response.body());

            boolean success = jsonNode.get("success").asBoolean();
            JsonNode errorCodes = jsonNode.get("error-codes");

            if (!success) {
                if (errorCodes != null && errorCodes.isArray()) {
                    log.error("Turnstile validation failed with errors: {}", errorCodes.toString());
                } else {
                    log.error("Turnstile validation failed");
                }
                return false;
            }

            log.info("Turnstile token validated successfully");
            return true;

        } catch (IOException | InterruptedException e) {
            log.error("Error validating Turnstile token", e);
            Thread.currentThread().interrupt(); // restore interrupt status
            return false;
        } catch (Exception e) {
            log.error("Unexpected error validating Turnstile token", e);
            return false;
        }
    }

    /**
     * Validates the Cloudflare Turnstile token without IP address
     * @param token The token to validate
     * @return true if the token is valid, false otherwise
     */
    public boolean validateToken(String token) {
        return validateToken(token, null);
    }
}