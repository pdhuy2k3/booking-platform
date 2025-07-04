package com.pdh.hotel.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "hotel_photos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HotelPhoto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "photo_id")
    private Long photoId;
    
    @Column(name = "hotel_id", nullable = false)
    private Long hotelId;
    
    @Column(name = "url", nullable = false, length = 255)
    private String url;
    
    @Column(name = "description", length = 255)
    private String description;
    
    @Column(name = "is_primary")
    private Boolean isPrimary = false;
    
    // Reference entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", insertable = false, updatable = false)
    private Hotel hotel;
}
