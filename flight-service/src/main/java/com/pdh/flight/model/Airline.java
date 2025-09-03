package com.pdh.flight.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "airlines")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class Airline extends AbstractAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "airline_id")
    private Long airlineId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "iata_code", unique = true, length = 2)
    private String iataCode;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    // One-to-Many relationship with AirlineImage
    @OneToMany(mappedBy = "airline", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AirlineImage> images;
}
