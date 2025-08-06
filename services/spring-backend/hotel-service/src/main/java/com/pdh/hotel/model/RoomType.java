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
@Table(name = "room_types")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class RoomType extends AbstractAuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "room_type_id")
    private Long roomTypeId;
    

    
    @Column(name = "name", nullable = false, length = 255)
    private String name;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "capacity_adults")
    private Integer capacityAdults;
    
    @Column(name = "base_price", precision = 10, scale = 2)
    private BigDecimal basePrice;
    
    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hotel_id", insertable = false, updatable = false)
    private Hotel hotel;
    
    @OneToMany(mappedBy = "roomType", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Room> rooms = new ArrayList<>();
    
    @OneToMany(mappedBy = "roomType", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RoomAvailability> roomAvailabilities = new ArrayList<>();
}
