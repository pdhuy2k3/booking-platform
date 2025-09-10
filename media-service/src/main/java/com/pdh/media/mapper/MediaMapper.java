package com.pdh.media.mapper;

import com.pdh.media.dto.MediaDto;
import com.pdh.media.dto.MediaUploadDto;
import com.pdh.media.model.Media;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Mapper for converting between Media entity and DTOs
 */
@Component
public class MediaMapper {

    /**
     * Convert Media entity to MediaDto
     */
    public MediaDto toDto(Media media) {
        if (media == null) {
            return null;
        }

        return MediaDto.builder()
                .id(media.getId())
                .publicId(media.getPublicId())
                .url(media.getUrl())
                .secureUrl(media.getSecureUrl())
                .mediaType(media.getMediaType())
                .isActive(media.getIsActive())
                .createdAt(media.getCreatedAt())
                .updatedAt(media.getUpdatedAt())
                .createdBy(media.getCreatedBy())
                .updatedBy(media.getUpdatedBy())
                .build();
    }
    public MediaDto fromMapToDto(Map<String, Object> uploadResult) {
        if (uploadResult == null || uploadResult.isEmpty()) {
            return null;
        }

        return MediaDto.builder()
                .publicId((String) uploadResult.get("public_id"))
                .url((String) uploadResult.get("url"))
                .secureUrl((String) uploadResult.get("secure_url"))
                .mediaType("image") // Assuming image for simplicity
                .isActive(true)
                .build();
    }

    /**
     * Convert MediaDto to Media entity
     */
    public Media toEntity(MediaDto mediaDto) {
        if (mediaDto == null) {
            return null;
        }

        return Media.builder()
                .id(mediaDto.getId())
                .publicId(mediaDto.getPublicId())
                .url(mediaDto.getUrl())
                .secureUrl(mediaDto.getSecureUrl())
                .mediaType(mediaDto.getMediaType() != null ? mediaDto.getMediaType() : "image")
                .isActive(mediaDto.getIsActive() != null ? mediaDto.getIsActive() : true)
                .build();
    }

    /**
     * Create Media entity from Cloudinary upload result and MediaUploadDto
     */
    public Media toEntity(MediaUploadDto uploadDto, String publicId, String url, String secureUrl) {
        if (uploadDto == null) {
            return null;
        }

        return Media.builder()
                .publicId(publicId)
                .url(url)
                .secureUrl(secureUrl)
                .mediaType(uploadDto.getMediaType() != null ? uploadDto.getMediaType() : "image")
                .isActive(true)
                .build();
    }

    /**
     * Convert list of Media entities to list of MediaDto
     */
    public List<MediaDto> toDtoList(List<Media> mediaList) {
        if (mediaList == null || mediaList.isEmpty()) {
            return List.of();
        }

        return mediaList.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Convert list of MediaDto to list of Media entities
     */
    public List<Media> toEntityList(List<MediaDto> mediaDtoList) {
        if (mediaDtoList == null || mediaDtoList.isEmpty()) {
            return List.of();
        }

        return mediaDtoList.stream()
                .map(this::toEntity)
                .collect(Collectors.toList());
    }

    /**
     * Update existing Media entity with data from MediaDto
     */
    public void updateEntityFromDto(Media media, MediaDto mediaDto) {
        if (media == null || mediaDto == null) {
            return;
        }

        if (mediaDto.getUrl() != null) {
            media.setUrl(mediaDto.getUrl());
        }
        if (mediaDto.getSecureUrl() != null) {
            media.setSecureUrl(mediaDto.getSecureUrl());
        }
        if (mediaDto.getMediaType() != null) {
            media.setMediaType(mediaDto.getMediaType());
        }

        if (mediaDto.getIsActive() != null) {
            media.setIsActive(mediaDto.getIsActive());
        }
    }

}
