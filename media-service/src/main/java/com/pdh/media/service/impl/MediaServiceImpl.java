package com.pdh.media.service.impl;

import com.pdh.media.dto.MediaDto;
import com.pdh.media.dto.MediaUploadDto;
import com.pdh.media.mapper.MediaMapper;
import com.pdh.media.model.Media;
import com.pdh.media.repository.MediaRepository;
import com.pdh.media.service.CloudinaryService;
import com.pdh.media.service.MediaService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

/**
 * Implementation of MediaService
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MediaServiceImpl implements MediaService {

    private final MediaRepository mediaRepository;
    private final MediaMapper mediaMapper;
    private final CloudinaryService cloudinaryService;

    @Override
    public MediaDto uploadMedia(MultipartFile file, String folder) {
        try {
            log.info("Uploading media file: {} to folder: {}", file.getOriginalFilename(), folder);
            
            // Upload to Cloudinary
            Map<String, Object> uploadResult = cloudinaryService.uploadImage(file, folder);
            
            // Extract Cloudinary response data
            String publicId = (String) uploadResult.get("public_id");
            String url = (String) uploadResult.get("url");
            String secureUrl = (String) uploadResult.get("secure_url");
            
            // Create and save Media entity
            Media media = Media.builder()
                    .publicId(publicId)
                    .url(url)
                    .secureUrl(secureUrl)
                    .mediaType("image")
                    .isActive(true)
                    .build();
            
            Media savedMedia = mediaRepository.save(media);
            log.info("Media saved with ID: {} and public ID: {}", savedMedia.getId(), savedMedia.getPublicId());
            
            return mediaMapper.toDto(savedMedia);
            
        } catch (Exception e) {
            log.error("Error uploading media file: {}", file.getOriginalFilename(), e);
            throw new RuntimeException("Failed to upload media: " + e.getMessage(), e);
        }
    }

    @Override
    public List<MediaDto> uploadMultipleMedia(List<MultipartFile> files, String folder) {
        log.info("Uploading {} media files to folder: {}", files.size(), folder);
        
        List<MediaDto> uploadedMedia = new ArrayList<>();
        
        for (MultipartFile file : files) {
            try {
                MediaDto mediaDto = uploadMedia(file, folder);
                uploadedMedia.add(mediaDto);
            } catch (Exception e) {
                log.error("Failed to upload file: {}", file.getOriginalFilename(), e);
                // Continue with other files instead of failing completely
            }
        }
        
        log.info("Successfully uploaded {} out of {} files", uploadedMedia.size(), files.size());
        return uploadedMedia;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MediaDto> getMediaById(Long id) {
        log.debug("Getting media by ID: {}", id);
        return mediaRepository.findById(id)
                .map(mediaMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MediaDto> getMediaByIds(List<Long> ids) {
        log.debug("Getting media by IDs: {}", ids);
        if (ids == null || ids.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<Media> mediaList = mediaRepository.findAllById(ids);
        return mediaMapper.toDtoList(mediaList);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MediaDto> getMediaByPublicId(String publicId) {
        log.debug("Getting media by public ID: {}", publicId);
        return mediaRepository.findByPublicId(publicId)
                .map(mediaMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MediaDto> getAllMedia(Pageable pageable) {
        log.debug("Getting all media with pagination: {}", pageable);
        return mediaRepository.findAll(pageable)
                .map(mediaMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MediaDto> getMediaByType(String mediaType) {
        log.debug("Getting media by type: {}", mediaType);
        List<Media> mediaList = mediaRepository.findByMediaType(mediaType);
        return mediaMapper.toDtoList(mediaList);
    }

    @Override
    public void deleteMedia(Long id) {
        log.info("Deleting media with ID: {}", id);
        
        Optional<Media> mediaOpt = mediaRepository.findById(id);
        if (mediaOpt.isEmpty()) {
            throw new EntityNotFoundException("Media not found with ID: " + id);
        }
        
        Media media = mediaOpt.get();
        
        try {
            // Delete from Cloudinary
            cloudinaryService.deleteImage(media.getPublicId());
            log.info("Deleted media from Cloudinary: {}", media.getPublicId());
        } catch (Exception e) {
            log.warn("Failed to delete media from Cloudinary: {}", media.getPublicId(), e);
            // Continue with database deletion even if Cloudinary fails
        }
        
        // Delete from database
        mediaRepository.deleteById(id);
        log.info("Deleted media from database with ID: {}", id);
    }

    @Override
    public void deleteMediaByPublicId(String publicId) {
        log.info("Deleting media with public ID: {}", publicId);
        
        Optional<Media> mediaOpt = mediaRepository.findByPublicId(publicId);
        if (mediaOpt.isEmpty()) {
            throw new EntityNotFoundException("Media not found with public ID: " + publicId);
        }
        
        Media media = mediaOpt.get();
        deleteMedia(media.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> convertPublicIdsToMediaIds(List<String> publicIds) {
        if (publicIds == null || publicIds.isEmpty()) {
            log.debug("No public IDs provided for conversion");
            return List.of();
        }
        
        log.debug("Converting {} public IDs to media IDs", publicIds.size());
        List<Long> mediaIds = mediaRepository.findIdsByPublicIdIn(publicIds);
        
        log.debug("Found {} media IDs for {} public IDs", mediaIds.size(), publicIds.size());
        if (mediaIds.size() != publicIds.size()) {
            log.warn("Some public IDs were not found in database. Expected: {}, Found: {}", 
                    publicIds.size(), mediaIds.size());
        }
        
        return mediaIds;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Long> getMediaIdsByPublicIds(List<String> publicIds) {
        return convertPublicIdsToMediaIds(publicIds);
    }

    @Override
    public MediaDto saveMediaMetadata(MediaUploadDto mediaUploadDto) {

        
        // This method is for saving metadata without file upload
        // It would be used when media is already uploaded to Cloudinary
        throw new UnsupportedOperationException("This method requires Cloudinary upload result data");
    }

    @Override
    public MediaDto updateMedia(Long id, MediaDto mediaDto) {
        log.info("Updating media with ID: {}", id);
        
        Media existingMedia = mediaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Media not found with ID: " + id));
        
        // Update fields from DTO
        mediaMapper.updateEntityFromDto(existingMedia, mediaDto);
        
        Media updatedMedia = mediaRepository.save(existingMedia);
        log.info("Updated media with ID: {}", id);
        
        return mediaMapper.toDto(updatedMedia);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByPublicId(String publicId) {
        log.debug("Checking if media exists with public ID: {}", publicId);
        return mediaRepository.existsByPublicId(publicId);
    }

    /**
     * Helper method to save media with Cloudinary upload result
     */
    public MediaDto saveMediaWithUploadResult(Map<String, Object> uploadResult, MediaUploadDto uploadDto) {
        String publicId = (String) uploadResult.get("public_id");
        String url = (String) uploadResult.get("url");
        String secureUrl = (String) uploadResult.get("secure_url");
        
        Media media = mediaMapper.toEntity(uploadDto, publicId, url, secureUrl);
        Media savedMedia = mediaRepository.save(media);
        
        log.info("Saved media with upload result. Media ID: {}, Public ID: {}", 
                savedMedia.getId(), savedMedia.getPublicId());
        
        return mediaMapper.toDto(savedMedia);
    }
}
