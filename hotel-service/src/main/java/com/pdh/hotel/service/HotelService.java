package com.pdh.hotel.service;

import com.pdh.common.outbox.service.OutboxEventService;
import com.pdh.hotel.dto.HotelBookingDetailsDto;
import com.pdh.hotel.dto.HotelReservationData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
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
        eventPublisher.publishEvent("HotelReserved", "Booking", bookingId.toString(),
                Map.of("eventType", "HotelReserved", "bookingId", bookingId));
    }

    @Transactional
    public void reserveHotel(UUID bookingId, String sagaId, HotelBookingDetailsDto hotelDetails) {
        log.info("Reserving hotel for booking: {} with detailed product information", bookingId);

        try {
            // Validate hotel room availability and reserve inventory
            Long hotelId = parseLongSafely(hotelDetails.getHotelId(), "hotelId");
            Long roomTypeId = parseLongSafely(hotelDetails.getRoomTypeId(), "roomTypeId");
            Integer roomsRequested = hotelDetails.getNumberOfRooms() != null ? hotelDetails.getNumberOfRooms() : 1;
            LocalDate checkInDate = hotelDetails.getCheckInDate();
            LocalDate checkOutDate = hotelDetails.getCheckOutDate();

            if (hotelId == null || checkInDate == null || checkOutDate == null) {
                throw new IllegalArgumentException("Hotel reservation missing required identifiers or dates");
            }

            boolean inventoryReserved = hotelInventoryService.reserveRooms(
                hotelId,
                roomTypeId,
                hotelDetails.getRoomType(),
                roomsRequested,
                checkInDate,
                checkOutDate
            );

            if (!inventoryReserved) {
                throw new RuntimeException("Hotel room inventory not available for reservation");
            }

            // Create detailed hotel reservation data for saga event
            HotelReservationData hotelData = HotelReservationData.builder()
                .hotelId(hotelDetails.getHotelId())
                .roomTypeId(hotelDetails.getRoomTypeId())
                .roomId(hotelDetails.getRoomId())
                .reservationId("HTL-" + bookingId.toString().substring(0, 8))
                .checkInDate(hotelDetails.getCheckInDate().format(DateTimeFormatter.ISO_LOCAL_DATE))
                .checkOutDate(hotelDetails.getCheckOutDate().format(DateTimeFormatter.ISO_LOCAL_DATE))
                .guests(hotelDetails.getNumberOfGuests())
                .rooms(hotelDetails.getNumberOfRooms())
                .amount(BigDecimal.valueOf(hotelDetails.getTotalRoomPrice()))
                .build();

            // Create comprehensive event payload
            Map<String, Object> eventPayload = new HashMap<>();
            eventPayload.put("eventType", "HotelReserved");
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
            failurePayload.put("eventType", "HotelReservationFailed");
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
        eventPublisher.publishEvent("HotelReservationCancelled", "Booking", bookingId.toString(),
                Map.of("eventType", "HotelReservationCancelled", "bookingId", bookingId));
    }

    @Transactional
    public void cancelHotelReservation(UUID bookingId, String sagaId, HotelBookingDetailsDto hotelDetails) {
        log.info("Canceling hotel reservation for booking: {} with detailed product information", bookingId);

        try {
            // Release hotel room inventory
            Long hotelId = parseLongSafely(hotelDetails.getHotelId(), "hotelId");
            Long roomTypeId = parseLongSafely(hotelDetails.getRoomTypeId(), "roomTypeId");
            Integer roomsRequested = hotelDetails.getNumberOfRooms() != null ? hotelDetails.getNumberOfRooms() : 1;

            if (hotelId != null) {
                hotelInventoryService.releaseRooms(
                    hotelId,
                    roomTypeId,
                    hotelDetails.getRoomType(),
                    roomsRequested,
                    hotelDetails.getCheckInDate(),
                    hotelDetails.getCheckOutDate()
                );
            }

            // Create detailed cancellation event payload
            Map<String, Object> eventPayload = new HashMap<>();
            eventPayload.put("eventType", "HotelReservationCancelled");
            eventPayload.put("bookingId", bookingId);
            eventPayload.put("sagaId", sagaId);
            eventPayload.put("hotelId", hotelDetails.getHotelId());
            eventPayload.put("roomTypeId", hotelDetails.getRoomTypeId());
            eventPayload.put("roomId", hotelDetails.getRoomId());
            eventPayload.put("guests", hotelDetails.getNumberOfGuests());
            eventPayload.put("rooms", hotelDetails.getNumberOfRooms());

            // Publish detailed cancellation event
            eventPublisher.publishEvent("HotelReservationCancelled", "Booking", bookingId.toString(), eventPayload);

            log.info("Hotel reservation cancelled successfully for booking: {}", bookingId);

        } catch (Exception e) {
            log.error("Failed to cancel hotel reservation for booking: {}", bookingId, e);
            throw e;
        }
    }

    private Long parseLongSafely(String value, String fieldName) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException ex) {
            log.warn("Invalid numeric value for {}: {}", fieldName, value);
            return null;
        }
    }
}
