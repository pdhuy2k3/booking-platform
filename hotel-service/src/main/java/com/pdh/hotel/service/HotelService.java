package com.pdh.hotel.service;

import com.pdh.hotel.dto.HotelBookingDetailsDto;
import com.pdh.hotel.dto.HotelReservationData;
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
public class HotelService {

    private final OutboxEventService eventPublisher;
    private final HotelInventoryService hotelInventoryService;

    @Transactional
    public void reserveHotel(UUID bookingId) {
        // Legacy method for backward compatibility
        log.info("Reserving hotel for booking: {} (legacy method)", bookingId);

        // Publish basic success event
        eventPublisher.publishEvent("HotelReserved", "Booking", bookingId.toString(), Map.of("bookingId", bookingId));
    }

    @Transactional
    public void reserveHotel(UUID bookingId, String sagaId, HotelBookingDetailsDto hotelDetails) {
        log.info("Reserving hotel for booking: {} with detailed product information", bookingId);

        try {
            // Validate hotel room availability and reserve inventory
            boolean inventoryReserved = hotelInventoryService.reserveRooms(
                Long.parseLong(hotelDetails.getHotelId()),
                hotelDetails.getRoomType(),
                hotelDetails.getRooms(),
                hotelDetails.getCheckInDate(),
                hotelDetails.getCheckOutDate()
            );

            if (!inventoryReserved) {
                throw new RuntimeException("Hotel room inventory not available for reservation");
            }

            // Create detailed hotel reservation data for saga event
            HotelReservationData hotelData = HotelReservationData.builder()
                .hotelId(hotelDetails.getHotelId())
                .roomId(hotelDetails.getRoomId())
                .reservationId("HTL-" + bookingId.toString().substring(0, 8))
                .checkInDate(hotelDetails.getCheckInDate().format(DateTimeFormatter.ISO_LOCAL_DATE))
                .checkOutDate(hotelDetails.getCheckOutDate().format(DateTimeFormatter.ISO_LOCAL_DATE))
                .guests(hotelDetails.getGuests())
                .rooms(hotelDetails.getRooms())
                .amount(BigDecimal.valueOf(hotelDetails.getTotalRoomPrice()))
                .build();

            // Create comprehensive event payload
            Map<String, Object> eventPayload = new HashMap<>();
            eventPayload.put("bookingId", bookingId);
            eventPayload.put("sagaId", sagaId);
            eventPayload.put("hotelData", hotelData);
            eventPayload.put("hotelDetails", hotelDetails);

            // Publish detailed success event
            eventPublisher.publishEvent("HotelReserved", "Booking", bookingId.toString(), eventPayload);

            log.info("Hotel reserved successfully for booking: {} with hotel: {}", bookingId, hotelDetails.getHotelId());

        } catch (Exception e) {
            log.error("Failed to reserve hotel for booking: {}", bookingId, e);

            // Create failure event payload
            Map<String, Object> failurePayload = new HashMap<>();
            failurePayload.put("bookingId", bookingId);
            failurePayload.put("sagaId", sagaId);
            failurePayload.put("errorMessage", e.getMessage());
            failurePayload.put("hotelId", hotelDetails.getHotelId());

            // Publish failure event
            eventPublisher.publishEvent("HotelReservationFailed", "Booking", bookingId.toString(), failurePayload);

            throw e;
        }
    }

    @Transactional
    public void cancelHotelReservation(UUID bookingId) {
        // Legacy method for backward compatibility
        log.info("Canceling hotel reservation for booking: {} (legacy method)", bookingId);

        // Publish basic cancellation event
        eventPublisher.publishEvent("HotelReservationCancelled", "Booking", bookingId.toString(), Map.of("bookingId", bookingId));
    }

