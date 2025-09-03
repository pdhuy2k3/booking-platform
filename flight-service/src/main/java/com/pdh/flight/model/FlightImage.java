package com.pdh.flight.model;

import com.pdh.common.model.AbstractAuditEntity;
import com.pdh.flight.model.enums.FlightImageType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Entity to store flight-specific images as separate records
 * This provides better flexibility and audit capabilities
 */
@Entity
@Table(name = "flight_images")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class FlightImage {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_id", nullable = false)
    private Flight flight;
    
    @Column(name = "image_url", nullable = false)
    private String imageUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "image_type")
    private FlightImageType imageType;
    
    @Column(name = "alt_text")
    private String altText;
    
    @Column(name = "display_order")
    private Integer displayOrder;
    
    @Column(name = "is_primary")
    private Boolean isPrimary = false; // Mark the main image
    
    @Column(name = "is_active")
    private Boolean isActive = true;
}