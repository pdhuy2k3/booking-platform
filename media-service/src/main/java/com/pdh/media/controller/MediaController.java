package com.pdh.media.controller;

import com.pdh.common.dto.ApiResponse;
import com.pdh.media.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Media Upload", description = "Upload and manage media files in Cloudinary")
public class MediaController {

    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/image", consumes = {"multipart/form-data"})
    @Operation(summary = "Upload image to Cloudinary", description = "Upload image file and return Cloudinary URL")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Image uploaded successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid file"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Upload failed")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadImage(
            @Parameter(description = "Image file to upload", required = true)
            @RequestParam("file") MultipartFile file,
            
            @Parameter(description = "Folder path in Cloudinary")
            @RequestParam(value = "folder", required = false) String folder
    ) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File is empty", "EMPTY_FILE"));
            }

            Map<String, Object> uploadResult = cloudinaryService.uploadImage(file, folder);
            return ResponseEntity.ok(ApiResponse.success(uploadResult));

        } catch (Exception e) {
            log.error("Error uploading image", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Upload failed: " + e.getMessage(), "UPLOAD_FAILED"));
        }
    }

    @DeleteMapping("/image/{publicId}")
    @Operation(summary = "Delete image from Cloudinary", description = "Delete image by public ID")
    public ResponseEntity<ApiResponse<String>> deleteImage(
            @Parameter(description = "Cloudinary public ID", required = true)
            @PathVariable String publicId
    ) {
        try {
            cloudinaryService.deleteImage(publicId);
            return ResponseEntity.ok(ApiResponse.success("Image deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting image with public ID: {}", publicId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Delete failed: " + e.getMessage(), "DELETE_FAILED"));
        }
    }
    
    @GetMapping("/{publicId}")
    @Operation(summary = "Get image by public ID", description = "Retrieve image URL by Cloudinary public ID")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getImage(
            @Parameter(description = "Cloudinary public ID", required = true)
            @PathVariable String publicId
    ) {
        try {
            // Generate Cloudinary URL from public ID
            String cloudName = System.getenv("CLOUDINARY_CLOUD_NAME");
            if (cloudName == null || cloudName.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Cloudinary configuration not found", "CONFIG_ERROR"));
            }
            
            String imageUrl = String.format("https://res.cloudinary.com/%s/image/upload/%s", cloudName, publicId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("publicId", publicId);
            response.put("url", imageUrl);
            response.put("secureUrl", imageUrl);
            
            return ResponseEntity.ok(ApiResponse.success(response));
        } catch (Exception e) {
            log.error("Error retrieving image with public ID: {}", publicId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Retrieval failed: " + e.getMessage(), "RETRIEVAL_FAILED"));
        }
    }


    // Updated upload endpoint to support general media types
    @PostMapping(consumes = {"multipart/form-data"})
    @Operation(summary = "Upload media to Cloudinary", description = "Upload any media file and return Cloudinary URL")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Media uploaded successfully"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Invalid file"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "500", description = "Upload failed")
    })
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadMedia(
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

            Map<String, Object> uploadResult = cloudinaryService.uploadImage(file, folder);
            return ResponseEntity.ok(ApiResponse.success(uploadResult));

        } catch (Exception e) {
            log.error("Error uploading media", e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Upload failed: " + e.getMessage(), "UPLOAD_FAILED"));
        }
    }

    @DeleteMapping("/{publicId}")
    @Operation(summary = "Delete media from Cloudinary", description = "Delete media by public ID")
    public ResponseEntity<ApiResponse<String>> deleteMedia(
            @Parameter(description = "Cloudinary public ID", required = true)
            @PathVariable String publicId
    ) {
        try {
            cloudinaryService.deleteImage(publicId);
            return ResponseEntity.ok(ApiResponse.success("Media deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting media with public ID: {}", publicId, e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Delete failed: " + e.getMessage(), "DELETE_FAILED"));
        }
    }

    private int calculateTotalPages(Integer totalCount, int limit) {
        if (totalCount == null || totalCount == 0) return 0;
        return (int) Math.ceil((double) totalCount / limit);
    }
}