package com.pdh.booking.service;

import com.pdh.booking.dto.internal.FlightDetailsDto;
import com.pdh.booking.dto.internal.HotelDetailsDto;
import com.pdh.booking.dto.request.StorefrontCreateBookingRequestDto;
import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.model.enums.BookingType;
import com.pdh.booking.repository.BookingRepository;
import com.pdh.booking.saga.BookingSagaOrchestrator;
import com.pdh.common.lib.utils.AuthenticationUtils;
import com.pdh.common.saga.SagaState;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RestClient.Builder restClientBuilder;
    private final BookingSagaOrchestrator sagaOrchestrator;

    @Transactional
    public Booking createBooking(StorefrontCreateBookingRequestDto request) {
        RestClient restClient = restClientBuilder.build();

        BigDecimal totalAmount = BigDecimal.ZERO;
        String currency = "";

        // Step 1: Fetch product details and validate price
        if (request.getBookingType() == BookingType.FLIGHT && request.getFlightId() != null) {
            FlightDetailsDto flightDetails = restClient.get()
                    .uri("http://flight-service/api/flights/internal/{flightId}", request.getFlightId())
                    .retrieve()
                    .body(FlightDetailsDto.class);
            if (flightDetails == null) {
                throw new IllegalStateException("Invalid Flight ID");
            }
            totalAmount = flightDetails.price();
            currency = flightDetails.currency();
        } else if (request.getBookingType() == BookingType.HOTEL && request.getHotelId() != null && request.getRoomId() != null) {
            HotelDetailsDto hotelDetails = restClient.get()
                    .uri("http://hotel-service/api/hotels/internal/{hotelId}/rooms/{roomId}", request.getHotelId(), request.getRoomId())
                    .retrieve()
                    .body(HotelDetailsDto.class);
            if (hotelDetails == null) {
                throw new IllegalStateException("Invalid Hotel or Room ID");
            }
            totalAmount = hotelDetails.pricePerNight();
            currency = hotelDetails.currency();
        } else {
            throw new IllegalArgumentException("Invalid booking type or missing IDs");
        }

        // Step 2: Create and save the booking entity
        Booking booking = new Booking();
        booking.setUserId(UUID.fromString(AuthenticationUtils.getUserId()));
        booking.setBookingType(request.getBookingType());
        booking.setTotalAmount(totalAmount);
        booking.setCurrency(currency);
        booking.setStatus(BookingStatus.PENDING);
        // Set other details from the request
        booking.setFlightId(request.getFlightId());
        booking.setHotelId(request.getHotelId());
        booking.setRoomId(request.getRoomId());

        return bookingRepository.save(booking);
    }

    public Booking findById(UUID bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
    }

    @Transactional
    public void completeBooking(UUID bookingId, String confirmationNumber) {
        log.info("Completing booking: {}", bookingId);

        Booking booking = findById(bookingId);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setConfirmationNumber(confirmationNumber);
        booking.setSagaState(SagaState.BOOKING_COMPLETED);

        bookingRepository.save(booking);

        log.info("Booking completed: {} with confirmation: {}", bookingId, confirmationNumber);
    }

    @Transactional
    public void cancelBooking(UUID bookingId, String reason) {
        log.info("Cancelling booking: {} due to: {}", bookingId, reason);

        Booking booking = findById(bookingId);
        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setSagaState(SagaState.BOOKING_CANCELLED);

        bookingRepository.save(booking);

        log.info("Booking cancelled: {}", bookingId);
    }
}