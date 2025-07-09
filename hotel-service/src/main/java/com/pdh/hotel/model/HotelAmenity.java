package com.pdh.hotel.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Junction entity to avoid ManyToMany relationship between Hotel and Amenity
 * This creates a proper One-to-Many relationship structure
 */
@Entity
@Table(name = "hotel_amenities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@IdClass(HotelAmenityId.class)
public class HotelAmenity {
    
    @Id
    @Column(name = "hotel_id", nullable = false)
    private Long hotelId;
    
    @Id
    @Column(name = "amenity_id", nullable = false)
    private Long amenityId;
    
    // Reference entities
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", insertable = false, updatable = false)
    private Hotel hotel;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "amenity_id", insertable = false, updatable = false)
    private Amenity amenity;
}
