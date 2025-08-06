package com.pdh.hotel.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "room_availability", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"room_type_id", "date"}))
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class RoomAvailability extends AbstractAuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "availability_id")
    private Long availabilityId;
    
    @Column(name = "room_type_id", nullable = false)
    private Long roomTypeId;
    
    @Column(name = "date", nullable = false)
    private LocalDate date;
    
    @Column(name = "total_inventory", nullable = false)
    private Integer totalInventory;
    
    @Column(name = "total_reserved", nullable = false)
    private Integer totalReserved = 0;
    
    // Reference entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_type_id", insertable = false, updatable = false)
    private RoomType roomType;
}
