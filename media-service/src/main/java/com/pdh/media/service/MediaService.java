package com.pdh.media.service;

import com.pdh.media.dto.MediaDto;
import com.pdh.media.dto.MediaUploadDto;
import com.pdh.media.model.Media;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * Service interface for Media management
 */
public interface MediaService {

    /**
     * Upload media file with entity association
     */
    MediaDto uploadMedia(MultipartFile file, MediaUploadDto uploadDto);

    /**
     * Upload multiple media files for an entity
     */
    List<MediaDto> uploadMultipleMedia(List<MultipartFile> files, MediaUploadDto uploadDto);

    /**
     * Get media by ID
     */
    MediaDto getMediaById(Long id);

    /**
     * Get media by public ID
     */
    MediaDto getMediaByPublicId(String publicId);

    /**
     * Get all media for an entity
     */
    List<MediaDto> getMediaByEntity(String entityType, Long entityId);

    /**
     * Get primary media for an entity
     */
    MediaDto getPrimaryMedia(String entityType, Long entityId);

    /**
     * Get media by entity and media type
     */
    List<MediaDto> getMediaByEntityAndType(String entityType, Long entityId, String mediaType);

    /**
     * Get media for multiple entities
     */
    Map<Long, List<MediaDto>> getMediaForEntities(String entityType, List<Long> entityIds);

    /**
     * Get primary media for multiple entities
     */
    Map<Long, MediaDto> getPrimaryMediaForEntities(String entityType, List<Long> entityIds);

    /**
     * Update media metadata
     */
    MediaDto updateMedia(Long id, MediaUploadDto updateDto);

    /**
     * Set media as primary for an entity
     */
    MediaDto setPrimaryMedia(Long mediaId);

    /**
     * Update media display order
     */
    void updateDisplayOrder(Long mediaId, Integer displayOrder);

    /**
     * Delete media (soft delete)
     */
    void deleteMedia(Long id);

    /**
     * Delete media by public ID
     */
    void deleteMediaByPublicId(String publicId);

    /**
     * Delete all media for an entity
     */
    void deleteMediaByEntity(String entityType, Long entityId);

    /**
     * Search media by tags
     */
    Page<MediaDto> searchByTag(String tag, Pageable pageable);

    /**
     * Get media by entity type with pagination
     */
    Page<MediaDto> getMediaByEntityType(String entityType, Pageable pageable);

    /**
     * Check if entity has media
     */
    boolean hasMedia(String entityType, Long entityId);

    /**
     * Count media for entity
     */
    long countMedia(String entityType, Long entityId);

    /**
     * Reorder media for an entity
     */
    void reorderMedia(String entityType, Long entityId, List<Long> mediaIds);

    /**
     * Associate existing media with an entity by public IDs
     */
    List<MediaDto> associateMediaWithEntity(String entityType, Long entityId, List<String> publicIds);
}
