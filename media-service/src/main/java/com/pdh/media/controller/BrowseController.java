package com.pdh.media.controller;

import com.pdh.common.dto.ApiResponse;
import com.pdh.media.dto.BrowseMediaRequest;
import com.pdh.media.dto.BrowseMediaResponse;
import com.pdh.media.dto.FolderResponse;
import com.pdh.media.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/browse")
@RequiredArgsConstructor
@Slf4j
@Validated
@Tag(name = "Media Browse", description = "Browse and search media files in Cloudinary")
public class BrowseController {

    private final CloudinaryService cloudinaryService;

    @GetMapping
    @Operation(
        summary = "Browse media files", 
        description = "Browse and search media files with advanced filtering and pagination"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Media files retrieved successfully",
            content = @Content(schema = @Schema(implementation = BrowseMediaResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "Invalid request parameters"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500", 
            description = "Internal server error"
        )
    })
    public ResponseEntity<ApiResponse<BrowseMediaResponse>> browseMedia(
            @Parameter(description = "Folder to filter by") 
            @RequestParam(value = "folder", required = false) String folder,
            
            @Parameter(description = "Search query for filename") 
            @RequestParam(value = "search", required = false) String search,
            
            @Parameter(description = "Resource type filter") 
            @RequestParam(value = "resource_type", required = false, defaultValue = "image") String resourceType,
            
            @Parameter(description = "Page number for pagination") 
            @RequestParam(value = "page", required = false, defaultValue = "1") int page,
            
            @Parameter(description = "Number of items per page") 
            @RequestParam(value = "limit", required = false, defaultValue = "20") int limit,
            
            @Parameter(description = "Next cursor for pagination") 
            @RequestParam(value = "next_cursor", required = false) String nextCursor,
            
            @Parameter(description = "Sort direction") 
            @RequestParam(value = "sort_direction", required = false, defaultValue = "desc") String sortDirection
    ) {
        try {
            // Create request object
            BrowseMediaRequest request = new BrowseMediaRequest(
                folder, search, resourceType, page, limit, sortDirection, nextCursor
            );

            // Validate request parameters
            if (page < 1) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Page number must be greater than 0", "INVALID_PAGE"));
            }
            
            if (limit < 1 || limit > 100) {
                return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Limit must be between 1 and 100", "INVALID_LIMIT"));
            }

            log.info("Browsing media with params: folder={}, search={}, resourceType={}, page={}, limit={}", 
                    folder, search, resourceType, page, limit);

            // Get media from Cloudinary
            Map<String, Object> cloudinaryResult = cloudinaryService.browseMedia(
                folder, search, resourceType, page, limit, nextCursor
            );

            // Build response
            BrowseMediaResponse response = buildBrowseResponse(cloudinaryResult, request);

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (IllegalArgumentException e) {
            log.warn("Invalid request parameters: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Invalid parameters: " + e.getMessage(), "INVALID_PARAMS"));
        } catch (Exception e) {
            log.error("Error browsing media", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Browse failed: " + e.getMessage(), "BROWSE_FAILED"));
        }
    }

