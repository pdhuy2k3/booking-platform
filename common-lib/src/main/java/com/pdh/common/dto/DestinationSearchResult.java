package com.pdh.common.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Standardized destination search result for both flight and hotel services
 */
@Data
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
public class DestinationSearchResult {
    
    /**
     * The destination name (city name, airport name, etc.)
     */
    private String name;
    
    /**
     * The destination type (city, airport, hotel, etc.)
     */
    private String type;
    
    /**
     * The country where the destination is located
     */
    private String country;
    
    /**
     * The category of the destination (city, airport, hotel, etc.)
     */
    private String category;
    
    /**
     * IATA code for airports (null for non-airport destinations)
     */
    private String iataCode;
    
    /**
     * Relevance score for search ranking (0.0 to 1.0)
     */
    private Double relevanceScore;
    
    /**
     * Additional description or details
     */
    private String description;
    
    /**
     * Geographic coordinates (latitude)
     */
    private Double latitude;
    
    /**
     * Geographic coordinates (longitude)
     */
    private Double longitude;
    
    /**
     * Create a city destination result
     */
    public static DestinationSearchResult city(String name, String country, String iataCode) {
        return DestinationSearchResult.builder()
                .name(name)
                .type("Thành phố")
                .country(country)
                .category("city")
                .iataCode(iataCode)
                .relevanceScore(1.0)
                .build();
    }
    
    /**
     * Create an airport destination result
     */
    public static DestinationSearchResult airport(String name, String city, String country, String iataCode) {
        return DestinationSearchResult.builder()
                .name(name)
                .type("Sân bay")
                .country(country)
                .category("airport")
                .iataCode(iataCode)
                .description(city)
                .relevanceScore(1.0)
                .build();
    }
    
    /**
     * Create a hotel destination result
     */
    public static DestinationSearchResult hotel(String name, String city, String country) {
        return DestinationSearchResult.builder()
                .name(name)
                .type("Khách sạn")
                .country(country)
                .category("hotel")
                .relevanceScore(1.0)
                .build();
    }
}
