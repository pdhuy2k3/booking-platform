package com.pdh.flight.model;

import com.pdh.common.model.AbstractAuditEntity;
import com.pdh.flight.model.enums.FareClass;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "flight_fares",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_flight_fares_schedule_class", 
                           columnNames = {"schedule_id", "fare_class"})
       })
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

    @Column(name = "fare_class", nullable = false)
    @Enumerated(EnumType.STRING)
    private FareClass fareClass;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "available_seats", nullable = false)
    private Integer availableSeats;

    // Reference entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", insertable = false, updatable = false)
    private FlightSchedule flightSchedule;
}
