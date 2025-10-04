package com.pdh.ai.model.dto;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StructuredResultItem {
    @JsonProperty("type")
    @JsonPropertyDescription("Type of result: flight, hotel, or info")
    private String type;
    
    @JsonProperty("title")
    @JsonPropertyDescription("Main title or heading for the result")
    private String title;
    
    @JsonProperty("subtitle")
    @JsonPropertyDescription("Secondary text or brief description")
    private String subtitle;
    
    @JsonProperty("description")
    @JsonPropertyDescription("Detailed description of the result")
    private String description;
    
    @JsonProperty("imageUrl")
    @JsonPropertyDescription("Optional URL to an image representing this result")
    private String imageUrl;
    
    @JsonProperty("metadata")
    @JsonPropertyDescription("Additional key-value pairs with specific details like price, duration, etc.")
    private Map<String, Object> metadata;
}
