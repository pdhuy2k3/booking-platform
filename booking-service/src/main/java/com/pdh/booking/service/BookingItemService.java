package com.pdh.booking.service;

import com.pdh.booking.model.Booking;
import com.pdh.booking.model.BookingItem;
import com.pdh.booking.model.enums.ServiceType;
import com.pdh.booking.repository.BookingItemRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingItemService {
    
    private final BookingItemRepository bookingItemRepository;
    private final ObjectMapper objectMapper;
    
    /**
     * Create booking items from product details
     */
    @Transactional
    public List<BookingItem> createBookingItems(Booking booking) {
        List<BookingItem> items = new ArrayList<>();
        
        try {
            JsonNode productDetails = objectMapper.readTree(booking.getProductDetailsJson());
            
            switch (booking.getBookingType()) {
                case FLIGHT:
                    items.add(createFlightBookingItem(booking, productDetails));
                    break;
                case HOTEL:
                    items.add(createHotelBookingItem(booking, productDetails));
                    break;
                case COMBO:
                    items.add(createFlightBookingItem(booking, productDetails.get("flightDetails")));
                    items.add(createHotelBookingItem(booking, productDetails.get("hotelDetails")));
                    break;
            }
            
            // Save all items
            items = bookingItemRepository.saveAll(items);
            
            log.info("Created {} booking items for booking: {}", items.size(), booking.getBookingId());
            
        } catch (Exception e) {
            log.error("Error creating booking items for booking: {}", booking.getBookingId(), e);
        }
        
        return items;
    }
    
    /**
     * Create a flight booking item
     */
    private BookingItem createFlightBookingItem(Booking booking, JsonNode flightDetails) {
        BookingItem item = new BookingItem();
        item.setBookingId(booking.getBookingId());
        item.setServiceType(ServiceType.FLIGHT);
        item.setPrice(new BigDecimal(flightDetails.get("totalFlightPrice").asText()));
        item.setDetails(flightDetails.toString());
        
        return item;
    }
    
    /**
     * Create a hotel booking item
     */
    private BookingItem createHotelBookingItem(Booking booking, JsonNode hotelDetails) {
        BookingItem item = new BookingItem();
        item.setBookingId(booking.getBookingId());
        item.setServiceType(ServiceType.HOTEL);
        item.setPrice(new BigDecimal(hotelDetails.get("totalPrice").asText()));
        item.setDetails(hotelDetails.toString());
        
        return item;
    }
    
    /**
     * Get booking items for a booking
     */
    @Transactional(readOnly = true)
    public List<BookingItem> getBookingItems(UUID bookingId) {
        return bookingItemRepository.findByBookingId(bookingId);
    }
}