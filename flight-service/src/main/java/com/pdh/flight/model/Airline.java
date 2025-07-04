package com.pdh.flight.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "airlines")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Airline {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "airline_id")
    private Long airlineId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "iata_code", nullable = false, unique = true, length = 2)
    private String iataCode;

    @Column(name = "logo_url", length = 255)
    private String logoUrl;
}
