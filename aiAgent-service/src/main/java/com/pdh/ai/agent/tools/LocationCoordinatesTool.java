package com.pdh.ai.agent.tools;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.function.Function;

/**
 * Location coordinates tool that uses Open-Meteo Geocoding API
 * to convert location names to latitude/longitude coordinates
 */
@Component
public class LocationCoordinatesTool implements Function<LocationCoordinatesTool.LocationRequest, LocationCoordinatesTool.LocationResponse> {

    private final RestTemplate restTemplate;
    private static final String GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1";
    private static final String DEFAULT_LANGUAGE = "en"; // Changed from "vn" to "en" for better international support

    public LocationCoordinatesTool() {
        this.restTemplate = new RestTemplate();
    }

    @Override
    public LocationResponse apply(LocationRequest request) {
        try {
            String locationName = request.locationName().trim();
            if (locationName.isEmpty()) {
                return new LocationResponse(
                    0.0, 0.0, request.locationName(), false,
                    "Location name cannot be empty"
                );
            }

            // Build the API URL
            String url = UriComponentsBuilder.fromUriString(GEOCODING_BASE_URL + "/search")
                    .queryParam("name", locationName)
                    .queryParam("count", 1) // Get only the best match
                    .queryParam("language", DEFAULT_LANGUAGE)
                    .queryParam("format", "json")
                    .build()
                    .toUriString();

            // Make API call
            OpenMeteoGeocodingResponse response = restTemplate.getForObject(url, OpenMeteoGeocodingResponse.class);

            if (response == null || response.results == null || response.results.isEmpty()) {
                return new LocationResponse(
                    0.0, 0.0, request.locationName(), false,
                    "Location not found. Please try a different location name or provide coordinates manually."
                );
            }

            OpenMeteoGeocodingResult result = response.results.get(0);
            
            return new LocationResponse(
                result.latitude,
                result.longitude,
                result.name + (result.country != null ? ", " + result.country : ""),
                true,
                null
            );

        } catch (Exception e) {
            return new LocationResponse(
                0.0, 0.0, request.locationName(), false,
                "Error fetching location coordinates: " + e.getMessage()
            );
        }
    }

    // Request DTO
    public record LocationRequest(
            @JsonProperty("location_name")
            @JsonPropertyDescription("Name of the city or location to get coordinates for (e.g., 'Ho Chi Minh City', 'Paris', 'New York')")
            String locationName
    ) {}

    // Response DTO
    public record LocationResponse(
            double latitude,
            double longitude,
            String locationName,
            boolean found,
            String error
    ) {}

    // Open-Meteo API Response DTOs
    @JsonIgnoreProperties(ignoreUnknown = true)
    static class OpenMeteoGeocodingResponse {
        @JsonProperty("results")
        public List<OpenMeteoGeocodingResult> results;
        
        @JsonProperty("generationtime_ms")
        public Double generationtimeMs;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    static class OpenMeteoGeocodingResult {
        @JsonProperty("id")
        public Integer id;
        
        @JsonProperty("name")
        public String name;
        
        @JsonProperty("latitude")
        public double latitude;
        
        @JsonProperty("longitude")
        public double longitude;
        
        @JsonProperty("elevation")
        public Double elevation;
        
        @JsonProperty("feature_code")
        public String featureCode;
        
        @JsonProperty("country_code")
        public String countryCode;
        
        @JsonProperty("country")
        public String country;
        
        @JsonProperty("population")
        public Integer population;
        
        @JsonProperty("timezone")
        public String timezone;
        
        @JsonProperty("admin1")
        public String admin1;
        
        @JsonProperty("admin2")
        public String admin2;
        
        @JsonProperty("admin3")
        public String admin3;
        
        @JsonProperty("admin4")
        public String admin4;
    }
}