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
import java.util.stream.Collectors;

/**
 * Implementation of MediaService
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MediaServiceImpl implements MediaService {

    private final MediaRepository mediaRepository;
    private final CloudinaryService cloudinaryService;
    private final MediaMapper mediaMapper;

    @Override
    public MediaDto uploadMedia(MultipartFile file, MediaUploadDto uploadDto) {
        try {
            // Build folder path
            String folder = buildFolderPath(uploadDto);
            
            // Upload to Cloudinary
            Map<String, Object> uploadResult = cloudinaryService.uploadImage(file, folder);
            
            // Create Media entity
            Media media = buildMediaEntity(uploadResult, uploadDto, file);
            
            // Handle primary media logic
            if (Boolean.TRUE.equals(uploadDto.getIsPrimary())) {
                mediaRepository.clearPrimaryExcept(
                    uploadDto.getEntityType(), 
                    uploadDto.getEntityId(), 
                    -1L // No media to exclude yet
                );
            }
            
            // Save to database
            media = mediaRepository.save(media);
            
            log.info("Media uploaded successfully - Entity: {}/{}, PublicId: {}", 
                    uploadDto.getEntityType(), uploadDto.getEntityId(), media.getPublicId());
            
            return mediaMapper.toDto(media);
            
        } catch (Exception e) {
            log.error("Error uploading media for entity {}/{}: {}", 
                    uploadDto.getEntityType(), uploadDto.getEntityId(), e.getMessage());
            throw new RuntimeException("Failed to upload media", e);
        }
    }

    @Override
    public List<MediaDto> uploadMultipleMedia(List<MultipartFile> files, MediaUploadDto uploadDto) {
        List<MediaDto> uploadedMedia = new ArrayList<>();
        
        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            MediaUploadDto currentUploadDto = MediaUploadDto.builder()
                    .entityType(uploadDto.getEntityType())
                    .entityId(uploadDto.getEntityId())
                    .mediaType(uploadDto.getMediaType())
                    .altText(uploadDto.getAltText())
                    .displayOrder(uploadDto.getDisplayOrder() != null ? uploadDto.getDisplayOrder() + i : i + 1)
                    .isPrimary(i == 0 && uploadDto.getIsPrimary()) // Only first file can be primary
                    .tags(uploadDto.getTags())
                    .folder(uploadDto.getFolder())
                    .metadata(uploadDto.getMetadata())
                    .build();
            
            uploadedMedia.add(uploadMedia(file, currentUploadDto));
        }
        
        return uploadedMedia;
    }

    @Override
    @Transactional(readOnly = true)
    public MediaDto getMediaById(Long id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Media not found with id: " + id));
        return mediaMapper.toDto(media);
    }

    @Override
    @Transactional(readOnly = true)
    public MediaDto getMediaByPublicId(String publicId) {
        Media media = mediaRepository.findByPublicId(publicId)
                .orElseThrow(() -> new EntityNotFoundException("Media not found with publicId: " + publicId));
        return mediaMapper.toDto(media);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MediaDto> getMediaByEntity(String entityType, Long entityId) {
        List<Media> mediaList = mediaRepository.findActiveMediaByEntity(entityType, entityId);
        return mediaMapper.toSimpleDtoList(mediaList);
    }

    @Override
    @Transactional(readOnly = true)
    public MediaDto getPrimaryMedia(String entityType, Long entityId) {
        Optional<Media> media = mediaRepository.findPrimaryMedia(entityType, entityId);
        return media.map(mediaMapper::toDto).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MediaDto> getMediaByEntityAndType(String entityType, Long entityId, String mediaType) {
        List<Media> mediaList = mediaRepository.findByEntityTypeAndEntityIdAndMediaTypeAndIsActiveOrderByDisplayOrder(
                entityType, entityId, mediaType, true);
        return mediaMapper.toSimpleDtoList(mediaList);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, List<MediaDto>> getMediaForEntities(String entityType, List<Long> entityIds) {
        List<Media> mediaList = mediaRepository.findByEntityTypeAndEntityIds(entityType, entityIds);
        
        return mediaList.stream()
                .collect(Collectors.groupingBy(
                        Media::getEntityId,
                        Collectors.mapping(mediaMapper::toSimpleDto, Collectors.toList())
                ));
    }

    @Override
    @Transactional(readOnly = true)
    public Map<Long, MediaDto> getPrimaryMediaForEntities(String entityType, List<Long> entityIds) {
        List<Media> mediaList = mediaRepository.findPrimaryMediaForEntities(entityType, entityIds);
        
        return mediaList.stream()
                .collect(Collectors.toMap(
                        Media::getEntityId,
                        mediaMapper::toSimpleDto,
                        (existing, replacement) -> existing // Keep first if duplicates
                ));
    }

    @Override
    public MediaDto updateMedia(Long id, MediaUploadDto updateDto) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Media not found with id: " + id));
        
        // Update fields
        if (updateDto.getAltText() != null) {
            media.setAltText(updateDto.getAltText());
        }
        if (updateDto.getDisplayOrder() != null) {
            media.setDisplayOrder(updateDto.getDisplayOrder());
        }
        if (updateDto.getTags() != null) {
            media.setTags(updateDto.getTags());
        }
        if (updateDto.getMetadata() != null) {
            media.setMetadata(updateDto.getMetadata());
        }
        if (updateDto.getMediaType() != null) {
            media.setMediaType(updateDto.getMediaType());
        }
        
        media = mediaRepository.save(media);
        return mediaMapper.toDto(media);
    }

    @Override
    public MediaDto setPrimaryMedia(Long mediaId) {
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new EntityNotFoundException("Media not found with id: " + mediaId));
        
        // Clear other primary media for this entity
        mediaRepository.clearPrimaryExcept(media.getEntityType(), media.getEntityId(), mediaId);
        
        // Set this media as primary
        media.setIsPrimary(true);
        media = mediaRepository.save(media);
        
        log.info("Media {} set as primary for entity {}/{}", 
                mediaId, media.getEntityType(), media.getEntityId());
        
        return mediaMapper.toDto(media);
    }

    @Override
    public void updateDisplayOrder(Long mediaId, Integer displayOrder) {
        mediaRepository.updateDisplayOrder(mediaId, displayOrder);
    }

    @Override
    public void deleteMedia(Long id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Media not found with id: " + id));
        
        // Delete from Cloudinary
        try {
            cloudinaryService.deleteImage(media.getPublicId());
        } catch (Exception e) {
            log.error("Error deleting media from Cloudinary: {}", e.getMessage());
        }
        
        // Soft delete from database
        media.setIsActive(false);
        mediaRepository.save(media);
        
        log.info("Media {} deleted for entity {}/{}", 
                id, media.getEntityType(), media.getEntityId());
    }

    @Override
    public void deleteMediaByPublicId(String publicId) {
        Media media = mediaRepository.findByPublicId(publicId)
                .orElseThrow(() -> new EntityNotFoundException("Media not found with publicId: " + publicId));
        
        deleteMedia(media.getId());
    }

    @Override
    public void deleteMediaByEntity(String entityType, Long entityId) {
        List<Media> mediaList = mediaRepository.findActiveMediaByEntity(entityType, entityId);
        
        // Delete from Cloudinary
        for (Media media : mediaList) {
            try {
                cloudinaryService.deleteImage(media.getPublicId());
            } catch (Exception e) {
                log.error("Error deleting media {} from Cloudinary: {}", media.getPublicId(), e.getMessage());
            }
        }
        
        // Soft delete all media for entity
        mediaRepository.softDeleteByEntity(entityType, entityId);
        
        log.info("All media deleted for entity {}/{}", entityType, entityId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MediaDto> searchByTag(String tag, Pageable pageable) {
        Page<Media> mediaPage = mediaRepository.findByTag(tag, pageable);
        return mediaPage.map(mediaMapper::toSimpleDto);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MediaDto> getMediaByEntityType(String entityType, Pageable pageable) {
        Page<Media> mediaPage = mediaRepository.findByEntityTypeAndIsActive(entityType, true, pageable);
        return mediaPage.map(mediaMapper::toSimpleDto);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasMedia(String entityType, Long entityId) {
        return mediaRepository.existsByEntityTypeAndEntityId(entityType, entityId);
    }

    @Override
    @Transactional(readOnly = true)
    public long countMedia(String entityType, Long entityId) {
        return mediaRepository.countByEntityTypeAndEntityIdAndIsActive(entityType, entityId, true);
    }

    @Override
    public void reorderMedia(String entityType, Long entityId, List<Long> mediaIds) {
        for (int i = 0; i < mediaIds.size(); i++) {
            mediaRepository.updateDisplayOrder(mediaIds.get(i), i + 1);
        }
        log.info("Media reordered for entity {}/{}", entityType, entityId);
    }

    /**
     * Build folder path for Cloudinary
     */
    private String buildFolderPath(MediaUploadDto uploadDto) {
        if (uploadDto.getFolder() != null && !uploadDto.getFolder().isEmpty()) {
            return uploadDto.getFolder();
        }
        
        // Default folder structure: entityType/entityId
        return String.format("%s/%d", 
                uploadDto.getEntityType().toLowerCase(), 
                uploadDto.getEntityId());
    }

    /**
     * Build Media entity from Cloudinary upload result
     */
    @SuppressWarnings("unchecked")
    private Media buildMediaEntity(Map<String, Object> uploadResult, MediaUploadDto uploadDto, MultipartFile file) {
        Media media = new Media();
        
        // Set Cloudinary data
        media.setPublicId((String) uploadResult.get("public_id"));
        media.setUrl((String) uploadResult.get("url"));
        media.setSecureUrl((String) uploadResult.get("secure_url"));
        media.setResourceType((String) uploadResult.getOrDefault("resource_type", "image"));
        media.setFormat((String) uploadResult.get("format"));
        media.setVersion(((Number) uploadResult.getOrDefault("version", 1L)).longValue());
        media.setAssetId((String) uploadResult.get("asset_id"));
        
        // Set file metadata
        if (uploadResult.containsKey("bytes")) {
            media.setFileSize(((Number) uploadResult.get("bytes")).longValue());
        }
        if (uploadResult.containsKey("width")) {
            media.setWidth(((Number) uploadResult.get("width")).intValue());
        }
        if (uploadResult.containsKey("height")) {
            media.setHeight(((Number) uploadResult.get("height")).intValue());
        }
        
        // Set entity association
        media.setEntityType(uploadDto.getEntityType());
        media.setEntityId(uploadDto.getEntityId());
        media.setMediaType(uploadDto.getMediaType() != null ? uploadDto.getMediaType() : "GALLERY");
        
        // Set additional metadata
        media.setOriginalFilename(file.getOriginalFilename());
        media.setFolder(buildFolderPath(uploadDto));
        media.setAltText(uploadDto.getAltText());
        media.setDisplayOrder(uploadDto.getDisplayOrder() != null ? uploadDto.getDisplayOrder() : 1);
        media.setIsPrimary(Boolean.TRUE.equals(uploadDto.getIsPrimary()));
        media.setIsActive(true);
        media.setTags(uploadDto.getTags());
        media.setMetadata(uploadDto.getMetadata());
        
        return media;
    }

    @Override
    public List<MediaDto> associateMediaWithEntity(String entityType, Long entityId, List<String> publicIds) {
        log.info("Associating {} media files with entity {}/{}", publicIds.size(), entityType, entityId);
        
        List<MediaDto> associatedMedia = new ArrayList<>();
        
        for (String publicId : publicIds) {
            try {
                // Find existing media by publicId
                Media media = mediaRepository.findByPublicId(publicId)
                    .orElseThrow(() -> new EntityNotFoundException("Media not found with publicId: " + publicId));
                
                // Check if media is active
                if (!Boolean.TRUE.equals(media.getIsActive())) {
                    log.warn("Media {} is not active, skipping association", publicId);
                    continue;
                }
                
                // Update entity association
                media.setEntityType(entityType);
                media.setEntityId(entityId);
                
                // Save the updated media
                Media savedMedia = mediaRepository.save(media);
                associatedMedia.add(mediaMapper.toDto(savedMedia));
                
                log.debug("Associated media {} with entity {}/{}", publicId, entityType, entityId);
                
            } catch (Exception e) {
                log.error("Failed to associate media {} with entity {}/{}: {}", 
                         publicId, entityType, entityId, e.getMessage());
                // Continue with other media instead of failing entirely
            }
        }
        
        return associatedMedia;
    }
}
