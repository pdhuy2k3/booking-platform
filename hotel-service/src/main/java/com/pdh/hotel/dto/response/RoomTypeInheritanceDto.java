package com.pdh.hotel.dto.response;

import com.pdh.common.dto.response.MediaResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for returning room type information that can be inherited by rooms
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomTypeInheritanceDto {
    
    private Long id;
    private String name;
    private String description;
    private BigDecimal basePrice;
    
    // Media information that can be inherited
    private List<MediaResponse> media;
    private MediaResponse primaryImage;
    private Boolean hasMedia;
    private Integer mediaCount;
}