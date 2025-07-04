package com.pdh.transport.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "route_fares")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteFare {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "fare_id")
    private Long fareId;
    
    @Column(name = "route_id", nullable = false)
    private Long routeId;
    
    @Column(name = "origin_stop_id", nullable = false)
    private Long originStopId;
    
    @Column(name = "destination_stop_id", nullable = false)
    private Long destinationStopId;
    
    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    // Reference entities
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", insertable = false, updatable = false)
    private Route route;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_stop_id", insertable = false, updatable = false)
    private Stop originStop;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destination_stop_id", insertable = false, updatable = false)
    private Stop destinationStop;
}
