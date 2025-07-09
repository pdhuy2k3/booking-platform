package com.pdh.booking.model;

import com.pdh.common.model.AbstractAuditEntity;
import com.pdh.common.saga.SagaState;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "saga_state_log")
@Data
@EqualsAndHashCode(callSuper = false)
@NoArgsConstructor
@AllArgsConstructor
public class SagaStateLog extends AbstractAuditEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "saga_id", nullable = false)
    private String sagaId;
    
    @Column(name = "booking_id", nullable = false)
    private String bookingId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "from_state")
    private SagaState fromState;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "to_state", nullable = false)
    private SagaState toState;
    
    @Column(name = "event_type", nullable = false)
    private String eventType;
    
    @Column(name = "event_payload", columnDefinition = "TEXT")
    private String eventPayload;
    
    @Column(name = "compensation_data", columnDefinition = "TEXT")
    private String compensationData;
    
    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(name = "processed_at", nullable = false)
    private LocalDateTime processedAt = LocalDateTime.now();
}
