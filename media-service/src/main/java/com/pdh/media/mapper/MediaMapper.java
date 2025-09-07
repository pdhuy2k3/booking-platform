package com.pdh.media.mapper;

import com.pdh.media.dto.MediaDto;
import com.pdh.media.model.Media;
import org.springframework.stereotype.Component;

import java.util.List;
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
                .entityType(media.getEntityType())
                .entityId(media.getEntityId())
                .mediaType(media.getMediaType())
                .resourceType(media.getResourceType())
                .format(media.getFormat())
                .originalFilename(media.getOriginalFilename())
                .folder(media.getFolder())
                .fileSize(media.getFileSize())
                .width(media.getWidth())
                .height(media.getHeight())
                .altText(media.getAltText())
                .displayOrder(media.getDisplayOrder())
                .isPrimary(media.getIsPrimary())
                .isActive(media.getIsActive())
                .metadata(media.getMetadata())
                .tags(media.getTags())
                .version(media.getVersion())
                .assetId(media.getAssetId())
                .createdAt(media.getCreatedAt())
                .updatedAt(media.getUpdatedAt())
                .createdBy(media.getCreatedBy())
                .updatedBy(media.getUpdatedBy())
                .build();
    }

    /**
     * Convert list of Media entities to list of MediaDtos
     */
    public List<MediaDto> toDtoList(List<Media> mediaList) {
        if (mediaList == null) {
            return List.of();
        }
        return mediaList.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    /**
     * Create a simplified MediaDto for list responses
     */
    public MediaDto toSimpleDto(Media media) {
        if (media == null) {
            return null;
        }

        return MediaDto.builder()
                .id(media.getId())
                .publicId(media.getPublicId())
                .url(media.getUrl())
                .secureUrl(media.getSecureUrl())
                .entityType(media.getEntityType())
                .entityId(media.getEntityId())
                .mediaType(media.getMediaType())
                .altText(media.getAltText())
                .displayOrder(media.getDisplayOrder())
                .isPrimary(media.getIsPrimary())
                .isActive(media.getIsActive())
                .build();
    }

    /**
     * Convert list of Media entities to list of simplified MediaDtos
     */
    public List<MediaDto> toSimpleDtoList(List<Media> mediaList) {
        if (mediaList == null) {
            return List.of();
        }
        return mediaList.stream()
                .map(this::toSimpleDto)
                .collect(Collectors.toList());
    }
}
