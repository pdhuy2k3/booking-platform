package com.pdh.hotel.dto.response;

import com.pdh.common.dto.response.MediaResponse;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

/**
 * DTO for returning room type information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeResponseDto {
    
    private Long id;
    private String name;
    private String description;
    private Integer capacityAdults;
    private BigDecimal basePrice;
    
    // Media information
    private List<MediaResponse> media;
    private MediaResponse primaryImage;
    private Boolean hasMedia;
    private Integer mediaCount;
    
    // Audit fields
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
}
