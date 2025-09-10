package com.pdh.common.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MediaResponse {
    private Long id;
    private Long mediaId;
    private String publicId;
    private String url;
    private String secureUrl;
    private Boolean isPrimary;
    private Integer displayOrder;
}
