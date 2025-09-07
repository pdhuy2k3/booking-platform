package com.pdh.media.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Media entity for centralized media management
 * Stores metadata for all media files across the system (hotels, flights, etc.)
 */
@Entity
@Table(name = "media", indexes = {
        @Index(name = "idx_media_entity", columnList = "entityType,entityId"),
        @Index(name = "idx_media_public_id", columnList = "publicId", unique = true),
        @Index(name = "idx_media_type", columnList = "entityType,entityId,mediaType"),
        @Index(name = "idx_media_primary", columnList = "entityType,entityId,isPrimary"),
        @Index(name = "idx_media_active", columnList = "isActive"),
        @Index(name = "idx_media_display_order", columnList = "entityType,entityId,displayOrder")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Media extends AbstractAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Cloudinary public ID for the media file
     */
    @Column(name = "public_id", nullable = false, unique = true, length = 255)
    private String publicId;

    /**
     * Full URL to access the media file
     */
    @Column(name = "url", nullable = false, length = 500)
    private String url;

    /**
     * Secure HTTPS URL to access the media file
     */
    @Column(name = "secure_url", nullable = false, length = 500)
    private String secureUrl;

    /**
     * Type of entity this media belongs to (HOTEL, ROOM, FLIGHT, AIRLINE, etc.)
     */
    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    /**
     * ID of the entity this media belongs to
     */
    @Column(name = "entity_id", nullable = false)
    private Long entityId;

    /**
     * Type of media (PRIMARY, GALLERY, THUMBNAIL, etc.)
     */
    @Column(name = "media_type", length = 50, nullable = false)
    private String mediaType = "GALLERY";

    /**
     * Resource type from Cloudinary (image, video, raw, etc.)
     */
    @Column(name = "resource_type", length = 20)
    private String resourceType = "image";

    /**
     * File format/extension
     */
    @Column(name = "format", length = 10)
    private String format;

    /**
     * Original filename
     */
    @Column(name = "original_filename", length = 255)
    private String originalFilename;

    /**
     * Folder path in Cloudinary
     */
    @Column(name = "folder", length = 255)
    private String folder;

    /**
     * File size in bytes
     */
    @Column(name = "file_size")
    private Long fileSize;

    /**
     * Width in pixels (for images/videos)
     */
    @Column(name = "width")
    private Integer width;

    /**
     * Height in pixels (for images/videos)
     */
    @Column(name = "height")
    private Integer height;

    /**
     * Alternative text for accessibility
     */
    @Column(name = "alt_text", length = 255)
    private String altText;

    /**
     * Display order for sorting
     */
    @Column(name = "display_order")
    private Integer displayOrder = 1;

    /**
     * Whether this is the primary media for the entity
     */
    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    /**
     * Whether this media is active/visible
     */
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    /**
     * Additional metadata as JSON
     */
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    /**
     * Tags for categorization (comma-separated)
     */
    @Column(name = "tags", length = 500)
    private String tags;

    /**
     * Cloudinary version for cache busting
     */
    @Column(name = "version")
    private Long version;

    /**
     * Cloudinary asset ID
     */
    @Column(name = "asset_id", length = 255)
    private String assetId;
}
