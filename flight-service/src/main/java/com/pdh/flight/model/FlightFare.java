package com.pdh.flight.model;

import com.pdh.flight.model.enums.FareClass;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "flight_fares", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"flight_id", "fare_class"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FlightFare {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long fareId;

    @Column(name = "flight_id", nullable = false)
    private Long flightId;

    @Enumerated(EnumType.STRING)
    @Column(name = "fare_class", nullable = false)
    private FareClass fareClass;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "conditions", columnDefinition = "TEXT")
    private String conditions;
    
    // Reference entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "flight_id", insertable = false, updatable = false)
    private Flight flight;
}
