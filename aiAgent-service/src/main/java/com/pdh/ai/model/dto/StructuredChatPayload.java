package com.pdh.ai.model.dto;

import java.util.List;
import java.util.Collections;

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
public class StructuredChatPayload {
    @JsonProperty("message")
    @JsonPropertyDescription("Natural language response message to the user")
    private String message;
    
    @JsonProperty("results")
    @JsonPropertyDescription("Array of structured result items like flights, hotels, or information cards")
    @Builder.Default
    private List<StructuredResultItem> results = Collections.emptyList();
}
