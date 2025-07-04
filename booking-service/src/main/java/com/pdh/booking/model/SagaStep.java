package com.pdh.booking.model;

import com.pdh.booking.model.enums.SagaStepStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "saga_steps")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SagaStep {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "step_id")
    private Long stepId;
    
    @Column(name = "saga_id", nullable = false)
    private UUID sagaId;
    
    @Column(name = "step_name", nullable = false, length = 100)
    private String stepName;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private SagaStepStatus status;
    
    @Column(name = "request_payload", columnDefinition = "JSONB")
    private String requestPayload;
    
    @Column(name = "response_payload", columnDefinition = "JSONB")
    private String responsePayload;
    
    @Column(name = "start_time")
    private ZonedDateTime startTime;
    
    @Column(name = "end_time")
    private ZonedDateTime endTime;
    
    // Reference entity
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "saga_id", insertable = false, updatable = false)
    private Saga saga;
}
