package com.pdh.flight.mapper;

import com.pdh.flight.dto.response.FlightSearchResultDto;
import com.pdh.flight.model.Flight;
import com.pdh.flight.viewmodel.StorefrontFlightViewModel;
import org.springframework.stereotype.Component;

import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

/**
 * Mapper utility for converting between Flight entities, DTOs, and ViewModels
 * Handles data type conversions and transformations
 */
@Component
public class FlightDtoMapper {
    
    private final NumberFormat currencyFormatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
    
    /**
     * Convert Flight entity to FlightSearchResultDto
     */
    public FlightSearchResultDto toSearchResultDto(Flight flight) {
        if (flight == null) return null;
        
        return FlightSearchResultDto.builder()
                .flightId(flight.getFlightId().toString())
                .airline(flight.getAirline() != null ? flight.getAirline().getName() : "Unknown Airline")
                .airlineCode(flight.getAirline() != null ? flight.getAirline().getIataCode() : "")
                .flightNumber(flight.getFlightNumber())
                .origin(flight.getDepartureAirport() != null ? flight.getDepartureAirport().getIataCode() : "")
                .destination(flight.getArrivalAirport() != null ? flight.getArrivalAirport().getIataCode() : "")
                .originName(flight.getDepartureAirport() != null ? flight.getDepartureAirport().getName() : "")
                .destinationName(flight.getArrivalAirport() != null ? flight.getArrivalAirport().getName() : "")
                .departureTime("08:00") // Mock time - in production, get from schedule
                .arrivalTime("10:30")   // Mock time - in production, calculate from departure + duration
                .duration(formatDuration(flight.getBaseDurationMinutes()))
                .durationMinutes(flight.getBaseDurationMinutes())
                .price(generateMockPrice()) // Mock price - in production, get from pricing service
                .currency("VND")
                .formattedPrice(formatCurrency(generateMockPrice(), "VND"))
                .seatClass("ECONOMY") // Mock - in production, this would be a parameter
                .availableSeats(generateMockAvailableSeats()) // Mock - in production, get from inventory
//                .aircraft(flight.getAircraft() != null ? flight.getAircraft().getModel() : "Unknown")
                .stops(0) // Mock - assume direct flights for now
                .amenities(generateMockAmenities())
                .wifiAvailable(true) // Mock
                .entertainmentAvailable(true) // Mock
                .refundable(true) // Mock
                .changeable(true) // Mock
                .baggage(FlightSearchResultDto.BaggageInfo.builder()
                        .cabinBaggage("7kg")
                        .checkedBaggage("20kg")
                        .additionalBaggageAvailable(true)
                        .additionalBaggagePrice(500000.0)
                        .build())
                .build();
    }
    
    /**
     * Convert Flight entity to StorefrontFlightViewModel
     */
    public StorefrontFlightViewModel toStorefrontViewModel(Flight flight) {
        if (flight == null) return null;
        
        StorefrontFlightViewModel viewModel = StorefrontFlightViewModel.builder()
                .flightId(flight.getFlightId().toString())
                .flightNumber(flight.getFlightNumber())
                .airline(flight.getAirline() != null ? flight.getAirline().getName() : "Unknown Airline")
                .origin(flight.getDepartureAirport() != null ? flight.getDepartureAirport().getIataCode() : "")
                .destination(flight.getArrivalAirport() != null ? flight.getArrivalAirport().getIataCode() : "")
                .originName(flight.getDepartureAirport() != null ? flight.getDepartureAirport().getName() : "")
                .destinationName(flight.getArrivalAirport() != null ? flight.getArrivalAirport().getName() : "")
                .departureTime("08:00") // Mock
                .arrivalTime("10:30")   // Mock
                .duration(formatDuration(flight.getBaseDurationMinutes()))
                .price(generateMockPrice())
                .currency("VND")
                .formattedPrice(formatCurrency(generateMockPrice(), "VND"))
                .seatClass("ECONOMY")
                .availableSeats(generateMockAvailableSeats())
                .amenities(generateMockAmenities())
                .wifiAvailable(true)
                .mealIncluded(true)
                .refundable(true)
                .changeable(true)
                .fareType("Economy")
                .bookingClass("Y")
                .baggageInfo("7kg cabin + 20kg checked")
                .build();
        
        // Set computed fields
        viewModel.setRouteDescription(viewModel.getOrigin() + " → " + viewModel.getDestination());
        viewModel.setScheduleDescription(viewModel.getDepartureTime() + " - " + viewModel.getArrivalTime() + " (" + viewModel.getDuration() + ")");
        viewModel.setPriceDescription("From " + viewModel.getFormattedPrice());
        viewModel.setAvailabilityStatus(viewModel.calculateAvailabilityStatus());
        viewModel.setAvailabilityColor(viewModel.calculateAvailabilityColor());
        viewModel.setQualityScore(viewModel.calculateQualityScore());
        viewModel.setDepartureCategory(viewModel.calculateDepartureCategory());
        viewModel.setDurationCategory(viewModel.calculateDurationCategory());
        
        // Set highlights based on features
        viewModel.setHighlights(Arrays.asList(
                "Free WiFi",
                "In-flight entertainment",
                "Complimentary meal",
                "Free cancellation"
        ));
        
        return viewModel;
    }
    
    /**
     * Format duration from minutes to readable string
     */
    private String formatDuration(Integer durationMinutes) {
        if (durationMinutes == null) {
            return "2h 30m"; // Default duration
        }

        int hours = durationMinutes / 60;
        int minutes = durationMinutes % 60;

        if (hours > 0 && minutes > 0) {
            return String.format("%dh %dm", hours, minutes);
        } else if (hours > 0) {
            return String.format("%dh", hours);
        } else {
            return String.format("%dm", minutes);
        }
    }
    
    /**
     * Generate mock price (in production, this would come from pricing service)
     */
    private Double generateMockPrice() {
        // Generate random price between 1.5M and 5M VND
        return 1500000.0 + (Math.random() * 3500000.0);
    }
    
    /**
     * Generate mock available seats (in production, this would come from inventory)
     */
    private Integer generateMockAvailableSeats() {
        return (int) (Math.random() * 100) + 1;
    }
    
    /**
     * Generate mock amenities list
     */
    private List<String> generateMockAmenities() {
        return Arrays.asList("WiFi", "Entertainment", "Meal Service", "Power Outlets");
    }
    
    /**
     * Format currency amount for display
     */
    private String formatCurrency(Double amount, String currency) {
        if (amount == null) return "";
        
        if ("VND".equals(currency)) {
            return currencyFormatter.format(amount);
        }
        
        return String.format("%.2f %s", amount, currency);
    }
}
