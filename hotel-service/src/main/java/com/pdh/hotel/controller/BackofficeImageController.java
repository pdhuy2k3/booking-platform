package com.pdh.hotel.controller;

import com.pdh.hotel.client.MediaServiceClient;
import com.pdh.hotel.service.HotelImageService;
import com.pdh.hotel.service.RoomImageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

/**
 * REST Controller for hotel service image management
 */
@RestController
@RequestMapping("/backoffice/images")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Hotel Image Management", description = "APIs for managing images in hotel service entities")
@SecurityRequirement(name = "JWT")
public class BackofficeImageController {

    private final MediaServiceClient mediaServiceClient;
    private final HotelImageService hotelImageService;
    private final RoomImageService roomImageService;

    /**
     * Upload image for hotel
     */
    @PostMapping(value = "/hotels/{hotelId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('PARTNER')")
    @Operation(summary = "Upload hotel image", 
               description = "Upload an image for a specific hotel")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Image uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or file"),
        @ApiResponse(responseCode = "404", description = "Hotel not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> uploadHotelImage(
            @Parameter(description = "Hotel ID", required = true)
            @PathVariable Long hotelId,
            
            @Parameter(description = "Image file to upload", required = true)
            @RequestParam("file") MultipartFile file,
            
            @Parameter(description = "Image type (EXTERIOR, LOBBY, ROOM, AMENITY, etc.)")
            @RequestParam(required = false) String imageType,
            
            @Parameter(description = "Alt text for accessibility")
            @RequestParam(required = false) String altText,
            
            @Parameter(description = "Display order for image ordering")
            @RequestParam(required = false) Integer displayOrder,
            
            @Parameter(description = "Whether this is the primary image")
            @RequestParam(required = false, defaultValue = "false") Boolean isPrimary) {
        
        log.info("Uploading hotel image: hotelId={}, fileName={}, imageType={}", 
                 hotelId, file.getOriginalFilename(), imageType);
        
        try {
            // Validate file
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File cannot be empty");
            }
            
            // Upload to media service
            String imageUrl = mediaServiceClient.uploadImage(file, "hotels");
            
            // Save hotel image record
            Map<String, Object> imageData = new HashMap<>();
            imageData.put("hotelId", hotelId);
            imageData.put("imageUrl", imageUrl);
            imageData.put("imageType", imageType);
            imageData.put("altText", altText);
            imageData.put("displayOrder", displayOrder);
            imageData.put("isPrimary", isPrimary);
            
            Map<String, Object> savedImage = hotelImageService.createHotelImage(imageData);
            
            Map<String, Object> response = new HashMap<>();
            response.put("image", savedImage);
            response.put("message", "Hotel image uploaded successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid hotel image upload request: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid request");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error uploading hotel image", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload hotel image");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Upload image for room
     */
    @PostMapping(value = "/rooms/{roomId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('PARTNER')")
    @Operation(summary = "Upload room image", 
               description = "Upload an image for a specific room")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Image uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or file"),
        @ApiResponse(responseCode = "404", description = "Room not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> uploadRoomImage(
            @Parameter(description = "Room ID", required = true)
            @PathVariable Long roomId,
            
            @Parameter(description = "Image file to upload", required = true)
            @RequestParam("file") MultipartFile file,
            
            @Parameter(description = "Image type (ROOM, BATHROOM, VIEW, AMENITY, etc.)")
            @RequestParam(required = false) String imageType,
            
            @Parameter(description = "Alt text for accessibility")
            @RequestParam(required = false) String altText,
            
            @Parameter(description = "Display order for image ordering")
            @RequestParam(required = false) Integer displayOrder,
            
            @Parameter(description = "Whether this is the primary image")
            @RequestParam(required = false, defaultValue = "false") Boolean isPrimary) {
        
        log.info("Uploading room image: roomId={}, fileName={}, imageType={}", 
                 roomId, file.getOriginalFilename(), imageType);
        
        try {
            // Validate file
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File cannot be empty");
            }
            
            // Upload to media service
            String imageUrl = mediaServiceClient.uploadImage(file, "rooms");
            
            // Save room image record
            Map<String, Object> imageData = new HashMap<>();
            imageData.put("roomId", roomId);
            imageData.put("imageUrl", imageUrl);
            imageData.put("imageType", imageType);
            imageData.put("altText", altText);
            imageData.put("displayOrder", displayOrder);
            imageData.put("isPrimary", isPrimary);
            
            Map<String, Object> savedImage = roomImageService.createRoomImage(imageData);
            
            Map<String, Object> response = new HashMap<>();
            response.put("image", savedImage);
            response.put("message", "Room image uploaded successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid room image upload request: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid request");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error uploading room image", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload room image");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Upload amenity icon
     */
    @PostMapping(value = "/amenities/{amenityId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Upload amenity icon", 
               description = "Upload an icon for a specific amenity")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Icon uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or file"),
        @ApiResponse(responseCode = "404", description = "Amenity not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> uploadAmenityIcon(
            @Parameter(description = "Amenity ID", required = true)
            @PathVariable Long amenityId,
            
            @Parameter(description = "Icon file to upload", required = true)
            @RequestParam("file") MultipartFile file) {
        
        log.info("Uploading amenity icon: amenityId={}, fileName={}", 
                 amenityId, file.getOriginalFilename());
        
        try {
            // Validate file
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File cannot be empty");
            }
            
            // Upload to media service
            String iconUrl = mediaServiceClient.uploadImage(file, "amenities");
            
            // Update amenity with icon URL - this would need an amenity service method
            // For now, return the URL
            Map<String, Object> response = new HashMap<>();
            response.put("iconUrl", iconUrl);
            response.put("message", "Amenity icon uploaded successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid amenity icon upload request: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid request");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error uploading amenity icon", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload amenity icon");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Delete image by ID
     */
    @DeleteMapping("/{imageId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete image", 
               description = "Delete an image by ID (works for hotel and room images)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Image deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Image not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> deleteImage(
            @Parameter(description = "Image ID", required = true)
            @PathVariable Long imageId,
            
            @Parameter(description = "Entity type (hotel, room)", required = true)
            @RequestParam String entityType) {
        
        log.info("Deleting image: imageId={}, entityType={}", imageId, entityType);
        
        try {
            Map<String, Object> response = new HashMap<>();
            
            switch (entityType.toLowerCase()) {
                case "hotel":
                    hotelImageService.deleteHotelImage(imageId);
                    break;
                case "room":
                    roomImageService.deleteRoomImage(imageId);
                    break;
                default:
                    throw new IllegalArgumentException("Invalid entity type: " + entityType);
            }
            
            response.put("message", "Image deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid delete image request: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid request");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error deleting image: imageId={}", imageId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to delete image");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Get images for an entity
     */
    @GetMapping("/{entityType}/{entityId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('PARTNER')")
    @Operation(summary = "Get entity images", 
               description = "Get all images for a specific entity")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Images retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "Entity not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> getEntityImages(
            @Parameter(description = "Entity type (hotel, room)", required = true)
            @PathVariable String entityType,
            
            @Parameter(description = "Entity ID", required = true)
            @PathVariable Long entityId) {
        
        log.info("Getting images for entity: entityType={}, entityId={}", entityType, entityId);
        
        try {
            Map<String, Object> response = new HashMap<>();
            
            switch (entityType.toLowerCase()) {
                case "hotel":
                    response.put("images", hotelImageService.getHotelImages(entityId));
                    break;
                case "room":
                    response.put("images", roomImageService.getRoomImages(entityId));
                    break;
                default:
                    throw new IllegalArgumentException("Invalid entity type: " + entityType);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid get images request: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid request");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error getting images for entity: entityType={}, entityId={}", entityType, entityId, e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to get entity images");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}