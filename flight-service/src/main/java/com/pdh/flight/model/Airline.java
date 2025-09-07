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

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Images are managed through the unified Image entity with entityType = "AIRLINE" and entityId = airlineId
    // No direct JPA relationship - images are accessed via ImageService
}
