package com.pdh.media.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request parameters for browsing media")
public class BrowseMediaRequest {
    
    @Schema(description = "Folder to filter by", example = "hotels")
    private String folder;
    
    @Schema(description = "Search query for filename", example = "hotel-room")
    private String search;
    
    @Schema(description = "Resource type filter", example = "image", allowableValues = {"image", "video", "raw"})
    private String resourceType = "image";
    
    @Schema(description = "Page number for pagination", example = "1", minimum = "1")
    @Min(value = 1, message = "Page number must be greater than 0")
    private int page = 1;
    
    @Schema(description = "Number of items per page", example = "20", minimum = "1", maximum = "100")
    @Min(value = 1, message = "Limit must be greater than 0")
    @Max(value = 100, message = "Limit cannot exceed 100")
    private int limit = 20;
    
    @Schema(description = "Sort direction", example = "desc", allowableValues = {"asc", "desc"})
    private String sortDirection = "desc";
    
    @Schema(description = "Next cursor for pagination", example = "fe3f5d81d0178e7e142bf3804e14082464594940156178268713220505")
    private String nextCursor;
}
