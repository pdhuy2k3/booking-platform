package com.pdh.booking.model;

import com.pdh.booking.model.enums.ServiceType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "booking_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingItem {
    
    @Id
    @Column(name = "item_id")
    private UUID itemId = UUID.randomUUID();
    
    @Column(name = "booking_id", nullable = false)
    private UUID bookingId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "service_type", nullable = false)
    private ServiceType serviceType;
    
    @Column(name = "provider_booking_ref", length = 255)
    private String providerBookingRef;
    
    @Column(name = "status", length = 50)
    private String status;
    
    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;
    
    @Column(name = "details", columnDefinition = "JSONB")
    private String details;
    
    // Reference entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", insertable = false, updatable = false)
    private Booking booking;
}
