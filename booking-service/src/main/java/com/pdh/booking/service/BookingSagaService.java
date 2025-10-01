package com.pdh.booking.service;

import com.pdh.booking.model.Booking;
import com.pdh.booking.saga.BookingSagaOrchestrator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingSagaService {

    private final BookingService bookingService;
    private final BookingSagaOrchestrator bookingSagaOrchestrator;

    @Transactional
    public Booking createBookingAndStartSaga(Booking booking) {
        Booking savedBooking = bookingService.createBooking(booking);
        bookingSagaOrchestrator.startSaga(savedBooking.getBookingId());
        return savedBooking;
    }
}
