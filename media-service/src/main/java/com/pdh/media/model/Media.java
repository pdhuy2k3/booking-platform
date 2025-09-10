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
@Table(name = "media")
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
     * Type of media (image, video,..)
     */
    @Column(name = "media_type", length = 20, nullable = false)
    private String mediaType = "image";



    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;


}
