package com.pdh.transport.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "route_stops")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RouteStop {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "route_id", nullable = false)
    private Long routeId;
    
    @Column(name = "stop_id", nullable = false)
    private Long stopId;
    
    @Column(name = "stop_order", nullable = false)
    private Short stopOrder;
    
    @Column(name = "travel_time_from_previous_mins")
    private Integer travelTimeFromPreviousMins;
    
    // Reference entities
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id", insertable = false, updatable = false)
    private Route route;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stop_id", insertable = false, updatable = false)
    private Stop stop;
}
