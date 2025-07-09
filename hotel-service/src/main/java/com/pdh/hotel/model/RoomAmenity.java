package com.pdh.hotel.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Junction entity to avoid ManyToMany relationship between Room and Amenity
 * This creates a proper One-to-Many relationship structure
 */
@Entity
@Table(name = "room_amenities")
@Data

@NoArgsConstructor
@AllArgsConstructor
public class RoomAmenity extends AbstractAuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "amenity_id", nullable = false)
    private Amenity amenity;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
    
    @Column(name = "display_order")
    private Integer displayOrder;
}
