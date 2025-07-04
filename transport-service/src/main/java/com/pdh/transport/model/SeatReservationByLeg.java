package com.pdh.transport.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "seat_reservations_by_leg")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeatReservationByLeg {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reservation_id")
    private Long reservationId;
    
    @Column(name = "trip_id", nullable = false)
    private Long tripId;
    
    @Column(name = "seat_id", nullable = false)
    private Long seatId;
    
    @Column(name = "booking_item_id", nullable = false)
    private UUID bookingItemId;
    
    @Column(name = "departure_stop_id", nullable = false)
    private Long departureStopId;
    
    @Column(name = "arrival_stop_id", nullable = false)
    private Long arrivalStopId;
    
    // Reference entities
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", insertable = false, updatable = false)
    private Trip trip;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", insertable = false, updatable = false)
    private Seat seat;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "departure_stop_id", insertable = false, updatable = false)
    private Stop departureStop;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "arrival_stop_id", insertable = false, updatable = false)
    private Stop arrivalStop;
}
