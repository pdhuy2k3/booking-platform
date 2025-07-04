package com.pdh.flight.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "flights")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Flight extends AbstractAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "flight_id")
    private Long flightId;

    @Column(name = "flight_number", nullable = false, length = 10)
    private String flightNumber;

    @Column(name = "airline_id", nullable = false)
    private Long airlineId;

    @Column(name = "aircraft_type", length = 50)
    private String aircraftType;
    
    // Reference to Airline entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "airline_id", insertable = false, updatable = false)
    private Airline airline;
}
