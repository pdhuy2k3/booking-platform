package com.pdh.flight.model;

import com.pdh.flight.model.enums.FareClass;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "flight_inventory", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"flight_leg_id", "fare_class"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightInventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long inventoryId;

    @Column(name = "flight_leg_id", nullable = false)
    private Long flightLegId;

    @Enumerated(EnumType.STRING)
    @Column(name = "fare_class", nullable = false)
    private FareClass fareClass;

    @Column(name = "total_seats", nullable = false)
    private Short totalSeats;

    @Column(name = "reserved_seats", nullable = false)
    private Short reservedSeats = 0;
    
    // Reference entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_leg_id", insertable = false, updatable = false)
    private FlightLeg flightLeg;
}
