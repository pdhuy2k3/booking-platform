package com.pdh.flight.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "airports")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class Airport extends AbstractAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "airport_id")
    private Long airportId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "iata_code", nullable = false, unique = true, length = 3)
    private String iataCode;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Images are managed through the unified Image entity with entityType = "AIRPORT" and entityId = airportId
    // No direct JPA relationship - images are accessed via ImageService
}
