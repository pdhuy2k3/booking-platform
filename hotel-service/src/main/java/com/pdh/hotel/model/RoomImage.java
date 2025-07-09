package com.pdh.hotel.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Entity to store room images as separate records instead of ElementCollection
 * This provides better flexibility and audit capabilities
 */
@Entity
@Table(name = "room_images")
@Data

@NoArgsConstructor
@AllArgsConstructor
public class RoomImage extends AbstractAuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;
    
    @Column(name = "image_url", nullable = false)
    private String imageUrl;
    
    @Column(name = "image_type")
    private String imageType; // e.g., "ROOM", "BATHROOM", "VIEW", "AMENITY"
    
    @Column(name = "alt_text")
    private String altText;
    
    @Column(name = "display_order")
    private Integer displayOrder;
    
    @Column(name = "is_primary")
    private Boolean isPrimary = false; // Mark the main image
    
    @Column(name = "is_active")
    private Boolean isActive = true;
}
