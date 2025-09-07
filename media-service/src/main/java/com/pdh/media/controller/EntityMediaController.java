package com.pdh.media.controller;

import com.pdh.common.dto.ApiResponse;
import com.pdh.media.dto.MediaDto;
import com.pdh.media.dto.MediaUploadDto;
import com.pdh.media.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * REST controller for entity-based media management
 */
@RestController
@RequestMapping("/entity")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Entity Media Management", description = "Manage media files associated with entities")
public class EntityMediaController {

    private final MediaService mediaService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload media for an entity", 
              description = "Upload a media file and associate it with a specific entity")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Media uploaded successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Upload failed")
    })
    public ResponseEntity<ApiResponse<MediaDto>> uploadMedia(
            @Parameter(description = "Media file to upload", required = true)
            @RequestParam("file") MultipartFile file,
            
            @Parameter(description = "Entity type (e.g., HOTEL, ROOM, FLIGHT)", required = true)
            @RequestParam("entityType") String entityType,
            
            @Parameter(description = "Entity ID", required = true)
            @RequestParam("entityId") Long entityId,
            
            @Parameter(description = "Media type (e.g., PRIMARY, GALLERY)")
            @RequestParam(value = "mediaType", defaultValue = "GALLERY") String mediaType,
            
            @Parameter(description = "Alternative text for accessibility")
            @RequestParam(value = "altText", required = false) String altText,
            
            @Parameter(description = "Display order")
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder,
            
            @Parameter(description = "Set as primary media")
            @RequestParam(value = "isPrimary", defaultValue = "false") Boolean isPrimary,
            
            @Parameter(description = "Tags (comma-separated)")
            @RequestParam(value = "tags", required = false) String tags,
            
            @Parameter(description = "Custom folder path")
            @RequestParam(value = "folder", required = false) String folder
    ) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File is empty", "EMPTY_FILE"));
            }

            MediaUploadDto uploadDto = MediaUploadDto.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .mediaType(mediaType)
                    .altText(altText)
                    .displayOrder(displayOrder)
                    .isPrimary(isPrimary)
                    .tags(tags)
                    .folder(folder)
                    .build();

            MediaDto mediaDto = mediaService.uploadMedia(file, uploadDto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(mediaDto));

        } catch (Exception e) {
            log.error("Error uploading media for entity {}/{}: {}", entityType, entityId, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Upload failed: " + e.getMessage(), "UPLOAD_FAILED"));
        }
    }

    @PostMapping(value = "/upload/multiple", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload multiple media files for an entity")
    public ResponseEntity<ApiResponse<List<MediaDto>>> uploadMultipleMedia(
            @Parameter(description = "Media files to upload", required = true)
            @RequestParam("files") List<MultipartFile> files,
            
            @Parameter(description = "Entity type", required = true)
            @RequestParam("entityType") String entityType,
            
            @Parameter(description = "Entity ID", required = true)
            @RequestParam("entityId") Long entityId,
            
            @Parameter(description = "Media type")
            @RequestParam(value = "mediaType", defaultValue = "GALLERY") String mediaType,
            
            @Parameter(description = "Tags (comma-separated)")
            @RequestParam(value = "tags", required = false) String tags
    ) {
        try {
            if (files.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("No files provided", "NO_FILES"));
            }

            MediaUploadDto uploadDto = MediaUploadDto.builder()
                    .entityType(entityType)
                    .entityId(entityId)
                    .mediaType(mediaType)
                    .tags(tags)
                    .build();

            List<MediaDto> mediaDtos = mediaService.uploadMultipleMedia(files, uploadDto);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(mediaDtos));

        } catch (Exception e) {
            log.error("Error uploading multiple media for entity {}/{}: {}", 
                     entityType, entityId, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Upload failed: " + e.getMessage(), "UPLOAD_FAILED"));
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get media by ID")
    public ResponseEntity<ApiResponse<MediaDto>> getMediaById(@PathVariable Long id) {
        try {
            MediaDto mediaDto = mediaService.getMediaById(id);
            return ResponseEntity.ok(ApiResponse.success(mediaDto));
        } catch (Exception e) {
            log.error("Error fetching media with id {}: {}", id, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/public/{publicId}")
    @Operation(summary = "Get media by public ID")
    public ResponseEntity<ApiResponse<MediaDto>> getMediaByPublicId(@PathVariable String publicId) {
        try {
            MediaDto mediaDto = mediaService.getMediaByPublicId(publicId);
            return ResponseEntity.ok(ApiResponse.success(mediaDto));
        } catch (Exception e) {
            log.error("Error fetching media with publicId {}: {}", publicId, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{entityType}/{entityId}")
    @Operation(summary = "Get all media for an entity")
    public ResponseEntity<ApiResponse<List<MediaDto>>> getMediaByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId
    ) {
        List<MediaDto> mediaDtos = mediaService.getMediaByEntity(entityType, entityId);
        return ResponseEntity.ok(ApiResponse.success(mediaDtos));
    }

    @GetMapping("/{entityType}/{entityId}/primary")
    @Operation(summary = "Get primary media for an entity")
    public ResponseEntity<ApiResponse<MediaDto>> getPrimaryMedia(
            @PathVariable String entityType,
            @PathVariable Long entityId
    ) {
        MediaDto mediaDto = mediaService.getPrimaryMedia(entityType, entityId);
        if (mediaDto == null) {
            return ResponseEntity.ok(ApiResponse.success(null));
        }
        return ResponseEntity.ok(ApiResponse.success(mediaDto));
    }

    @GetMapping("/{entityType}/{entityId}/type/{mediaType}")
    @Operation(summary = "Get media by entity and media type")
    public ResponseEntity<ApiResponse<List<MediaDto>>> getMediaByEntityAndType(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            @PathVariable String mediaType
    ) {
        List<MediaDto> mediaDtos = mediaService.getMediaByEntityAndType(entityType, entityId, mediaType);
        return ResponseEntity.ok(ApiResponse.success(mediaDtos));
    }

    @PostMapping("/{entityType}/batch")
    @Operation(summary = "Get media for multiple entities")
    public ResponseEntity<ApiResponse<Map<Long, List<MediaDto>>>> getMediaForEntities(
            @PathVariable String entityType,
            @RequestBody List<Long> entityIds
    ) {
        Map<Long, List<MediaDto>> mediaMap = mediaService.getMediaForEntities(entityType, entityIds);
        return ResponseEntity.ok(ApiResponse.success(mediaMap));
    }

    @PostMapping("/{entityType}/batch/primary")
    @Operation(summary = "Get primary media for multiple entities")
    public ResponseEntity<ApiResponse<Map<Long, MediaDto>>> getPrimaryMediaForEntities(
            @PathVariable String entityType,
            @RequestBody List<Long> entityIds
    ) {
        Map<Long, MediaDto> mediaMap = mediaService.getPrimaryMediaForEntities(entityType, entityIds);
        return ResponseEntity.ok(ApiResponse.success(mediaMap));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update media metadata")
    public ResponseEntity<ApiResponse<MediaDto>> updateMedia(
            @PathVariable Long id,
            @RequestBody MediaUploadDto updateDto
    ) {
        try {
            MediaDto mediaDto = mediaService.updateMedia(id, updateDto);
            return ResponseEntity.ok(ApiResponse.success(mediaDto));
        } catch (Exception e) {
            log.error("Error updating media {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Update failed: " + e.getMessage(), "UPDATE_FAILED"));
        }
    }

    @PutMapping("/{id}/primary")
    @Operation(summary = "Set media as primary for its entity")
    public ResponseEntity<ApiResponse<MediaDto>> setPrimaryMedia(@PathVariable Long id) {
        try {
            MediaDto mediaDto = mediaService.setPrimaryMedia(id);
            return ResponseEntity.ok(ApiResponse.success(mediaDto));
        } catch (Exception e) {
            log.error("Error setting primary media {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Operation failed: " + e.getMessage(), "OPERATION_FAILED"));
        }
    }

    @PutMapping("/{id}/display-order")
    @Operation(summary = "Update media display order")
    public ResponseEntity<ApiResponse<String>> updateDisplayOrder(
            @PathVariable Long id,
            @RequestParam Integer displayOrder
    ) {
        mediaService.updateDisplayOrder(id, displayOrder);
        return ResponseEntity.ok(ApiResponse.success("Display order updated"));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete media by ID")
    public ResponseEntity<ApiResponse<String>> deleteMedia(@PathVariable Long id) {
        try {
            mediaService.deleteMedia(id);
            return ResponseEntity.ok(ApiResponse.success("Media deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting media {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Delete failed: " + e.getMessage(), "DELETE_FAILED"));
        }
    }

    @DeleteMapping("/public/{publicId}")
    @Operation(summary = "Delete media by public ID")
    public ResponseEntity<ApiResponse<String>> deleteMediaByPublicId(@PathVariable String publicId) {
        try {
            mediaService.deleteMediaByPublicId(publicId);
            return ResponseEntity.ok(ApiResponse.success("Media deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting media with publicId {}: {}", publicId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Delete failed: " + e.getMessage(), "DELETE_FAILED"));
        }
    }

    @DeleteMapping("/{entityType}/{entityId}")
    @Operation(summary = "Delete all media for an entity")
    public ResponseEntity<ApiResponse<String>> deleteMediaByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId
    ) {
        try {
            mediaService.deleteMediaByEntity(entityType, entityId);
            return ResponseEntity.ok(ApiResponse.success("All media deleted for entity"));
        } catch (Exception e) {
            log.error("Error deleting media for entity {}/{}: {}", entityType, entityId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Delete failed: " + e.getMessage(), "DELETE_FAILED"));
        }
    }

    @GetMapping("/search/tag")
    @Operation(summary = "Search media by tag")
    public ResponseEntity<ApiResponse<Page<MediaDto>>> searchByTag(
            @RequestParam String tag,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<MediaDto> mediaPage = mediaService.searchByTag(tag, pageable);
        return ResponseEntity.ok(ApiResponse.success(mediaPage));
    }

    @GetMapping("/type/{entityType}")
    @Operation(summary = "Get all media for an entity type")
    public ResponseEntity<ApiResponse<Page<MediaDto>>> getMediaByEntityType(
            @PathVariable String entityType,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<MediaDto> mediaPage = mediaService.getMediaByEntityType(entityType, pageable);
        return ResponseEntity.ok(ApiResponse.success(mediaPage));
    }

    @GetMapping("/{entityType}/{entityId}/check")
    @Operation(summary = "Check if entity has media")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkEntityHasMedia(
            @PathVariable String entityType,
            @PathVariable Long entityId
    ) {
        boolean hasMedia = mediaService.hasMedia(entityType, entityId);
        long count = mediaService.countMedia(entityType, entityId);
        
        Map<String, Object> result = new HashMap<>();
        result.put("hasMedia", hasMedia);
        result.put("count", count);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @PutMapping("/{entityType}/{entityId}/reorder")
    @Operation(summary = "Reorder media for an entity")
    public ResponseEntity<ApiResponse<String>> reorderMedia(
            @PathVariable String entityType,
            @PathVariable Long entityId,
            @RequestBody List<Long> mediaIds
    ) {
        mediaService.reorderMedia(entityType, entityId, mediaIds);
        return ResponseEntity.ok(ApiResponse.success("Media reordered successfully"));
    }

    @PostMapping("/{entityType}/{entityId}/associate")
    @Operation(summary = "Associate existing media with an entity", 
              description = "Associate already uploaded media (by public IDs) with a specific entity")
    @ApiResponses(value = {
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Media associated successfully"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid request"),
        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Media not found")
    })
    public ResponseEntity<ApiResponse<List<MediaDto>>> associateMediaWithEntity(
            @Parameter(description = "Entity type (e.g., HOTEL, ROOM, FLIGHT)", required = true)
            @PathVariable String entityType,
            
            @Parameter(description = "Entity ID", required = true)
            @PathVariable Long entityId,
            
            @Parameter(description = "List of media public IDs to associate", required = true)
            @RequestBody List<String> publicIds
    ) {
        try {
            if (publicIds == null || publicIds.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Public IDs list cannot be empty", "EMPTY_PUBLIC_IDS"));
            }

            List<MediaDto> associatedMedia = mediaService.associateMediaWithEntity(entityType, entityId, publicIds);
            return ResponseEntity.ok(ApiResponse.success(associatedMedia));

        } catch (Exception e) {
            log.error("Error associating media with entity {}/{}: {}", entityType, entityId, e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Association failed: " + e.getMessage(), "ASSOCIATION_FAILED"));
        }
    }
}
