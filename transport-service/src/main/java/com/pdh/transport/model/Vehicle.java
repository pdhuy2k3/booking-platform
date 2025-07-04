package com.pdh.transport.model;

import com.pdh.transport.model.enums.VehicleType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_id")
    private Long vehicleId;
    
    @Column(name = "license_plate", unique = true, length = 20)
    private String licensePlate;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private VehicleType type;
    
    @Column(name = "layout_id", nullable = false)
    private Long layoutId;
    
    // Reference entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "layout_id", insertable = false, updatable = false)
    private SeatLayout seatLayout;
}
