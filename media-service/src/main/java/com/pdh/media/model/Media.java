package com.pdh.media.model;

import com.pdh.common.model.AbstractAuditEntity;
import com.pdh.media.enums.MediaType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "media")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class Media extends AbstractAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "media_id")
    private UUID mediaId;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "entity_type", nullable = false, length = 50)
    private String entityType;

    @Enumerated(EnumType.STRING)
    @Column(name = "media_type", nullable = false, length = 20)
    private MediaType mediaType; // IMAGE, VIDEO, AUDIO, DOCUMENT

    @Column(name = "media_url", nullable = false, length = 2048)
    private String mediaUrl;

    @Column(name = "alt_text", length = 255)
    private String altText;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @Column(name = "file_size")
    private Long fileSize; // in bytes

    @Column(name = "mime_type", length = 100)
    private String mimeType; // image/jpeg, video/mp4, etc.

    @Column(name = "duration")
    private Integer duration; // for videos/audio, in seconds
}