    @PostMapping("/search")
    @Operation(
        summary = "Advanced media search", 
        description = "Search media files using POST with request body for complex queries"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Search completed successfully",
            content = @Content(schema = @Schema(implementation = BrowseMediaResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "400", 
            description = "Invalid search request"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500", 
            description = "Search operation failed"
        )
    })
    public ResponseEntity<ApiResponse<BrowseMediaResponse>> searchMedia(
            @Valid @RequestBody BrowseMediaRequest request
    ) {
        try {
            log.info("Advanced media search with request: {}", request);

            // Get media from Cloudinary
            Map<String, Object> cloudinaryResult = cloudinaryService.browseMedia(
                request.getFolder(), 
                request.getSearch(), 
                request.getResourceType(), 
                request.getPage(), 
                request.getLimit(),
                request.getNextCursor()
            );

            // Build response
            BrowseMediaResponse response = buildBrowseResponse(cloudinaryResult, request);

            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            log.error("Error in advanced media search", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Search failed: " + e.getMessage(), "SEARCH_FAILED"));
        }
    }

    @GetMapping("/folders")
    @Operation(
        summary = "Get available folders", 
        description = "Retrieve list of available folders in Cloudinary storage"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Folders retrieved successfully",
            content = @Content(schema = @Schema(implementation = FolderResponse.class))
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500", 
            description = "Failed to retrieve folders"
        )
    })
    public ResponseEntity<ApiResponse<FolderResponse>> getFolders() {
        try {
            log.info("Getting available folders");
            
            Map<String, Object> cloudinaryResult = cloudinaryService.getFolders();
            
            // Build folder response
            FolderResponse response = new FolderResponse();
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> folders = (List<Map<String, Object>>) cloudinaryResult.get("folders");
            
            response.setFolders(folders);
            response.setTotalFolders(folders != null ? folders.size() : 0);
            response.setMaxResults(100); // Default max from CloudinaryService
            
            return ResponseEntity.ok(ApiResponse.success(response));

        } catch (Exception e) {
            log.error("Error getting folders", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Get folders failed: " + e.getMessage(), "FOLDERS_FAILED"));
        }
    }

    @GetMapping("/stats")
    @Operation(
        summary = "Get media statistics", 
        description = "Get statistics about media files by folder and type"
    )
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "200", 
            description = "Statistics retrieved successfully"
        ),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(
            responseCode = "500", 
            description = "Failed to retrieve statistics"
        )
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMediaStats(
            @Parameter(description = "Folder to get statistics for")
            @RequestParam(value = "folder", required = false) String folder
    ) {
        try {
            log.info("Getting media statistics for folder: {}", folder);
            
            // Get basic media count from browse endpoint with limit 1 to just get totals
            Map<String, Object> result = cloudinaryService.browseMedia(folder, null, null, 1, 1);
            
            // Build statistics response
            Map<String, Object> stats = Map.of(
                "folder", folder != null ? folder : "all",
                "totalMediaFiles", result.getOrDefault("total_count", 0),
                "hasNextPage", result.get("next_cursor") != null
            );
            
            return ResponseEntity.ok(ApiResponse.success(stats));

        } catch (Exception e) {
            log.error("Error getting media statistics", e);
            return ResponseEntity.internalServerError()
                .body(ApiResponse.error("Get statistics failed: " + e.getMessage(), "STATS_FAILED"));
        }
    }

    /**
     * Build comprehensive browse response from Cloudinary result
     */
    private BrowseMediaResponse buildBrowseResponse(Map<String, Object> cloudinaryResult, BrowseMediaRequest request) {
        BrowseMediaResponse response = new BrowseMediaResponse();
        
        // Extract data from Cloudinary response
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> resources = (List<Map<String, Object>>) cloudinaryResult.get("resources");
        Integer totalCount = (Integer) cloudinaryResult.get("total_count");
        String nextCursor = (String) cloudinaryResult.get("next_cursor");
        
        // Set basic response data
        response.setResources(resources != null ? resources : List.of());
        response.setTotalCount(totalCount != null ? totalCount : 0);
        response.setNextCursor(nextCursor);
        response.setCurrentPage(request.getPage());
        response.setPageSize(request.getLimit());
        
        // Calculate pagination info
        int totalPages = calculateTotalPages(totalCount, request.getLimit());
        response.setTotalPages(totalPages);
        response.setHasNextPage(request.getPage() < totalPages || nextCursor != null);
        response.setHasPreviousPage(request.getPage() > 1);
        
        // Set applied filters
        response.setFilters(request);
        
        return response;
    }

    /**
     * Calculate total pages for pagination
     */
    private int calculateTotalPages(Integer totalCount, int limit) {
        if (totalCount == null || totalCount == 0) return 0;
        return (int) Math.ceil((double) totalCount / limit);
    }
}
