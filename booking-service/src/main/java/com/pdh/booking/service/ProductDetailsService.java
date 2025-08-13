package com.pdh.booking.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pdh.booking.model.dto.request.ComboBookingDetailsDto;
import com.pdh.booking.model.dto.request.FlightBookingDetailsDto;
import com.pdh.booking.model.dto.request.HotelBookingDetailsDto;
import com.pdh.booking.model.Booking;
import com.pdh.booking.model.enums.BookingType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Service for handling product details based on booking type
 * Provides type-safe conversion between DTOs and JSON storage
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ProductDetailsService {

    private final ObjectMapper objectMapper;

    /**
     * Convert product details object to JSON string based on booking type
     */
    public String convertToJson(BookingType bookingType, Object productDetails) {
        if (productDetails == null) {
            return null;
        }

        try {
            // Validate and convert based on booking type
            return switch (bookingType) {
                case FLIGHT -> {
                    if (!(productDetails instanceof FlightBookingDetailsDto)) {
                        throw new IllegalArgumentException("Flight booking requires FlightBookingDetailsDto");
                    }
                    yield objectMapper.writeValueAsString(productDetails);
                }
                case HOTEL -> {
                    if (!(productDetails instanceof HotelBookingDetailsDto)) {
                        throw new IllegalArgumentException("Hotel booking requires HotelBookingDetailsDto");
                    }
                    yield objectMapper.writeValueAsString(productDetails);
                }
                case COMBO -> {
                    if (!(productDetails instanceof ComboBookingDetailsDto)) {
                        throw new IllegalArgumentException("Combo booking requires ComboBookingDetailsDto");
                    }
                    yield objectMapper.writeValueAsString(productDetails);
                }
                default -> {
                    log.warn("Unknown booking type: {}, storing as generic JSON", bookingType);
                    yield objectMapper.writeValueAsString(productDetails);
                }
            };
        } catch (JsonProcessingException e) {
            log.error("Error converting product details to JSON for booking type: {}", bookingType, e);
            throw new RuntimeException("Failed to serialize product details", e);
        }
    }

    /**
     * Convert JSON string to typed product details object based on booking type
     */
    public Object convertFromJson(BookingType bookingType, String productDetailsJson) {
        if (productDetailsJson == null || productDetailsJson.trim().isEmpty()) {
            return null;
        }

        try {
            switch (bookingType) {
                case FLIGHT:
                    return objectMapper.readValue(productDetailsJson, FlightBookingDetailsDto.class);
                    
                case HOTEL:
                    return objectMapper.readValue(productDetailsJson, HotelBookingDetailsDto.class);
                    
                case COMBO:
                    return objectMapper.readValue(productDetailsJson, ComboBookingDetailsDto.class);
                    
                default:
                    log.warn("Unknown booking type: {}, returning raw JSON", bookingType);
                    return objectMapper.readTree(productDetailsJson);
            }
        } catch (JsonProcessingException e) {
            log.error("Error parsing product details JSON for booking type: {}", bookingType, e);
            throw new RuntimeException("Failed to deserialize product details", e);
        }
    }

    /**
     * Convert generic Object (from JSON deserialization) to typed DTO based on booking type
     */
    public Object convertToTypedDto(BookingType bookingType, Object productDetails) {
        if (productDetails == null) {
            return null;
        }

        // If already the correct type, return as-is
        switch (bookingType) {
            case FLIGHT:
                if (productDetails instanceof FlightBookingDetailsDto) {
                    return productDetails;
                }
                break;
            case HOTEL:
                if (productDetails instanceof HotelBookingDetailsDto) {
                    return productDetails;
                }
                break;
            case COMBO:
                if (productDetails instanceof ComboBookingDetailsDto) {
                    return productDetails;
                }
                break;
        }

        // Convert from generic Object (LinkedHashMap from JSON) to typed DTO
        try {
            String json = objectMapper.writeValueAsString(productDetails);
            return switch (bookingType) {
                case FLIGHT -> objectMapper.readValue(json, FlightBookingDetailsDto.class);
                case HOTEL -> objectMapper.readValue(json, HotelBookingDetailsDto.class);
                case COMBO -> objectMapper.readValue(json, ComboBookingDetailsDto.class);
                default -> {
                    log.warn("Unknown booking type: {}, returning raw object", bookingType);
                    yield productDetails;
                }
            };
        } catch (JsonProcessingException e) {
            log.error("Error converting object to typed DTO for booking type: {}", bookingType, e);
            throw new RuntimeException("Failed to convert product details to typed DTO", e);
        }
    }

    /**
     * Get flight details from booking (type-safe)
     */
    public FlightBookingDetailsDto getFlightDetails(Booking booking) {
        if (booking.getBookingType() != BookingType.FLIGHT && booking.getBookingType() != BookingType.COMBO) {
            return null;
        }

        Object productDetails = convertFromJson(booking.getBookingType(), booking.getProductDetailsJson());
        
        if (booking.getBookingType() == BookingType.FLIGHT) {
            return (FlightBookingDetailsDto) productDetails;
        } else if (booking.getBookingType() == BookingType.COMBO) {
            ComboBookingDetailsDto combo = (ComboBookingDetailsDto) productDetails;
            return combo != null ? combo.getFlightDetails() : null;
        }
        
        return null;
    }

    /**
     * Get hotel details from booking (type-safe)
     */
    public HotelBookingDetailsDto getHotelDetails(Booking booking) {
        if (booking.getBookingType() != BookingType.HOTEL && booking.getBookingType() != BookingType.COMBO) {
            return null;
        }

        Object productDetails = convertFromJson(booking.getBookingType(), booking.getProductDetailsJson());
        
        if (booking.getBookingType() == BookingType.HOTEL) {
            return (HotelBookingDetailsDto) productDetails;
        } else if (booking.getBookingType() == BookingType.COMBO) {
            ComboBookingDetailsDto combo = (ComboBookingDetailsDto) productDetails;
            return combo != null ? combo.getHotelDetails() : null;
        }
        
        return null;
    }

    /**
     * Validate product details based on booking type
     */
    public void validateProductDetails(BookingType bookingType, Object productDetails) {
        if (productDetails == null) {
            throw new IllegalArgumentException("Product details are required for booking type: " + bookingType);
        }

        switch (bookingType) {
            case FLIGHT:
                if (!(productDetails instanceof FlightBookingDetailsDto)) {
                    throw new IllegalArgumentException("Flight booking requires FlightBookingDetailsDto");
                }
                break;
                
            case HOTEL:
                if (!(productDetails instanceof HotelBookingDetailsDto)) {
                    throw new IllegalArgumentException("Hotel booking requires HotelBookingDetailsDto");
                }
                break;
                
            case COMBO:
                if (!(productDetails instanceof ComboBookingDetailsDto)) {
                    throw new IllegalArgumentException("Combo booking requires ComboBookingDetailsDto");
                }
                ComboBookingDetailsDto combo = (ComboBookingDetailsDto) productDetails;
                if (combo.getFlightDetails() == null || combo.getHotelDetails() == null) {
                    throw new IllegalArgumentException("Combo booking requires both flight and hotel details");
                }
                break;
                
            default:
                log.warn("Unknown booking type for validation: {}", bookingType);
        }
    }
}
