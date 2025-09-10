package com.pdh.media.dto;


import com.pdh.media.enums.MediaType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MediaUploadRequest {
    private MediaType mediaType;
    private String altText;
    private Integer displayOrder;
    private Boolean isPrimary;
    private String folder; // Cloudinary folder organization
}