package com.pdh.booking.service;

import com.pdh.booking.model.Booking;
import com.pdh.booking.model.BookingPassenger;
import com.pdh.booking.repository.BookingPassengerRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingPassengerService {
    
    private final BookingPassengerRepository bookingPassengerRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * Create booking passengers from product details
     */
    @Transactional
    public List<BookingPassenger> createBookingPassengers(Booking booking) {
        List<BookingPassenger> passengers = new ArrayList<>();
        
        try {
            JsonNode productDetails = objectMapper.readTree(booking.getProductDetailsJson());
            JsonNode passengersNode = null;
            
            switch (booking.getBookingType()) {
                case FLIGHT:
                    passengersNode = productDetails.get("passengers");
                    break;
                case HOTEL:
                    // Hotels might not have passengers, but could have guests
                    // Check for both "guests" and "passengers" to be more flexible
                    passengersNode = productDetails.get("guests");
                    if (passengersNode == null) {
                        passengersNode = productDetails.get("passengers");
                    }
                    break;
                case COMBO:
                    // For combo, use flight passengers
                    JsonNode flightDetails = productDetails.get("flightDetails");
                    if (flightDetails != null) {
                        passengersNode = flightDetails.get("passengers");
                    }
                    break;
            }
            
            if (passengersNode != null && passengersNode.isArray()) {
                for (int i = 0; i < passengersNode.size(); i++) {
                    JsonNode passengerNode = passengersNode.get(i);
                    BookingPassenger passenger = createBookingPassenger(booking, passengerNode, i);
                    passengers.add(passenger);
                }
                
                // Save all passengers
                passengers = bookingPassengerRepository.saveAll(passengers);
                
                log.info("Created {} booking passengers for booking: {}", passengers.size(), booking.getBookingId());
            }
            
        } catch (Exception e) {
            log.error("Error creating booking passengers for booking: {}", booking.getBookingId(), e);
        }
        
        return passengers;
    }
    
    /**
     * Create a booking passenger from passenger details
     */
    private BookingPassenger createBookingPassenger(Booking booking, JsonNode passengerNode, int index) {
        BookingPassenger passenger = BookingPassenger.builder()
            .booking(booking)
            .passengerType(BookingPassenger.PassengerType.valueOf(
                passengerNode.has("passengerType") ? 
                passengerNode.get("passengerType").asText() : "ADULT"))
            .title(passengerNode.has("title") ? passengerNode.get("title").asText() : null)
            .firstName(passengerNode.has("firstName") ? passengerNode.get("firstName").asText() : null)
            .lastName(passengerNode.has("lastName") ? passengerNode.get("lastName").asText() : null)
            .dateOfBirth(passengerNode.has("dateOfBirth") ? 
                LocalDate.parse(passengerNode.get("dateOfBirth").asText()) : null)
            .nationality(passengerNode.has("nationality") ? 
                passengerNode.get("nationality").asText() : null)
            .passportNumber(passengerNode.has("passportNumber") ? 
                passengerNode.get("passportNumber").asText() : null)
            .passportExpiry(passengerNode.has("passportExpiryDate") ? 
                LocalDate.parse(passengerNode.get("passportExpiryDate").asText()) : 
                (passengerNode.has("passportExpiry") ? 
                LocalDate.parse(passengerNode.get("passportExpiry").asText()) : null))
            .seatPreference(passengerNode.has("seatPreference") ? 
                passengerNode.get("seatPreference").asText() : null)
            .mealPreference(passengerNode.has("mealPreference") ? 
                passengerNode.get("mealPreference").asText() : null)
            .specialAssistance(passengerNode.has("specialAssistance") ? 
                passengerNode.get("specialAssistance").asText() : null)
            .isPrimaryPassenger(index == 0)
            .displayOrder(index)
            .build();
        
        return passenger;
    }
    
    /**
     * Get booking passengers for a booking
     */
    @Transactional(readOnly = true)
    public List<BookingPassenger> getBookingPassengers(UUID bookingId) {
        return bookingPassengerRepository.findByBooking_BookingIdOrderByDisplayOrder(bookingId);
    }
}