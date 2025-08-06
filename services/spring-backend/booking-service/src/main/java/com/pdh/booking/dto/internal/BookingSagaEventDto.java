package com.pdh.booking.dto.internal;

import com.pdh.booking.model.enums.BookingType;
import com.pdh.booking.model.enums.SagaState;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Internal DTO for saga event communication between services
 * Used for service-to-service messaging and event processing
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingSagaEventDto {
    
    /**
     * Event metadata
     */
    private String eventId;
    private String eventType;
    private ZonedDateTime timestamp;
    private String source;
    
    /**
     * Booking information
     */
    private UUID bookingId;
    private String bookingReference;
    private String sagaId;
    private UUID userId;
    
    /**
     * Saga state information
     */
    private SagaState currentState;
    private SagaState previousState;
    private SagaState targetState;
    
    /**
     * Booking details
     */
    private BookingType bookingType;
    private BigDecimal totalAmount;
    private String currency;
    
    /**
     * Service-specific data
     */
    private FlightReservationData flightData;
    private HotelReservationData hotelData;
    private PaymentData paymentData;
    
    /**
     * Additional context and metadata
     */
    private Map<String, Object> additionalData;
    private String correlationId;
    private Integer retryCount;
    private String errorMessage;
    
    /**
     * Nested class for flight reservation data
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FlightReservationData {
        private String flightId;
        private String reservationId;
        private String departureDate;
        private String returnDate;
        private Integer passengers;
        private String seatClass;
        private BigDecimal amount;
    }
    
    /**
     * Nested class for hotel reservation data
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HotelReservationData {
        private String hotelId;
        private String roomId;
        private String reservationId;
        private String checkInDate;
        private String checkOutDate;
        private Integer guests;
        private Integer rooms;
        private BigDecimal amount;
    }
    
    /**
     * Nested class for payment data
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentData {
        private String paymentId;
        private String transactionId;
        private String paymentMethod;
        private BigDecimal amount;
        private String status;
        private String gatewayResponse;
    }
}
