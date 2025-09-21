package com.pdh.booking.service;

import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.model.enums.BookingType;
import com.pdh.booking.repository.BookingRepository;
import com.pdh.common.utils.AuthenticationUtils;
import com.pdh.common.outbox.service.OutboxEventService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.common.saga.SagaState;
import com.pdh.booking.model.dto.response.BookingHistoryItemDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Booking service using CQRS pattern with Kafka events
 * Replaces direct REST calls with event-driven communication for saga orchestration
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final OutboxEventService eventPublisher;
    private final AnalyticsEventService analyticsEventService;
    private final ObjectMapper objectMapper;

    /**
     * Create booking entity and publish initial saga command
     * This method only creates the booking entity and initiates the saga
     * Actual processing is handled by the saga orchestrator via Kafka events
     */
    @Transactional
    public Booking createBooking(Booking booking) {
        log.info("Creating booking with reference: {}", booking.getBookingReference());
        
        // Set user ID from authentication context
        booking.setUserId(UUID.fromString(AuthenticationUtils.extractUserId()));
        booking.setStatus(BookingStatus.VALIDATION_PENDING);
        
        // Save booking first
        Booking savedBooking = bookingRepository.save(booking);
        
        // Publish analytics event for booking initiated
        analyticsEventService.publishBookingAnalyticsEvent(savedBooking, "booking.initiated");
        
        // Publish validation command to start the async validation process
        publishValidationCommand(savedBooking);
        
        log.info("Booking {} created and validation command published", savedBooking.getBookingReference());
        
        return savedBooking;
    }

    /**
     * Publish validation command for async processing
     * This follows the "Listen to Yourself" pattern where we publish an event
     * that we also consume to trigger async processing
     */
    private void publishValidationCommand(Booking booking) {
        try {
            // Create a simple payload with just basic information
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("eventType", "ValidateInventoryCommand");
            payloadMap.put("bookingId", booking.getBookingId().toString());
            payloadMap.put("bookingType", booking.getBookingType().name());
            payloadMap.put("totalAmount", booking.getTotalAmount());
            payloadMap.put("currency", booking.getCurrency());
            payloadMap.put("customerId", booking.getUserId().toString());
            payloadMap.put("sagaId", booking.getSagaId()); // Add sagaId to payload

            if (booking.getProductDetailsJson() != null && !booking.getProductDetailsJson().isBlank()) {
                JsonNode productDetailsNode = objectMapper.readTree(booking.getProductDetailsJson());
                payloadMap.put("productDetails", productDetailsNode);
            }

            eventPublisher.publishEvent(
                "ValidateInventoryCommand",
                "Booking",
                booking.getBookingId().toString(),
                payloadMap
            );
            
            log.debug("Validation command published for booking: {}", booking.getBookingReference());
        } catch (Exception e) {
            log.error("Error publishing validation command for booking: {}", booking.getBookingReference(), e);
            throw new BookingProcessingException("Failed to publish validation command: " + e.getMessage(), e);
        }
    }

    // Utility methods
    public Optional<Booking> findByBookingId(UUID bookingId) {
        return bookingRepository.findByBookingId(bookingId);
    }

    public Optional<Booking> findBySagaId(String sagaId) {
        return bookingRepository.findBySagaId(sagaId);
    }

    @Transactional
    public Optional<Booking> updateBookingStatus(UUID bookingId, BookingStatus newStatus) {
        return bookingRepository.findByBookingId(bookingId)
            .map(booking -> {
                booking.setStatus(newStatus);
                return bookingRepository.save(booking);
            });
    }

    @Transactional(readOnly = true)
    public Page<BookingHistoryItemDto> getBookingHistory(UUID userId, Pageable pageable) {
        Page<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return bookings.map(this::mapToHistoryItem);
    }

    private String generateConfirmationNumber() {
        return "CNF" + System.currentTimeMillis();
    }

    @Transactional
    public Booking confirmBooking(UUID bookingId) {
        return bookingRepository.findByBookingId(bookingId)
            .map(booking -> {
                booking.setStatus(BookingStatus.CONFIRMED);
                booking.setSagaState(SagaState.BOOKING_COMPLETED);
                if (booking.getConfirmationNumber() == null || booking.getConfirmationNumber().isBlank()) {
                    booking.setConfirmationNumber(generateConfirmationNumber());
                }
                return bookingRepository.save(booking);
            })
            .orElseThrow(() -> new IllegalArgumentException("Booking not found: " + bookingId));
    }

    private BookingHistoryItemDto mapToHistoryItem(Booking booking) {
        return BookingHistoryItemDto.builder()
            .bookingId(booking.getBookingId().toString())
            .bookingReference(booking.getBookingReference())
            .bookingType(booking.getBookingType())
            .status(booking.getStatus())
            .sagaState(booking.getSagaState() != null ? booking.getSagaState().name() : null)
            .totalAmount(booking.getTotalAmount())
            .currency(booking.getCurrency())
            .createdAt(booking.getCreatedAt() != null ? booking.getCreatedAt().toString() : null)
            .updatedAt(booking.getUpdatedAt() != null ? booking.getUpdatedAt().toString() : null)
            .confirmationNumber(booking.getConfirmationNumber())
            .productSummary(buildProductSummary(booking))
            .productDetailsJson(booking.getProductDetailsJson())
            .build();
    }

    private String buildProductSummary(Booking booking) {
        if (booking.getProductDetailsJson() == null || booking.getProductDetailsJson().isBlank()) {
            return null;
        }

        try {
            JsonNode root = objectMapper.readTree(booking.getProductDetailsJson());
            return switch (booking.getBookingType()) {
                case FLIGHT -> summarizeFlight(root);
                case HOTEL -> summarizeHotel(root);
                case COMBO -> summarizeCombo(root);
                default -> null;
            };
        } catch (Exception e) {
            log.warn("Failed to build product summary for booking {}", booking.getBookingId(), e);
            return null;
        }
    }

    private String summarizeFlight(JsonNode node) {
        String flightNumber = node.path("flightNumber").asText(null);
        String airline = node.path("airline").asText(null);
        String origin = node.path("originAirport").asText(null);
        String destination = node.path("destinationAirport").asText(null);

        if (flightNumber == null && airline == null && origin == null && destination == null) {
            return null;
        }

        StringBuilder builder = new StringBuilder();
        if (flightNumber != null) {
            builder.append(flightNumber);
        }
        if (airline != null) {
            if (builder.length() > 0) {
                builder.append(" · ");
            }
            builder.append(airline);
        }
        if (origin != null || destination != null) {
            if (builder.length() > 0) {
                builder.append(" · ");
            }
            builder.append(origin != null ? origin : "?")
                .append(" → ")
                .append(destination != null ? destination : "?");
        }
        return builder.toString();
    }

    private String summarizeHotel(JsonNode node) {
        String hotelName = node.path("hotelName").asText(null);
        String city = node.path("city").asText(null);
        if (hotelName == null && city == null) {
            return null;
        }
        if (hotelName != null && city != null) {
            return hotelName + " · " + city;
        }
        return hotelName != null ? hotelName : city;
    }

    private String summarizeCombo(JsonNode node) {
        StringBuilder builder = new StringBuilder();
        JsonNode flight = node.path("flightDetails");
        JsonNode hotel = node.path("hotelDetails");
        if (!flight.isMissingNode()) {
            String flightSummary = summarizeFlight(flight);
            if (flightSummary != null) {
                builder.append(flightSummary);
            }
        }
        if (!hotel.isMissingNode()) {
            String hotelSummary = summarizeHotel(hotel);
            if (hotelSummary != null) {
                if (builder.length() > 0) {
                    builder.append(" • ");
                }
                builder.append(hotelSummary);
            }
        }
        return builder.length() == 0 ? null : builder.toString();
    }

    // Exception class
    public static class BookingProcessingException extends RuntimeException {
        public BookingProcessingException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
