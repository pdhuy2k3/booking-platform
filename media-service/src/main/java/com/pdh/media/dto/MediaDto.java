package com.pdh.media.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

/**
 * DTO for Media entity
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MediaDto {
    
    private Long id;
    private String publicId;
    private String url;
    private String secureUrl;
    private String mediaType;
    private String resourceType;
    private String format;
    private String originalFilename;
    private String folder;
    private Long fileSize;
    private Integer width;
    private Integer height;
    private String altText;
    private Integer displayOrder;
    private Boolean isPrimary;
    private Boolean isActive;
    private String metadata;
    private String tags;
    private Long version;
    private String assetId;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}
