package com.pdh.hotel.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "room_availability")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoomAvailability {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "availability_id")
    private Long availabilityId;
    
    @Column(name = "room_type_id", nullable = false)
    private Long roomTypeId;
    
    @Column(name = "date", nullable = false)
    private LocalDate date;
    
    @Column(name = "total_inventory", nullable = false)
    private Short totalInventory;
    
    @Column(name = "total_reserved", nullable = false)
    private Short totalReserved = 0;
    
    @Column(name = "price_override", precision = 12, scale = 2)
    private BigDecimal priceOverride;
    
    // Reference entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id", insertable = false, updatable = false)
    private RoomType roomType;
}
