package com.pdh.media.service;

import com.pdh.media.dto.MediaDto;
import com.pdh.media.dto.MediaUploadDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

/**
 * Service interface for Media management
 */
public interface MediaService {

    /**
     * Upload a single media file
     */
    MediaDto uploadMedia(MultipartFile file, String folder);

    /**
     * Upload multiple media files
     */
    List<MediaDto> uploadMultipleMedia(List<MultipartFile> files, String folder);

    /**
     * Get media by ID
     */
    Optional<MediaDto> getMediaById(Long id);

    /**
     * Get multiple media by IDs
     */
    List<MediaDto> getMediaByIds(List<Long> ids);

    /**
     * Get media by public ID
     */
    Optional<MediaDto> getMediaByPublicId(String publicId);

    /**
     * Get all media with pagination
     */
    Page<MediaDto> getAllMedia(Pageable pageable);

    /**
     * Get media by type
     */
    List<MediaDto> getMediaByType(String mediaType);

    /**
     * Delete media by ID
     */
    void deleteMedia(Long id);

    /**
     * Delete media by public ID
     */
    void deleteMediaByPublicId(String publicId);

    /**
     * Convert public IDs to media IDs
     * This is the key method needed for the image handling system
     */
    List<Long> convertPublicIdsToMediaIds(List<String> publicIds);

    /**
     * Get media IDs by public IDs
     */
    List<Long> getMediaIdsByPublicIds(List<String> publicIds);

    /**
     * Save media metadata after Cloudinary upload
     */
    MediaDto saveMediaMetadata(MediaUploadDto mediaUploadDto);

    /**
     * Update media metadata
     */
    MediaDto updateMedia(Long id, MediaDto mediaDto);

    /**
     * Check if media exists by public ID
     */
    boolean existsByPublicId(String publicId);
}
