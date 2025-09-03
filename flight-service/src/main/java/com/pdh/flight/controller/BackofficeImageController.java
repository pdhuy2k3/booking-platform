package com.pdh.flight.controller;

import com.pdh.flight.client.MediaServiceClient;
import com.pdh.flight.service.AirlineImageService;
import com.pdh.flight.service.AirportImageService;
import com.pdh.flight.service.FlightImageService;
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
 * REST Controller for flight service image management
 */
@RestController
@RequestMapping("/backoffice/images")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Flight Image Management", description = "APIs for managing images in flight service entities")
@SecurityRequirement(name = "JWT")
public class BackofficeImageController {

    private final MediaServiceClient mediaServiceClient;
    private final AirlineImageService airlineImageService;
    private final AirportImageService airportImageService;
    private final FlightImageService flightImageService;

    /**
     * Upload image for airline
     */
    @PostMapping(value = "/airlines/{airlineId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('PARTNER')")
    @Operation(summary = "Upload airline image", 
               description = "Upload an image for a specific airline")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Image uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or file"),
        @ApiResponse(responseCode = "404", description = "Airline not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> uploadAirlineImage(
            @Parameter(description = "Airline ID", required = true)
            @PathVariable Long airlineId,
            
            @Parameter(description = "Image file to upload", required = true)
            @RequestParam("file") MultipartFile file,
            
            @Parameter(description = "Image type (LOGO, AIRCRAFT, LIVERY, etc.)")
            @RequestParam(required = false) String imageType,
            
            @Parameter(description = "Alt text for accessibility")
            @RequestParam(required = false) String altText,
            
            @Parameter(description = "Display order for image ordering")
            @RequestParam(required = false) Integer displayOrder,
            
            @Parameter(description = "Whether this is the primary image")
            @RequestParam(required = false, defaultValue = "false") Boolean isPrimary) {
        
        log.info("Uploading airline image: airlineId={}, fileName={}, imageType={}", 
                 airlineId, file.getOriginalFilename(), imageType);
        
        try {
            // Validate file
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File cannot be empty");
            }
            
            // Upload to media service
            String imageUrl = mediaServiceClient.uploadImage(file, "airlines");
            
            // Save airline image record
            Map<String, Object> imageData = new HashMap<>();
            imageData.put("airlineId", airlineId);
            imageData.put("imageUrl", imageUrl);
            imageData.put("imageType", imageType);
            imageData.put("altText", altText);
            imageData.put("displayOrder", displayOrder);
            imageData.put("isPrimary", isPrimary);
            
            Map<String, Object> savedImage = airlineImageService.createAirlineImage(imageData);
            
            Map<String, Object> response = new HashMap<>();
            response.put("image", savedImage);
            response.put("message", "Airline image uploaded successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid airline image upload request: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid request");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error uploading airline image", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload airline image");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Upload image for airport
     */
    @PostMapping(value = "/airports/{airportId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('PARTNER')")
    @Operation(summary = "Upload airport image", 
               description = "Upload an image for a specific airport")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Image uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or file"),
        @ApiResponse(responseCode = "404", description = "Airport not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> uploadAirportImage(
            @Parameter(description = "Airport ID", required = true)
            @PathVariable Long airportId,
            
            @Parameter(description = "Image file to upload", required = true)
            @RequestParam("file") MultipartFile file,
            
            @Parameter(description = "Image type (TERMINAL, EXTERIOR, GATE, etc.)")
            @RequestParam(required = false) String imageType,
            
            @Parameter(description = "Alt text for accessibility")
            @RequestParam(required = false) String altText,
            
            @Parameter(description = "Display order for image ordering")
            @RequestParam(required = false) Integer displayOrder,
            
            @Parameter(description = "Whether this is the primary image")
            @RequestParam(required = false, defaultValue = "false") Boolean isPrimary) {
        
        log.info("Uploading airport image: airportId={}, fileName={}, imageType={}", 
                 airportId, file.getOriginalFilename(), imageType);
        
        try {
            // Validate file
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File cannot be empty");
            }
            
            // Upload to media service
            String imageUrl = mediaServiceClient.uploadImage(file, "airports");
            
            // Save airport image record
            Map<String, Object> imageData = new HashMap<>();
            imageData.put("airportId", airportId);
            imageData.put("imageUrl", imageUrl);
            imageData.put("imageType", imageType);
            imageData.put("altText", altText);
            imageData.put("displayOrder", displayOrder);
            imageData.put("isPrimary", isPrimary);
            
            Map<String, Object> savedImage = airportImageService.createAirportImage(imageData);
            
            Map<String, Object> response = new HashMap<>();
            response.put("image", savedImage);
            response.put("message", "Airport image uploaded successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid airport image upload request: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid request");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error uploading airport image", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload airport image");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * Upload image for flight
     */
    @PostMapping(value = "/flights/{flightId}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN') or hasRole('PARTNER')")
    @Operation(summary = "Upload flight image", 
               description = "Upload an image for a specific flight")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Image uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or file"),
        @ApiResponse(responseCode = "404", description = "Flight not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> uploadFlightImage(
            @Parameter(description = "Flight ID", required = true)
            @PathVariable Long flightId,
            
            @Parameter(description = "Image file to upload", required = true)
            @RequestParam("file") MultipartFile file,
            
            @Parameter(description = "Image type (AIRCRAFT, CABIN, SEAT, etc.)")
            @RequestParam(required = false) String imageType,
            
            @Parameter(description = "Alt text for accessibility")
            @RequestParam(required = false) String altText,
            
            @Parameter(description = "Display order for image ordering")
            @RequestParam(required = false) Integer displayOrder,
            
            @Parameter(description = "Whether this is the primary image")
            @RequestParam(required = false, defaultValue = "false") Boolean isPrimary) {
        
        log.info("Uploading flight image: flightId={}, fileName={}, imageType={}", 
                 flightId, file.getOriginalFilename(), imageType);
        
        try {
            // Validate file
            if (file.isEmpty()) {
                throw new IllegalArgumentException("File cannot be empty");
            }
            
            // Upload to media service
            String imageUrl = mediaServiceClient.uploadImage(file, "flights");
            
            // Save flight image record
            Map<String, Object> imageData = new HashMap<>();
            imageData.put("flightId", flightId);
            imageData.put("imageUrl", imageUrl);
            imageData.put("imageType", imageType);
            imageData.put("altText", altText);
            imageData.put("displayOrder", displayOrder);
            imageData.put("isPrimary", isPrimary);
            
            Map<String, Object> savedImage = flightImageService.createFlightImage(imageData);
            
            Map<String, Object> response = new HashMap<>();
            response.put("image", savedImage);
            response.put("message", "Flight image uploaded successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (IllegalArgumentException e) {
            log.error("Invalid flight image upload request: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid request");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
            
        } catch (Exception e) {
            log.error("Error uploading flight image", e);
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to upload flight image");
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
               description = "Delete an image by ID (works for all entity types)")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Image deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Image not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<Map<String, Object>> deleteImage(
            @Parameter(description = "Image ID", required = true)
            @PathVariable Long imageId,
            
            @Parameter(description = "Entity type (airline, airport, flight)", required = true)
            @RequestParam String entityType) {
        
        log.info("Deleting image: imageId={}, entityType={}", imageId, entityType);
        
        try {
            Map<String, Object> response = new HashMap<>();
            
            switch (entityType.toLowerCase()) {
                case "airline":
                    airlineImageService.deleteAirlineImage(imageId);
                    break;
                case "airport":
                    airportImageService.deleteAirportImage(imageId);
                    break;
                case "flight":
                    flightImageService.deleteFlightImage(imageId);
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
}