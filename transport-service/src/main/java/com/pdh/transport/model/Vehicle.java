package com.pdh.transport.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicles")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle extends AbstractAuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_id")
    private Long vehicleId;
    
    @Column(name = "license_plate", length = 50)
    private String licensePlate;
    
    @Column(name = "capacity")
    private Integer capacity;
    
    // Reference entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "layout_id", insertable = false, updatable = false)
    private SeatLayout seatLayout;
}
