package com.pdh.booking.model;

import com.pdh.booking.model.enums.ServiceType;
import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "booking_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingItem extends AbstractAuditEntity {
    
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
    @JdbcTypeCode(SqlTypes.JSON)
    private String details;
    
    // Reference entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", insertable = false, updatable = false)
    private Booking booking;
}
