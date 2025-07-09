package com.pdh.booking.model;

import com.pdh.common.saga.SagaState;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Saga Instance Entity - tracks the state of a booking saga
 * 
 * This entity maintains the state and lifecycle of individual saga instances.
 * Each booking has one saga instance that tracks the distributed transaction.
 */
@Entity
@Table(name = "booking_saga_instances")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingSagaInstance {
    
    @Id
    @Builder.Default
    private String sagaId = UUID.randomUUID().toString();
    
    @Column(nullable = false, unique = true)
    private UUID bookingId;
    
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SagaState currentState = SagaState.BOOKING_INITIATED;
    
    @CreationTimestamp
    private ZonedDateTime startedAt;
    
    @UpdateTimestamp
    private ZonedDateTime lastUpdatedAt;
    
    private ZonedDateTime completedAt;
    
    @Builder.Default
    private Boolean isCompensating = false;
    
    private String compensationReason;
    
    @Column(name = "step_context", columnDefinition = "TEXT")
    private String stepContext; // JSON context for saga steps
    
    @Version
    private Long version; // Optimistic locking
    
    // Business methods
    public void complete() {
        this.completedAt = ZonedDateTime.now();
        this.currentState = SagaState.BOOKING_COMPLETED;
    }
    
    public void startCompensation(String reason) {
        this.isCompensating = true;
        this.compensationReason = reason;
    }
    
    public void cancel() {
        this.completedAt = ZonedDateTime.now();
        this.currentState = SagaState.BOOKING_CANCELLED;
    }
    
    public boolean isCompleted() {
        return completedAt != null && 
               (currentState == SagaState.BOOKING_COMPLETED || 
                currentState == SagaState.BOOKING_CANCELLED);
    }
    
    public boolean isInProgress() {
        return !isCompleted() && !isCompensating;
    }
}
