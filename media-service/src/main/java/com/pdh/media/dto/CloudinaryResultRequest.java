package com.pdh.media.dto;

import com.pdh.media.enums.EntityType;
import com.pdh.media.enums.MediaType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CloudinaryResultRequest {
    private UUID entityId;
    private EntityType entityType;
    private MediaType mediaType;
    private String cloudinaryPublicId;
    private String mediaUrl;
    private String altText;
    private Integer displayOrder;
    private Boolean isPrimary;
    private Long fileSize;
    private String mimeType;
    private Integer width;
    private Integer height;
    private Integer duration;
}