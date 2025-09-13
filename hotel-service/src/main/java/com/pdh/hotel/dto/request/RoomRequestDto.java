package com.pdh.hotel.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.pdh.common.dto.response.MediaResponse;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO for creating or updating room information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class RoomRequestDto {
    
    @NotBlank(message = "Room number is required")
    @Size(max = 50, message = "Room number cannot exceed 50 characters")
    private String roomNumber;
    
    @NotNull(message = "Room type ID is required")
    private Long roomTypeId;
    
    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Invalid price format")
    private BigDecimal price;
    
    @Min(value = 1, message = "Max occupancy must be at least 1")
    @Max(value = 20, message = "Max occupancy cannot exceed 20")
    private Integer maxOccupancy;
    
    @Size(max = 100, message = "Bed type cannot exceed 100 characters")
    private String bedType;
    
    @Min(value = 1, message = "Room size must be at least 1 square meter")
    @Max(value = 1000, message = "Room size cannot exceed 1000 square meters")
    private Integer roomSize;
    
    @NotNull(message = "Availability status is required")
    private Boolean isAvailable;
    
    // List of amenity IDs to associate with this room
    private List<Long> amenityIds;
    
    // List of complete media responses to associate with this room
    private List<MediaResponse> media;
    
    // Flag to indicate whether to inherit price from room type
    private Boolean inheritPriceFromRoomType;
    
    // Flag to indicate whether to inherit media from room type
    private Boolean inheritMediaFromRoomType;
}
