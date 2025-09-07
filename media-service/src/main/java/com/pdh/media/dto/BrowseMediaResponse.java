package com.pdh.media.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response for browsing media with pagination")
public class BrowseMediaResponse {
    
    @Schema(description = "List of media resources")
    private List<Map<String, Object>> resources;
    
    @Schema(description = "Total number of resources", example = "150")
    private Integer totalCount;
    
    @Schema(description = "Cursor for next page pagination")
    private String nextCursor;
    
    @Schema(description = "Total number of pages", example = "8")
    private Integer totalPages;
    
    @Schema(description = "Current page number", example = "1")
    private Integer currentPage;
    
    @Schema(description = "Number of items per page", example = "20")
    private Integer pageSize;
    
    @Schema(description = "Whether there is a next page available")
    private Boolean hasNextPage;
    
    @Schema(description = "Whether there is a previous page available")
    private Boolean hasPreviousPage;
    
    @Schema(description = "Applied search filters")
    private BrowseMediaRequest filters;
}
