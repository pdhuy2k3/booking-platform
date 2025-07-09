package com.pdh.flight.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "flight_fares")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class FlightFare extends AbstractAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "fare_id")
    private UUID fareId;

    @Column(name = "schedule_id", nullable = false)
    private UUID scheduleId;

    @Column(name = "fare_class", nullable = false, length = 50)
    private String fareClass;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "available_seats", nullable = false)
    private Integer availableSeats;

    // Reference entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", insertable = false, updatable = false)
    private FlightSchedule flightSchedule;
}
