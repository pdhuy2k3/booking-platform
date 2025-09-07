package com.pdh.hotel.dto.response;

import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO for media information fetched from media-service
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaInfo {
    private Long id;
    private String publicId;
    private String url;
    private String secureUrl;
    private String altText;
    private Boolean isPrimary;
    private Integer displayOrder;
    private String mediaType;
    private String resourceType;
    private String format;
    private Long fileSize;
    private Integer width;
    private Integer height;
    private String tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
