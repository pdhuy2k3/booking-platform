package com.pdh.transport.model;

import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Entity
@Table(name = "ticket_segments")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class TicketSegment extends AbstractAuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "ticket_segment_id")
    private UUID ticketSegmentId;
    
    @Column(name = "booking_item_id", nullable = false)
    private UUID bookingItemId;
    
    @Column(name = "trip_id", nullable = false)
    private UUID tripId;
    
    @Column(name = "seat_id", nullable = false)
    private Long seatId;
    
    @Column(name = "from_stop_order", nullable = false)
    private Integer fromStopOrder;
    
    @Column(name = "to_stop_order", nullable = false)
    private Integer toStopOrder;
    
    // Reference entities
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", insertable = false, updatable = false)
    private Trip trip;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seat_id", insertable = false, updatable = false)
    private Seat seat;
}
