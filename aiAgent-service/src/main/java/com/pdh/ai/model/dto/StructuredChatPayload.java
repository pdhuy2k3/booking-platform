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
    @JsonProperty(value = "message",required = true)
    @JsonPropertyDescription("Natural language response message to the user")
    private String message;
    
    @JsonProperty(value = "results",required = true)
    @JsonPropertyDescription("Array of structured result items like flights, hotels, or information cards")

    private List<StructuredResultItem> results ;
}
