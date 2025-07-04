package com.pdh.booking.model;

import com.pdh.booking.model.enums.SagaStatus;
import com.pdh.common.model.AbstractAuditEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "sagas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Saga extends AbstractAuditEntity {
    
    @Id
    @Column(name = "saga_id")
    private UUID sagaId = UUID.randomUUID();
    
    @Column(name = "booking_id", nullable = false, unique = true)
    private UUID bookingId;
    
    @Column(name = "saga_type", nullable = false, length = 100)
    private String sagaType;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SagaStatus status;
    
    @Column(name = "payload", columnDefinition = "JSONB")
    private String payload;
    
    
    
    // Reference entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", insertable = false, updatable = false)
    private Booking booking;
}
