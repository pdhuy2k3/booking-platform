package com.pdh.booking.model;

import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.model.enums.BookingType;
import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking extends AbstractAuditEntity {
    
    @Id
    @Column(name = "booking_id")
    private UUID bookingId = UUID.randomUUID();
    
    @Column(name = "booking_reference", nullable = false, unique = true, length = 20)
    private String bookingReference;
    
    @Column(name = "user_id", nullable = false)
    private UUID userId;
    
    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;
    
    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "VND";
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BookingStatus status;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "booking_type", nullable = false)
    private BookingType bookingType;
    
    
    
    @Column(name = "cancelled_at")
    private ZonedDateTime cancelledAt;
    
    @Column(name = "cancellation_reason")
    private String cancellationReason;
    
    
}
