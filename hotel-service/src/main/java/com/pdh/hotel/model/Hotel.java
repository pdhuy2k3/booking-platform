package com.pdh.hotel.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "hotels")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Hotel extends AbstractAuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long hotelId;
    
    @Column(name = "name", nullable = false, length = 255)
    private String name;
    
    @Column(name = "address", nullable = false, length = 255)
    private String address;
    
    @Column(name = "city_id", nullable = false)
    private Long cityId;
    
    @Column(name = "star_rating")
    private Short starRating;
    
    @Column(name = "description", columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "latitude", precision = 9, scale = 6)
    private BigDecimal latitude;
    
    @Column(name = "longitude", precision = 9, scale = 6)
    private BigDecimal longitude;
    
    @Column(name = "checkin_time")
    private LocalTime checkinTime;
    
    @Column(name = "checkout_time")
    private LocalTime checkoutTime;
    
    // Reference entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "city_id", insertable = false, updatable = false)
    private City city;
}
