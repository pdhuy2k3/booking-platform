package com.pdh.media.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.Transformation;
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
        try{
                                // Input validation
            if (file == null || file.isEmpty()) {
                throw new IllegalArgumentException("File cannot be null or empty");
            }
            
            log.info("Uploading image: {} to folder: {}", file.getOriginalFilename(), folder);

            // Build Cloudinary upload parameters
            Map<String, Object> params = ObjectUtils.asMap(
                    "resource_type", "image",
                    "folder", folder != null ? folder : "uploads",
                    "use_filename", true,
                    "unique_filename", true,
                    "overwrite", false
            );

            // Add transformation for optimization - eager must be a List of Transformation objects
            params.put("eager", java.util.List.of(
                    new Transformation()
                            .width(800)
                            .height(600)
                            .crop("limit")
                            .quality("auto")
            ));

            // Upload to Cloudinary
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
            
            log.info("Image uploaded successfully with public_id: {}", uploadResult.get("public_id"));

            // Return simplified response with only essential data
            return Map.of(
                    "public_id", uploadResult.getOrDefault("public_id", ""),
                    "url", uploadResult.getOrDefault("url", ""),
                    "secure_url", uploadResult.getOrDefault("secure_url", ""),
                    "format", uploadResult.getOrDefault("format", ""),
                    "width", uploadResult.getOrDefault("width", 0),
                    "height", uploadResult.getOrDefault("height", 0),
                    "bytes", uploadResult.getOrDefault("bytes", 0),
                    "resource_type", uploadResult.getOrDefault("resource_type", "image")
            );
        } catch (Exception e) {
            log.error("Error uploading image", e);
            throw new IOException("Failed to upload image: " + e.getMessage(), e);
        }
    }

    /**
     * Upload image to Cloudinary from a public URL
     */
    public Map<String, Object> uploadImageFromUrl(String url, String folder) throws IOException {
        try {
            log.info("Uploading image from URL: {} to folder: {}", url, folder);
            
            // Input validation
            if (url == null || url.isEmpty()) {
                throw new IllegalArgumentException("URL cannot be null or empty");
            }
            
            // Validate URL format
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                throw new IllegalArgumentException("URL must be a valid HTTP or HTTPS URL");
            }

            // Build Cloudinary upload parameters
            Map<String, Object> params = ObjectUtils.asMap(
                    "resource_type", "image",
                    "folder", folder != null ? folder : "uploads",
                    "use_filename", true,
                    "unique_filename", true,
                    "overwrite", false
            );

            // Add transformation for optimization
            params.put("eager", java.util.List.of(
                    new Transformation()
                            .width(800)
                            .height(600)
                            .crop("limit")
                            .quality("auto")
            ));

            // Upload from URL to Cloudinary
            Map<String, Object> uploadResult = cloudinary.uploader().upload(url, params);
            
            log.info("Image uploaded successfully from URL with public_id: {}", uploadResult.get("public_id"));

            // Return simplified response with only essential data
            return Map.of(
                    "public_id", uploadResult.getOrDefault("public_id", ""),
                    "url", uploadResult.getOrDefault("url", ""),
                    "secure_url", uploadResult.getOrDefault("secure_url", ""),
                    "format", uploadResult.getOrDefault("format", ""),
                    "width", uploadResult.getOrDefault("width", 0),
                    "height", uploadResult.getOrDefault("height", 0),
                    "bytes", uploadResult.getOrDefault("bytes", 0),
                    "resource_type", uploadResult.getOrDefault("resource_type", "image")
            );
        } catch (Exception e) {
            log.error("Error uploading image from URL", e);
            throw new IOException("Failed to upload image from URL: " + e.getMessage(), e);
        }
    }

    /**
     * Delete image from Cloudinary by public_id
     */
    public void deleteImage(String publicId) throws IOException {
        log.info("Deleting image with public_id: {}", publicId);
        
        Map<String, Object> result = cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "image"));
        log.info("Image deletion result: {}", result);
    }

    /**
     * Browse/search media in Cloudinary with folder filtering
     */
    public Map<String, Object> browseMedia(String folder, String search, String resourceType, int page, int limit, String nextCursor) throws IOException {
        log.info("Browsing media - folder: {}, search: {}, resourceType: {}, page: {}, limit: {}, nextCursor: {}", 
                folder, search, resourceType, page, limit, nextCursor != null ? "present" : "null");

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

        // Use the provided cursor for pagination if available
        if (nextCursor != null && !nextCursor.trim().isEmpty()) {
            params.put("next_cursor", nextCursor);
        }

        try {
            Map<String, Object> searchResult;
            if (search != null && !search.trim().isEmpty()) {
                // Use search API for complex queries - handle cursor properly
                com.cloudinary.Search searchApi = cloudinary.search().expression((String) params.get("expression"));
                searchApi.maxResults((Integer) params.get("max_results"));
                if (params.containsKey("next_cursor")) {
                    searchApi.nextCursor((String) params.get("next_cursor"));
                }
                searchResult = searchApi.execute();
            } else {
                // Use admin API for simple folder browsing
                searchResult = cloudinary.api().resources(params);
            }
            
            log.info("Browse result: {} resources found", searchResult.toString());

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
            Map<String, Object> result = cloudinary.api().rootFolders(ObjectUtils.asMap("max_results", 100));
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
     * Overloaded method for backward compatibility that doesn't use cursor
     */
    public Map<String, Object> browseMedia(String folder, String search, String resourceType, int page, int limit) throws IOException {
        return browseMedia(folder, search, resourceType, page, limit, null);
    }
}