package com.pdh.booking.model;

import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.model.enums.BookingType;
import com.pdh.common.model.AbstractAuditEntity;
import com.pdh.common.saga.SagaState;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "bookings")
@Data
@EqualsAndHashCode(callSuper = false)
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
    
    // Saga Pattern Fields
    @Enumerated(EnumType.STRING)
    @Column(name = "saga_state", nullable = false)
    private SagaState sagaState = SagaState.BOOKING_INITIATED;
    
    @Column(name = "saga_id", nullable = false)
    private String sagaId = UUID.randomUUID().toString();
    
    @Column(name = "confirmation_number", length = 50)
    private String confirmationNumber;
    
    @Column(name = "cancelled_at")
    private ZonedDateTime cancelledAt;
    
    @Column(name = "cancellation_reason")
    private String cancellationReason;
    
    @Column(name = "compensation_reason", columnDefinition = "TEXT")
    private String compensationReason;

    // Product Details (stored as JSONB - flexible payload based on BookingType)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "product_details", columnDefinition = "JSONB")
    private String productDetailsJson;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "booking_source", length = 50)
    private String bookingSource;
}
