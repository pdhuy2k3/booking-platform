package com.pdh.booking.model.viewmodel;

import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.model.enums.BookingType;
import com.pdh.common.saga.SagaState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * ViewModel for Backoffice booking management
 * Contains detailed information and admin-specific fields
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BackofficeBookingViewModel {
    
    /**
     * Unique booking identifier
     */
    private UUID bookingId;
    
    /**
     * Human-readable booking reference
     */
    private String bookingReference;
    
    /**
     * User who made the booking
     */
    private UUID userId;
    
    /**
     * Customer information
     */
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    
    /**
     * Saga instance identifier
     */
    private String sagaId;
    
    /**
     * Current booking status
     */
    private BookingStatus status;
    
    /**
     * Current saga state
     */
    private SagaState sagaState;
    
    /**
     * Type of booking
     */
    private BookingType bookingType;
    
    /**
     * Financial information
     */
    private BigDecimal totalAmount;
    private String currency;
    private BigDecimal paidAmount;
    private BigDecimal refundedAmount;
    
    /**
     * Timestamps
     */
    private String createdAt;
    private String updatedAt;
    private String confirmedAt;
    private String cancelledAt;
    
    /**
     * Confirmation details
     */
    private String confirmationNumber;
    private String cancellationReason;
    private String compensationReason;
    
    // Admin-specific computed fields
    
    /**
     * Saga execution history
     */
    private List<SagaStateTransition> sagaHistory;
    
    /**
     * Risk assessment score
     */
    private Integer riskScore;
    
    /**
     * Processing time in minutes
     */
    private Long processingTimeMinutes;
    
    /**
     * Whether manual intervention is required
     */
    private Boolean requiresManualReview;
    
    /**
     * System flags and alerts
     */
    private List<String> systemFlags;
    
    /**
     * Related bookings (for combo bookings)
     */
    private List<String> relatedBookingIds;
    
    /**
     * Payment transaction IDs
     */
    private List<String> paymentTransactionIds;
    
    /**
     * Nested class for saga state transitions
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SagaStateTransition {
        private SagaState fromState;
        private SagaState toState;
        private String timestamp;
        private String reason;
        private String triggeredBy;
        private Long durationMs;
    }
}
