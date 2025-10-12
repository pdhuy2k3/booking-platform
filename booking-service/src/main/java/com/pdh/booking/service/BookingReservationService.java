package com.pdh.booking.service;

import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.EnumSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingReservationService {

    private final BookingRepository bookingRepository;
    private final BookingService bookingService;

    @Value("${booking.reservation.expiry-check-ms:60000}")
    private long expiryCheckIntervalMs;

    private static final EnumSet<BookingStatus> RESERVATION_STATUSES =
            EnumSet.of(BookingStatus.PENDING, BookingStatus.VALIDATION_PENDING, BookingStatus.PAYMENT_PENDING);

    @Scheduled(fixedDelayString = "${booking.reservation.expiry-check-ms:60000}")
    @Transactional
    public void releaseExpiredReservations() {
        ZonedDateTime now = ZonedDateTime.now();
        List<Booking> expired = bookingRepository.findByStatusInAndReservationExpiresAtBefore(
                List.copyOf(RESERVATION_STATUSES), now);

        if (expired.isEmpty()) {
            return;
        }

        log.info("Expiring {} reservations that exceeded their lock window", expired.size());
        for (Booking booking : expired) {
            bookingService.expireReservation(booking, "Reservation window expired");
        }
    }
}
