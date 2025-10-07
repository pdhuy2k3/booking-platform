package com.pdh.ai.model.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Dedicated response class for Explore endpoints.
 * Simplified structure optimized for destination discovery.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExploreResponse {
    
    @JsonProperty(required = true, value = "message")
    @JsonPropertyDescription("Natural language introduction message")
    private String message;
    
    @JsonProperty(required = true, value = "results")
    @JsonPropertyDescription("Array of destination recommendations")
    @Builder.Default
    private List<ExploreDestination> results = List.of();
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExploreDestination {
        
        @JsonProperty(required = true, value = "type")
        @JsonPropertyDescription("Always 'info' for destination cards")
        @Builder.Default
        private String type = "info";
        
        @JsonProperty(required = true, value = "title")
        @JsonPropertyDescription("Destination name (e.g., 'Đà Nẵng', 'Hạ Long Bay')")
        private String title;
        
        @JsonProperty(required = true, value = "subtitle")
        @JsonPropertyDescription("Brief compelling description of the destination")
        private String subtitle;
        
        @JsonProperty(required = true, value = "metadata")
        @JsonPropertyDescription("Detailed destination information")
        private DestinationMetadata metadata;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DestinationMetadata {
        
        @JsonProperty(required = true, value = "location")
        @JsonPropertyDescription("Full location string (e.g., 'Đà Nẵng, Việt Nam')")
        private String location;
        
        @JsonProperty(required = true, value = "latitude")
        @JsonPropertyDescription("Latitude coordinate (decimal degrees)")
        private Double latitude;
        
        @JsonProperty(required = true, value = "longitude")
        @JsonPropertyDescription("Longitude coordinate (decimal degrees)")
        private Double longitude;
        
        @JsonProperty(value = "highlights")
        @JsonPropertyDescription("Array of key attractions or features")
        private List<String> highlights;
        
        @JsonProperty(value = "best_time")
        @JsonPropertyDescription("Best time to visit (e.g., 'Tháng 3-8', 'April to October')")
        private String bestTime;
        
        @JsonProperty(value = "estimated_cost")
        @JsonPropertyDescription("Estimated daily cost range (e.g., '2-5 triệu VND/ngày')")
        private String estimatedCost;
    }
}
