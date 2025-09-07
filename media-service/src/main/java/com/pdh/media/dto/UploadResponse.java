package com.pdh.media.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UploadResponse {
    private String publicId;
    private String url;
    private String secureUrl;
    private String format;
    private Integer width;
    private Integer height;
    private Long bytes;
    private String resourceType;
    private String message;
}