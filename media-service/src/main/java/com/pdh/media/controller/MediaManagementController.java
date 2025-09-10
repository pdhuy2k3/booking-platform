package com.pdh.media.controller;

import com.pdh.common.dto.ApiResponse;
import com.pdh.media.dto.MediaDto;
import com.pdh.media.service.MediaService;
import com.pdh.media.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;


/**
 * Controller for Media management operations
 * This controller integrates with MediaService for complete media lifecycle management
 */
@RestController
@RequestMapping("/management")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Media Management", description = "Complete media management including database integration")
public class MediaManagementController {

    private final MediaService mediaService;
    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/upload", consumes = {"multipart/form-data"})
    @Operation(summary = "Upload media file", description = "Upload media file and save metadata to database")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Media uploaded successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid file"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Upload failed")
    })
    public ResponseEntity<ApiResponse<MediaDto>> uploadMedia(
            @Parameter(description = "Media file to upload", required = true)
            @RequestParam("file") MultipartFile file,
            
            @Parameter(description = "Folder path in Cloudinary")
            @RequestParam(value = "folder", required = false) String folder
    ) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File is empty", "EMPTY_FILE"));
            }

            MediaDto mediaDto = mediaService.uploadMedia(file, folder);
            return ResponseEntity.ok(ApiResponse.success(mediaDto));

        } catch (Exception e) {
            log.error("Error uploading media", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Upload failed: " + e.getMessage(), "UPLOAD_FAILED"));
        }
    }

    @PostMapping(value = "/upload/multiple", consumes = {"multipart/form-data"})
    @Operation(summary = "Upload multiple media files", description = "Upload multiple media files and save metadata to database")
    public ResponseEntity<ApiResponse<List<MediaDto>>> uploadMultipleMedia(
            @Parameter(description = "Media files to upload", required = true)
            @RequestParam("files") List<MultipartFile> files,
            
            @Parameter(description = "Folder path in Cloudinary")
            @RequestParam(value = "folder", required = false) String folder
    ) {
        try {
            if (files.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("No files provided", "NO_FILES"));
            }

            List<MediaDto> mediaDtos = mediaService.uploadMultipleMedia(files, folder);
            return ResponseEntity.ok(ApiResponse.success(mediaDtos));

        } catch (Exception e) {
            log.error("Error uploading multiple media", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Upload failed: " + e.getMessage(), "UPLOAD_FAILED"));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get media by ID", description = "Retrieve media metadata by ID")
    public ResponseEntity<ApiResponse<MediaDto>> getMediaById(
            @Parameter(description = "Media ID", required = true)
            @PathVariable Long id
    ) {
        try {
            Optional<MediaDto> mediaDto = mediaService.getMediaById(id);
            if (mediaDto.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(mediaDto.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error retrieving media with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Retrieval failed: " + e.getMessage(), "RETRIEVAL_FAILED"));
        }
    }

    @GetMapping("/public-id/{publicId}")
    @Operation(summary = "Get media by public ID", description = "Retrieve media metadata by Cloudinary public ID")
    public ResponseEntity<ApiResponse<MediaDto>> getMediaByPublicId(
            @Parameter(description = "Cloudinary public ID", required = true)
            @PathVariable String publicId
    ) {
        try {
            Optional<MediaDto> mediaDto = mediaService.getMediaByPublicId(publicId);
            if (mediaDto.isPresent()) {
                return ResponseEntity.ok(ApiResponse.success(mediaDto.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            log.error("Error retrieving media with public ID: {}", publicId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Retrieval failed: " + e.getMessage(), "RETRIEVAL_FAILED"));
        }
    }

    @GetMapping
    @Operation(summary = "Get all media", description = "Retrieve all media with pagination")
    public ResponseEntity<ApiResponse<Page<MediaDto>>> getAllMedia(
            @Parameter(description = "Page number (0-based)")
            @RequestParam(value = "page", defaultValue = "0") int page,
            
            @Parameter(description = "Page size")
            @RequestParam(value = "size", defaultValue = "20") int size
    ) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<MediaDto> mediaPage = mediaService.getAllMedia(pageable);
            
            // If database is empty, log warning
            if (mediaPage.isEmpty()) {
                log.warn("No media found in database. Consider using /cloudinary endpoint or uploading media through /upload endpoint to sync with database.");
            }
            
            return ResponseEntity.ok(ApiResponse.success(mediaPage));
        } catch (Exception e) {
            log.error("Error retrieving media list", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Retrieval failed: " + e.getMessage(), "RETRIEVAL_FAILED"));
        }
    }

    @GetMapping("/cloudinary")
    @Operation(summary = "Get media from Cloudinary", description = "Retrieve media directly from Cloudinary (fallback when database is empty)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMediaFromCloudinary(
            @Parameter(description = "Folder to search in")
            @RequestParam(value = "folder", required = false) String folder,
            
            @Parameter(description = "Search term")
            @RequestParam(value = "search", required = false) String search,
            
            @Parameter(description = "Resource type")
            @RequestParam(value = "resource_type", defaultValue = "image") String resourceType,
            
            @Parameter(description = "Page number")
            @RequestParam(value = "page", defaultValue = "1") int page,
            
            @Parameter(description = "Max results")
            @RequestParam(value = "limit", defaultValue = "20") int limit
    ) {
        try {
            // Use CloudinaryService to browse assets
            Map<String, Object> result = cloudinaryService.browseMedia(folder, search, resourceType, page, limit);
            return ResponseEntity.ok(ApiResponse.success(result));
        } catch (Exception e) {
            log.error("Error retrieving media from Cloudinary", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Cloudinary retrieval failed: " + e.getMessage(), "CLOUDINARY_FAILED"));
        }
    }

    @GetMapping("/type/{mediaType}")
    @Operation(summary = "Get media by type", description = "Retrieve media by type")
    public ResponseEntity<ApiResponse<List<MediaDto>>> getMediaByType(
            @Parameter(description = "Media type", required = true)
            @PathVariable String mediaType
    ) {
        try {
            List<MediaDto> mediaDtos = mediaService.getMediaByType(mediaType);
            return ResponseEntity.ok(ApiResponse.success(mediaDtos));
        } catch (Exception e) {
            log.error("Error retrieving media by type: {}", mediaType, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Retrieval failed: " + e.getMessage(), "RETRIEVAL_FAILED"));
        }
    }

    @PostMapping("/convert-public-ids")
    @Operation(summary = "Convert public IDs to media IDs", 
               description = "Convert list of Cloudinary public IDs to internal media IDs. This is the key endpoint for image handling integration.")
    public ResponseEntity<ApiResponse<List<Long>>> convertPublicIdsToMediaIds(
            @Parameter(description = "Request containing publicIds array", required = true)
            @RequestBody Map<String, List<String>> request
    ) {
        try {
            List<String> publicIds = request.get("publicIds");
            if (publicIds == null || publicIds.isEmpty()) {
                return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
            }

            List<Long> mediaIds = mediaService.convertPublicIdsToMediaIds(publicIds);
            return ResponseEntity.ok(ApiResponse.success(mediaIds));

        } catch (Exception e) {
            log.error("Error converting public IDs to media IDs", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Conversion failed: " + e.getMessage(), "CONVERSION_FAILED"));
        }
    }

    @PostMapping("/convert-media-ids")
    @Operation(summary = "Convert media IDs to media DTOs", 
               description = "Convert list of media IDs to full media DTOs with public IDs for MediaSelector usage.")
    public ResponseEntity<ApiResponse<List<MediaDto>>> convertMediaIdsToMediaDtos(
            @Parameter(description = "List of media IDs", required = true)
            @RequestBody List<Long> mediaIds
    ) {
        try {
            if (mediaIds == null || mediaIds.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("No media IDs provided", "NO_MEDIA_IDS"));
            }

            List<MediaDto> mediaDtos = mediaService.getMediaByIds(mediaIds);
            return ResponseEntity.ok(ApiResponse.success(mediaDtos));

        } catch (Exception e) {
            log.error("Error converting media IDs to DTOs", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Conversion failed: " + e.getMessage(), "CONVERSION_FAILED"));
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update media metadata", description = "Update media metadata by ID")
    public ResponseEntity<ApiResponse<MediaDto>> updateMedia(
            @Parameter(description = "Media ID", required = true)
            @PathVariable Long id,
            
            @Parameter(description = "Updated media data", required = true)
            @RequestBody MediaDto mediaDto
    ) {
        try {
            MediaDto updatedMedia = mediaService.updateMedia(id, mediaDto);
            return ResponseEntity.ok(ApiResponse.success(updatedMedia));
        } catch (Exception e) {
            log.error("Error updating media with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Update failed: " + e.getMessage(), "UPDATE_FAILED"));
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete media", description = "Delete media by ID from both Cloudinary and database")
    public ResponseEntity<ApiResponse<String>> deleteMedia(
            @Parameter(description = "Media ID", required = true)
            @PathVariable Long id
    ) {
        try {
            mediaService.deleteMedia(id);
            return ResponseEntity.ok(ApiResponse.success("Media deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting media with ID: {}", id, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Delete failed: " + e.getMessage(), "DELETE_FAILED"));
        }
    }

    @DeleteMapping("/public-id/{publicId}")
    @Operation(summary = "Delete media by public ID", description = "Delete media by Cloudinary public ID from both Cloudinary and database")
    public ResponseEntity<ApiResponse<String>> deleteMediaByPublicId(
            @Parameter(description = "Cloudinary public ID", required = true)
            @PathVariable String publicId
    ) {
        try {
            mediaService.deleteMediaByPublicId(publicId);
            return ResponseEntity.ok(ApiResponse.success("Media deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting media with public ID: {}", publicId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Delete failed: " + e.getMessage(), "DELETE_FAILED"));
        }
    }

    @GetMapping("/exists/{publicId}")
    @Operation(summary = "Check if media exists", description = "Check if media exists by Cloudinary public ID")
    public ResponseEntity<ApiResponse<Boolean>> existsByPublicId(
            @Parameter(description = "Cloudinary public ID", required = true)
            @PathVariable String publicId
    ) {
        try {
            boolean exists = mediaService.existsByPublicId(publicId);
            return ResponseEntity.ok(ApiResponse.success(exists));
        } catch (Exception e) {
            log.error("Error checking media existence with public ID: {}", publicId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Check failed: " + e.getMessage(), "CHECK_FAILED"));
        }
    }

}
