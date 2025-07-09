package com.pdh.hotel.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "amenities")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class Amenity extends AbstractAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "amenity_id")
    private Long amenityId;

    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "display_order")
    private Integer displayOrder;


}
