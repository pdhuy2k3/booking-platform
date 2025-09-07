package com.pdh.media.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for media upload requests
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaUploadDto {
    
    @NotBlank(message = "Entity type is required")
    private String entityType;
    
    @NotNull(message = "Entity ID is required")
    private Long entityId;
    
    private String mediaType = "GALLERY";
    
    private String altText;
    
    private Integer displayOrder = 1;
    
    private Boolean isPrimary = false;
    
    private String tags;
    
    private String folder;
    
    private String metadata;
}
