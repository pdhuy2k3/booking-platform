package com.pdh.booking.command.handler;

import com.pdh.booking.command.CreateBookingCommand;
import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingStatus;
import com.pdh.booking.service.BookingItemService;
import com.pdh.booking.service.BookingPassengerService;
import com.pdh.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Command handler for creating bookings
 * Persists the booking and creates related records
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CreateBookingCommandHandler {
    
    private final BookingService bookingService;
    private final BookingItemService bookingItemService;
    private final BookingPassengerService bookingPassengerService;
    
    @Transactional
    public Booking handle(CreateBookingCommand command) {
        log.info("Processing CreateBookingCommand for user: {}, type: {}", 
                command.getUserId(), command.getBookingType());
        
        try {
            // Create booking entity
            Booking booking = new Booking();
            booking.setUserId(command.getUserId());
            booking.setBookingType(command.getBookingType());
            booking.setTotalAmount(command.getTotalAmount());
            booking.setCurrency(command.getCurrency());
            booking.setStatus(BookingStatus.PENDING);
            booking.setProductDetailsJson(command.getProductDetailsJson());
            booking.setNotes(command.getNotes());
            booking.setBookingSource(command.getBookingSource());
            booking.setSagaId(command.getSagaId() != null ? command.getSagaId() : UUID.randomUUID().toString());
            
            // Generate booking reference
            booking.setBookingReference(generateBookingReference());
            
            // Persist booking record before creating related entities
            Booking createdBooking = bookingService.createBooking(booking);
            
            // Create booking items and passengers after booking is saved
            bookingItemService.createBookingItems(createdBooking);
            bookingPassengerService.createBookingPassengers(createdBooking);
            
            log.info("Booking created successfully: {}", createdBooking.getBookingReference());
            return createdBooking;
            
        } catch (Exception e) {
            log.error("Error processing CreateBookingCommand: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create booking: " + e.getMessage(), e);
        }
    }
    
    private String generateBookingReference() {
        return "BK" + System.currentTimeMillis();
    }
}
