package com.pdh.hotel.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rooms")
@Data

@NoArgsConstructor
@AllArgsConstructor
public class Room extends AbstractAuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id")
    private RoomType roomType;
    
    @Column(name = "room_number", nullable = false)
    private String roomNumber;
    
    // Backward compatibility - will be removed after migration
    @Column(name = "room_type", nullable = false)
    private String roomTypeName;
    
    private String description;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(name = "max_occupancy")
    private Integer maxOccupancy;
    
    @Column(name = "bed_type")
    private String bedType;
    
    @Column(name = "room_size")
    private Integer roomSize;
    
    @Column(name = "is_available")
    private Boolean isAvailable = true;
    
    // One-to-Many relationships to avoid ManyToMany
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RoomAmenity> roomAmenities = new ArrayList<>();
    
    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RoomImage> roomImages = new ArrayList<>();
}
