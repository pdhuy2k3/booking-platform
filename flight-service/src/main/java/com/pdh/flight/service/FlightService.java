package com.pdh.flight.service;

import com.pdh.flight.dto.FlightBookingDetailsDto;
import com.pdh.flight.dto.FlightReservationData;
import com.pdh.common.outbox.service.OutboxEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlightService {

    private final OutboxEventService eventPublisher;
    private final FlightInventoryService flightInventoryService;

    @Transactional
    public void reserveFlight(UUID bookingId) {
        // Legacy method for backward compatibility
        log.info("Reserving flight for booking: {} (legacy method)", bookingId);

        // Publish basic success event
        eventPublisher.publishEvent("FlightReserved", "Booking", bookingId.toString(), Map.of("bookingId", bookingId));
    }

    @Transactional
    public void reserveFlight(UUID bookingId, String sagaId, FlightBookingDetailsDto flightDetails) {
        log.info("Reserving flight for booking: {} with detailed product information", bookingId);

        try {
            // Validate flight availability and reserve inventory
            boolean inventoryReserved = flightInventoryService.reserveSeats(
                Long.parseLong(flightDetails.getFlightId()),
                flightDetails.getSeatClass(),
                flightDetails.getPassengerCount(),
                flightDetails.getDepartureDateTime().toLocalDate()
            );

            if (!inventoryReserved) {
                throw new RuntimeException("Flight inventory not available for reservation");
            }

            // Create detailed flight reservation data for saga event
            FlightReservationData flightData = FlightReservationData.builder()
                .flightId(flightDetails.getFlightId())
                .reservationId("FLT-" + bookingId.toString().substring(0, 8))
                .departureDate(flightDetails.getDepartureDateTime().format(DateTimeFormatter.ISO_LOCAL_DATE))
                .returnDate(flightDetails.getReturnFlight() != null ?
                    flightDetails.getReturnFlight().getDepartureDateTime().format(DateTimeFormatter.ISO_LOCAL_DATE) : null)
                .passengers(flightDetails.getPassengerCount())
                .seatClass(flightDetails.getSeatClass())
                .amount(BigDecimal.valueOf(flightDetails.getTotalFlightPrice()))
                .build();

            // Create comprehensive event payload
            Map<String, Object> eventPayload = new HashMap<>();
            eventPayload.put("bookingId", bookingId);
            eventPayload.put("sagaId", sagaId);
            eventPayload.put("flightData", flightData);
            eventPayload.put("flightDetails", flightDetails);

            // Publish detailed success event
            eventPublisher.publishEvent("FlightReserved", "Booking", bookingId.toString(), eventPayload);

            log.info("Flight reserved successfully for booking: {} with flight: {}", bookingId, flightDetails.getFlightId());

        } catch (Exception e) {
            log.error("Failed to reserve flight for booking: {}", bookingId, e);

            // Create failure event payload
            Map<String, Object> failurePayload = new HashMap<>();
            failurePayload.put("bookingId", bookingId);
            failurePayload.put("sagaId", sagaId);
            failurePayload.put("errorMessage", e.getMessage());
            failurePayload.put("flightId", flightDetails.getFlightId());

            // Publish failure event
            eventPublisher.publishEvent("FlightReservationFailed", "Booking", bookingId.toString(), failurePayload);

            throw e;
        }
    }

    @Transactional
    public void cancelFlightReservation(UUID bookingId) {
        // Legacy method for backward compatibility
        log.info("Canceling flight reservation for booking: {} (legacy method)", bookingId);

        // Publish basic cancellation event
        eventPublisher.publishEvent("FlightReservationCancelled", "Booking", bookingId.toString(), Map.of("bookingId", bookingId));
    }

    @Transactional
    public void cancelFlightReservation(UUID bookingId, String sagaId, FlightBookingDetailsDto flightDetails) {
        log.info("Canceling flight reservation for booking: {} with detailed product information", bookingId);

        try {
            // Release flight inventory
            flightInventoryService.releaseSeats(
                Long.parseLong(flightDetails.getFlightId()),
                flightDetails.getSeatClass(),
                flightDetails.getPassengerCount(),
                flightDetails.getDepartureDateTime().toLocalDate()
            );

            // Create detailed cancellation event payload
            Map<String, Object> eventPayload = new HashMap<>();
            eventPayload.put("bookingId", bookingId);
            eventPayload.put("sagaId", sagaId);
            eventPayload.put("flightId", flightDetails.getFlightId());
            eventPayload.put("passengers", flightDetails.getPassengerCount());
            eventPayload.put("seatClass", flightDetails.getSeatClass());

            // Publish detailed cancellation event
            eventPublisher.publishEvent("FlightReservationCancelled", "Booking", bookingId.toString(), eventPayload);

            log.info("Flight reservation cancelled successfully for booking: {}", bookingId);

        } catch (Exception e) {
            log.error("Failed to cancel flight reservation for booking: {}", bookingId, e);
            throw e;
        }
    }

    // Listen to Yourself Pattern verification methods

    /**
     * Verify that a flight reservation actually exists and is in correct state
     */
    @Transactional(readOnly = true)
    public boolean verifyFlightReservation(UUID flightId, String bookingId) {
        log.info("Verifying flight reservation: flightId={}, bookingId={}", flightId, bookingId);

        try {
            // Check if the flight inventory has been properly reserved
            // This is a simplified verification - in real implementation,
            // you would check actual reservation records
            boolean inventoryReserved = flightInventoryService.isInventoryReserved(
                flightId.toString(), bookingId);

            if (!inventoryReserved) {
                log.warn("Flight inventory not found for reservation: flightId={}, bookingId={}",
                        flightId, bookingId);
                return false;
            }

            log.info("Flight reservation verified successfully: flightId={}, bookingId={}",
                    flightId, bookingId);
            return true;

        } catch (Exception e) {
            log.error("Error verifying flight reservation: flightId={}, bookingId={}",
                    flightId, bookingId, e);
            return false;
        }
    }

    /**
     * Verify that a flight reservation failure is in correct state
     */
    @Transactional(readOnly = true)
    public boolean verifyFlightReservationFailure(UUID flightId) {
        log.info("Verifying flight reservation failure: flightId={}", flightId);

        try {
            // Check that no inventory is reserved for this flight
            // This ensures the failure was properly handled
            boolean noInventoryReserved = !flightInventoryService.hasAnyReservation(flightId.toString());

            if (!noInventoryReserved) {
                log.warn("Flight still has reservations despite failure: flightId={}", flightId);
                return false;
            }

            log.info("Flight reservation failure verified: flightId={}", flightId);
            return true;

        } catch (Exception e) {
            log.error("Error verifying flight reservation failure: flightId={}", flightId, e);
            return false;
        }
    }

    /**
     * Verify that a flight cancellation is in correct state
     */
    @Transactional(readOnly = true)
    public boolean verifyFlightCancellation(UUID flightId) {
        log.info("Verifying flight cancellation: flightId={}", flightId);

        try {
            // Check that inventory has been properly released
            boolean inventoryReleased = !flightInventoryService.hasAnyReservation(flightId.toString());

            if (!inventoryReleased) {
                log.warn("Flight inventory not released after cancellation: flightId={}", flightId);
                return false;
            }

            log.info("Flight cancellation verified: flightId={}", flightId);
            return true;

        } catch (Exception e) {
            log.error("Error verifying flight cancellation: flightId={}", flightId, e);
            return false;
        }
    }
}
