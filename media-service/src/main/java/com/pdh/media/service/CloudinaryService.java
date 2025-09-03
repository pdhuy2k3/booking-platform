package com.pdh.media.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

/**
 * Simple Cloudinary service for uploading and deleting images
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Upload image to Cloudinary and return URL and metadata
     */
    public Map<String, Object> uploadImage(MultipartFile file, String folder) throws IOException {
        log.info("Uploading image: {} to folder: {}", file.getOriginalFilename(), folder);

        // Build Cloudinary upload parameters
        Map<String, Object> params = ObjectUtils.asMap(
                "resource_type", "image",
                "folder", folder != null ? folder : "uploads",
                "use_filename", true,
                "unique_filename", true,
                "overwrite", false
        );

        // Add transformation for optimization
        params.put("eager", ObjectUtils.asMap(
                "width", 800, 
                "height", 600, 
                "crop", "limit", 
                "quality", "auto"
        ));

        // Upload to Cloudinary
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
        
        log.info("Image uploaded successfully with public_id: {}", uploadResult.get("public_id"));

        // Return simplified response with only essential data
        return Map.of(
                "public_id", uploadResult.get("public_id"),
                "url", uploadResult.get("url"),
                "secure_url", uploadResult.get("secure_url"),
                "format", uploadResult.get("format"),
                "width", uploadResult.get("width"),
                "height", uploadResult.get("height"),
                "bytes", uploadResult.get("bytes"),
                "resource_type", uploadResult.get("resource_type")
        );
    }

    /**
     * Delete image from Cloudinary by public_id
     */
    public void deleteImage(String publicId) throws IOException {
        log.info("Deleting image with public_id: {}", publicId);
        
        Map result = cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "image"));
        log.info("Image deletion result: {}", result);
    }

    /**
     * Browse/search media in Cloudinary with folder filtering
     */
    public Map<String, Object> browseMedia(String folder, String search, String resourceType, int page, int limit) throws IOException {
        log.info("Browsing media - folder: {}, search: {}, resourceType: {}, page: {}, limit: {}", 
                folder, search, resourceType, page, limit);

        // Build search parameters
        Map<String, Object> params = ObjectUtils.asMap(
                "resource_type", resourceType != null ? resourceType : "image",
                "type", "upload",
                "max_results", Math.min(limit, 100), // Cloudinary max is 500, but limit for performance
                "direction", "desc"
        );

        // Add folder filter if specified
        if (folder != null && !folder.trim().isEmpty()) {
            params.put("prefix", folder + "/");
        }

        // Add search expression if specified
        if (search != null && !search.trim().isEmpty()) {
            // Use Cloudinary's search syntax for filename matching
            String expression = "resource_type:" + (resourceType != null ? resourceType : "image");
            if (folder != null && !folder.trim().isEmpty()) {
                expression += " AND folder:" + folder;
            }
            expression += " AND filename:*" + search + "*";
            params.put("expression", expression);
        }

        // Calculate offset for pagination
        if (page > 1) {
            params.put("next_cursor", calculateCursor(page, limit));
        }

        try {
            Map searchResult;
            if (search != null && !search.trim().isEmpty()) {
                // Use search API for complex queries
                searchResult = cloudinary.search().expression((String) params.get("expression"))
                        .maxResults((Integer) params.get("max_results"))
                        .execute();
            } else {
                // Use admin API for simple folder browsing
                searchResult = cloudinary.api().resources(params);
            }
            
            log.info("Browse result: {} resources found", 
                    searchResult.get("resources") != null ? 
                    ((java.util.List<?>) searchResult.get("resources")).size() : 0);

            return searchResult;
        } catch (Exception e) {
            log.error("Error browsing media", e);
            throw new IOException("Failed to browse media: " + e.getMessage(), e);
        }
    }

    /**
     * Get folders list from Cloudinary
     */
    public Map<String, Object> getFolders() throws IOException {
        log.info("Getting folders list");
        
        try {
            Map result = cloudinary.api().rootFolders(ObjectUtils.asMap("max_results", 100));
            log.info("Found {} root folders", 
                    result.get("folders") != null ? 
                    ((java.util.List<?>) result.get("folders")).size() : 0);
            return result;
        } catch (Exception e) {
            log.error("Error getting folders", e);
            throw new IOException("Failed to get folders: " + e.getMessage(), e);
        }
    }

    /**
     * Calculate cursor for pagination (simplified implementation)
     */
    private String calculateCursor(int page, int limit) {
        // This is a simplified cursor calculation
        // In a real implementation, you'd store and retrieve actual cursors
        return String.valueOf((page - 1) * limit);
    }
}