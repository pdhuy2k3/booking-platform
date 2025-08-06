package com.pdh.flight.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "flights")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class Flight extends AbstractAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "flight_id")
    private Long flightId;

    @Column(name = "flight_number", nullable = false, length = 20)
    private String flightNumber;

    @Column(name = "airline_id", nullable = false)
    private Long airlineId;

    @Column(name = "departure_airport_id", nullable = false)
    private Long departureAirportId;

    @Column(name = "arrival_airport_id", nullable = false)
    private Long arrivalAirportId;

    @Column(name = "base_duration_minutes")
    private Integer baseDurationMinutes;

    // Reference entities - avoiding @ManyToMany as requested
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "airline_id", insertable = false, updatable = false)
    private Airline airline;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departure_airport_id", insertable = false, updatable = false)
    private Airport departureAirport;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "arrival_airport_id", insertable = false, updatable = false)
    private Airport arrivalAirport;
}
