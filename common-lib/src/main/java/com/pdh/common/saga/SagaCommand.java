package com.pdh.common.saga;

import com.pdh.common.event.DomainEvent;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Saga Command DTO - Extends existing DomainEvent from common-lib
 * Centralized in common-lib for reuse across all services
 * 
 * This command represents a typed saga operation that can be sent
 * directly to services via Kafka topics, complementing the existing
 * outbox event pattern for enhanced saga orchestration.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Builder(toBuilder = true)
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@JsonIgnoreProperties(ignoreUnknown = true)
public class SagaCommand extends DomainEvent {
    
    @NotNull
    private String sagaId;
    
    @NotNull
    private UUID bookingId;
    
    @NotNull
    private String action;
    
    private UUID customerId;
    private String bookingType; // Use String instead of enum for flexibility across services
    private BigDecimal totalAmount;
    
    // Product-specific details (flexible Object type for different DTOs)
    private Object flightDetails;
    private Object hotelDetails;
    private Object paymentDetails;
    
    // Command metadata
    @Builder.Default
    private Map<String, String> metadata = new HashMap<>();

    @Builder.Default
    private Integer retryCount = 0;

    private String correlationId;

    @Builder.Default
    private Boolean criticalFailure = false;

    // Enhanced compensation support
    private CompensationStrategy compensationStrategy;
    private CompensationContext compensationContext;
    
    // Implement DomainEvent abstract methods
    @Override
    public String getAggregateId() {
        return sagaId;
    }
    
    @Override
    public String getAggregateType() {
        return "Saga";
    }
    
    // Utility methods
    public void addMetadata(String key, String value) {
        this.metadata.put(key, value);
    }
    
    public String getMetadata(String key) {
        return this.metadata.get(key);
    }
    
    public boolean isCompensationCommand() {
        return action != null && (action.startsWith("CANCEL_") || action.startsWith("REFUND_"));
    }
    
    public boolean hasFlightDetails() {
        return flightDetails != null;
    }
    
    public boolean hasHotelDetails() {
        return hotelDetails != null;
    }
    
    public boolean hasPaymentDetails() {
        return paymentDetails != null;
    }
    
    /**
     * Creates a new SagaCommand with incremented retry count
     */
    public SagaCommand withRetry() {
        SagaCommand retryCommand = this.toBuilder()
            .retryCount(this.retryCount + 1)
            .build();
        retryCommand.addMetadata("previousRetryCount", this.retryCount.toString());
        return retryCommand;
    }
    
    /**
     * Marks this command as a compensation command
     */
    public void markAsCompensation(String reason) {
        this.addMetadata("isCompensation", "true");
        this.addMetadata("compensationReason", reason);
    }

    /**
     * Enhanced compensation support methods
     */
    public boolean hasCompensationContext() {
        return compensationContext != null;
    }

    public boolean shouldRetry() {
        return hasCompensationContext() && compensationContext.shouldRetry();
    }

    public boolean shouldCompensate() {
        return hasCompensationContext() && compensationContext.shouldCompensate();
    }

    public boolean isCriticalFailure() {
        if (criticalFailure != null) {
            return criticalFailure;
        }
        return hasCompensationContext() && compensationContext.isCriticalFailure();
    }

    /**
     * Creates a compensation command for this saga command
     */
    public SagaCommand createCompensationCommand() {
        String compensationAction = getCompensationAction(this.action);

        return this.toBuilder()
            .action(compensationAction)
            .compensationContext(hasCompensationContext() ?
                compensationContext.forCompensation() : null)
            .build();
    }

    /**
     * Gets the compensation action for a given action
     */
    private String getCompensationAction(String originalAction) {
        return switch (originalAction) {
            case "RESERVE_FLIGHT" -> "CANCEL_FLIGHT_RESERVATION";
            case "RESERVE_HOTEL" -> "CANCEL_HOTEL_RESERVATION";
            case "PROCESS_PAYMENT" -> "REFUND_PAYMENT";
            case "CONFIRM_BOOKING" -> "CANCEL_BOOKING";
            default -> "COMPENSATE_" + originalAction;
        };
    }
}
