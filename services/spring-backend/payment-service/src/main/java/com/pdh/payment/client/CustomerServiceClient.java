package com.pdh.payment.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.UUID;

/**
 * Client for Customer Service Integration
 * Fetches customer profile data for payment processing
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CustomerServiceClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${customer-service.base-url:http://customer-service}")
    private String customerServiceBaseUrl;

    @Value("${customer-service.timeout-seconds:10}")
    private int timeoutSeconds;

    /**
     * Get customer profile by user ID
     */
    public CustomerProfile getCustomerProfile(UUID userId) {
        log.debug("Fetching customer profile for user: {}", userId);

        try {
            String response = webClient.get()
                    .uri(customerServiceBaseUrl + "/api/customers/profile")
                    .header("X-User-ID", userId.toString()) // Pass user ID in header
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(timeoutSeconds))
                    .block();

            if (response != null) {
                CustomerProfile profile = objectMapper.readValue(response, CustomerProfile.class);
                log.debug("Successfully fetched customer profile for user: {}", userId);
                return profile;
            }

        } catch (WebClientResponseException e) {
            log.warn("Failed to fetch customer profile for user {}: HTTP {} - {}", 
                    userId, e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Error fetching customer profile for user: {}", userId, e);
        }

        // Return fallback profile
        log.info("Using fallback customer profile for user: {}", userId);
        return createFallbackProfile(userId);
    }

    /**
     * Create fallback customer profile when service is unavailable
     */
    private CustomerProfile createFallbackProfile(UUID userId) {
        CustomerProfile fallback = new CustomerProfile();
        fallback.setUserId(userId);
        fallback.setEmail("user-" + userId.toString().substring(0, 8) + "@bookingsmart.com");
        fallback.setFullName("Customer " + userId.toString().substring(0, 8));
        fallback.setPhone("+84900000000");
        fallback.setAddress("Default Address");
        fallback.setCity("Ho Chi Minh City");
        fallback.setState("Ho Chi Minh");
        fallback.setCountry("Vietnam");
        fallback.setPostalCode("700000");
        return fallback;
    }

    /**
     * Customer Profile DTO
     */
    public static class CustomerProfile {
        private UUID userId;
        private String email;
        private String fullName;
        private String phone;
        private String address;
        private String addressLine2;
        private String city;
        private String state;
        private String country;
        private String postalCode;

        // Getters and setters
        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getAddressLine2() { return addressLine2; }
        public void setAddressLine2(String addressLine2) { this.addressLine2 = addressLine2; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }

        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }
    }
}