    @Transactional
    public void cancelHotelReservation(UUID bookingId, String sagaId, HotelBookingDetailsDto hotelDetails) {
        log.info("Canceling hotel reservation for booking: {} with detailed product information", bookingId);

        try {
            // Release hotel room inventory
            hotelInventoryService.releaseRooms(
                Long.parseLong(hotelDetails.getHotelId()),
                hotelDetails.getRoomType(),
                hotelDetails.getRooms(),
                hotelDetails.getCheckInDate(),
                hotelDetails.getCheckOutDate()
            );

            // Create detailed cancellation event payload
            Map<String, Object> eventPayload = new HashMap<>();
            eventPayload.put("bookingId", bookingId);
            eventPayload.put("sagaId", sagaId);
            eventPayload.put("hotelId", hotelDetails.getHotelId());
            eventPayload.put("roomId", hotelDetails.getRoomId());
            eventPayload.put("guests", hotelDetails.getGuests());
            eventPayload.put("rooms", hotelDetails.getRooms());

            // Publish detailed cancellation event
            eventPublisher.publishEvent("HotelReservationCancelled", "Booking", bookingId.toString(), eventPayload);

            log.info("Hotel reservation cancelled successfully for booking: {}", bookingId);

        } catch (Exception e) {
            log.error("Failed to cancel hotel reservation for booking: {}", bookingId, e);
            throw e;
        }
    }

    // Listen to Yourself Pattern verification methods

    /**
     * Verify that a hotel reservation actually exists and is in correct state
     */
    @Transactional(readOnly = true)
    public boolean verifyHotelReservation(UUID hotelId, String bookingId) {
        log.info("Verifying hotel reservation: hotelId={}, bookingId={}", hotelId, bookingId);

        try {
            // Check if the hotel inventory has been properly reserved
            // This is a simplified verification - in real implementation,
            // you would check actual reservation records
            boolean inventoryReserved = hotelInventoryService.isInventoryReserved(
                hotelId.toString(), bookingId);

            if (!inventoryReserved) {
                log.warn("Hotel inventory not found for reservation: hotelId={}, bookingId={}",
                        hotelId, bookingId);
                return false;
            }

            log.info("Hotel reservation verified successfully: hotelId={}, bookingId={}",
                    hotelId, bookingId);
            return true;

        } catch (Exception e) {
            log.error("Error verifying hotel reservation: hotelId={}, bookingId={}",
                    hotelId, bookingId, e);
            return false;
        }
    }

    /**
     * Verify that a hotel reservation failure is in correct state
     */
    @Transactional(readOnly = true)
    public boolean verifyHotelReservationFailure(UUID hotelId) {
        log.info("Verifying hotel reservation failure: hotelId={}", hotelId);

        try {
            // Check that no inventory is reserved for this hotel
            // This ensures the failure was properly handled
            boolean noInventoryReserved = !hotelInventoryService.hasAnyReservation(hotelId.toString());

            if (!noInventoryReserved) {
                log.warn("Hotel still has reservations despite failure: hotelId={}", hotelId);
                return false;
            }

            log.info("Hotel reservation failure verified: hotelId={}", hotelId);
            return true;

        } catch (Exception e) {
            log.error("Error verifying hotel reservation failure: hotelId={}", hotelId, e);
            return false;
        }
    }

    /**
     * Verify that a hotel cancellation is in correct state
     */
    @Transactional(readOnly = true)
    public boolean verifyHotelCancellation(UUID hotelId) {
        log.info("Verifying hotel cancellation: hotelId={}", hotelId);

        try {
            // Check that inventory has been properly released
            boolean inventoryReleased = !hotelInventoryService.hasAnyReservation(hotelId.toString());

            if (!inventoryReleased) {
                log.warn("Hotel inventory not released after cancellation: hotelId={}", hotelId);
                return false;
            }

            log.info("Hotel cancellation verified: hotelId={}", hotelId);
            return true;

        } catch (Exception e) {
            log.error("Error verifying hotel cancellation: hotelId={}", hotelId, e);
            return false;
        }
    }
}
