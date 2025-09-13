package com.pdh.flight.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "aircraft")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class Aircraft extends AbstractAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "aircraft_id")
    private Long aircraftId;

    @Column(name = "model", nullable = false, length = 100)
    private String model;

    @Column(name = "manufacturer", length = 100)
    private String manufacturer;

    @Column(name = "capacity_economy")
    private Integer capacityEconomy;

    @Column(name = "capacity_business")
    private Integer capacityBusiness;

    @Column(name = "capacity_first")
    private Integer capacityFirst;

    @Column(name = "total_capacity")
    private Integer totalCapacity;

    @Column(name = "registration_number", unique = true, length = 20)
    private String registrationNumber;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    private Long featuredMediaId;
}