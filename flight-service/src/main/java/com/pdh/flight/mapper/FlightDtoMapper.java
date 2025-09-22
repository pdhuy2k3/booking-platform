package com.pdh.flight.mapper;

import com.pdh.flight.dto.response.FlightSearchResultDto;
import com.pdh.flight.model.Flight;
import com.pdh.flight.model.FlightFare;
import com.pdh.flight.model.FlightSchedule;
import com.pdh.flight.model.enums.FareClass;
import com.pdh.flight.repository.FlightScheduleRepository;
import com.pdh.flight.repository.FlightFareRepository;
import com.pdh.flight.viewmodel.StorefrontFlightVM;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

/**
 * Mapper utility for converting between Flight entities, DTOs, and ViewModels
 * Handles data type conversions and transformations
 */
@Component
public class FlightDtoMapper {

    private final FlightScheduleRepository flightScheduleRepository;
    private final FlightFareRepository flightFareRepository;
    private final NumberFormat currencyFormatter;
    private final DateTimeFormatter timeFormatter;

    public FlightDtoMapper(FlightScheduleRepository flightScheduleRepository,
                           FlightFareRepository flightFareRepository) {
        this.flightScheduleRepository = flightScheduleRepository;
        this.flightFareRepository = flightFareRepository;
        this.currencyFormatter = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        this.timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
    }
    
    /**
     * Convert Flight entity to FlightSearchResultDto
     */
    public FlightSearchResultDto toSearchResultDto(Flight flight) {
        if (flight == null) return null;

        FlightSchedule primarySchedule = resolvePrimarySchedule(flight.getFlightId());
        FlightFare primaryFare = resolveFareForSchedule(primarySchedule);

        String departureTime = primarySchedule != null ? primarySchedule.getDepartureTime().format(timeFormatter) : "08:00";
        String arrivalTime = primarySchedule != null ? primarySchedule.getArrivalTime().format(timeFormatter) : "10:30";
        ZonedDateTime departureDateTime = primarySchedule != null ? primarySchedule.getDepartureTime() : null;
        ZonedDateTime arrivalDateTime = primarySchedule != null ? primarySchedule.getArrivalTime() : null;
        Integer durationMinutes = primarySchedule != null ? calculateDuration(primarySchedule) : flight.getBaseDurationMinutes();

        BigDecimal price = resolvePrice(flight, primaryFare);
        Integer availableSeats = primaryFare != null && primaryFare.getAvailableSeats() != null
                ? primaryFare.getAvailableSeats()
                : 100;
        String seatClass = primaryFare != null && primaryFare.getFareClass() != null
                ? primaryFare.getFareClass().name()
                : "ECONOMY";

        return FlightSearchResultDto.builder()
                .flightId(flight.getFlightId().toString())
                .airline(flight.getAirline() != null ? flight.getAirline().getName() : "Unknown Airline")
                .airlineCode(flight.getAirline() != null ? flight.getAirline().getIataCode() : "")
                .flightNumber(flight.getFlightNumber())
                .origin(flight.getDepartureAirport() != null ? flight.getDepartureAirport().getIataCode() : "")
                .destination(flight.getArrivalAirport() != null ? flight.getArrivalAirport().getIataCode() : "")
                .originName(flight.getDepartureAirport() != null ? flight.getDepartureAirport().getName() : "")
                .destinationName(flight.getArrivalAirport() != null ? flight.getArrivalAirport().getName() : "")
                .originLatitude(flight.getDepartureAirport() != null ? flight.getDepartureAirport().getLatitude() : null)
                .originLongitude(flight.getDepartureAirport() != null ? flight.getDepartureAirport().getLongitude() : null)
                .destinationLatitude(flight.getArrivalAirport() != null ? flight.getArrivalAirport().getLatitude() : null)
                .destinationLongitude(flight.getArrivalAirport() != null ? flight.getArrivalAirport().getLongitude() : null)
                .departureTime(departureTime)
                .arrivalTime(arrivalTime)
                .departureDateTime(departureDateTime)
                .arrivalDateTime(arrivalDateTime)
                .duration(formatDuration(durationMinutes))
                .durationMinutes(durationMinutes)
                .price(price.doubleValue())
                .currency("VND")
                .formattedPrice(formatCurrency(price, "VND"))
                .seatClass(seatClass)
                .availableSeats(availableSeats)
//                .aircraft(flight.getAircraft() != null ? flight.getAircraft().getModel() : "Unknown")
                .stops(0)
                .amenities(generateMockAmenities())
                .wifiAvailable(true)
                .entertainmentAvailable(true)
                .refundable(true)
                .changeable(true)
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
    public StorefrontFlightVM toStorefrontViewModel(Flight flight) {
        if (flight == null) return null;
        
        FlightSchedule primarySchedule = resolvePrimarySchedule(flight.getFlightId());
        FlightFare primaryFare = resolveFareForSchedule(primarySchedule);

        String departureTime = primarySchedule != null ? primarySchedule.getDepartureTime().format(timeFormatter) : "08:00";
        String arrivalTime = primarySchedule != null ? primarySchedule.getArrivalTime().format(timeFormatter) : "10:30";
        Integer durationMinutes = primarySchedule != null ? calculateDuration(primarySchedule) : flight.getBaseDurationMinutes();

        BigDecimal price = resolvePrice(flight, primaryFare);
        Integer availableSeats = primaryFare != null && primaryFare.getAvailableSeats() != null
                ? primaryFare.getAvailableSeats()
                : 100;
        String seatClass = primaryFare != null && primaryFare.getFareClass() != null
                ? primaryFare.getFareClass().name()
                : "ECONOMY";

        StorefrontFlightVM viewModel = StorefrontFlightVM.builder()
                .flightId(flight.getFlightId().toString())
                .flightNumber(flight.getFlightNumber())
                .airline(flight.getAirline() != null ? flight.getAirline().getName() : "Unknown Airline")
                .origin(flight.getDepartureAirport() != null ? flight.getDepartureAirport().getIataCode() : "")
                .destination(flight.getArrivalAirport() != null ? flight.getArrivalAirport().getIataCode() : "")
                .originName(flight.getDepartureAirport() != null ? flight.getDepartureAirport().getName() : "")
                .destinationName(flight.getArrivalAirport() != null ? flight.getArrivalAirport().getName() : "")
                .departureTime(departureTime)
                .arrivalTime(arrivalTime)
                .duration(formatDuration(durationMinutes))
                .price(price.doubleValue())
                .currency("VND")
                .formattedPrice(formatCurrency(price, "VND"))
                .seatClass(seatClass)
                .availableSeats(availableSeats)
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
     * Locate the earliest schedule for a given flight.
     */
    private FlightSchedule resolvePrimarySchedule(Long flightId) {
        if (flightId == null) {
            return null;
        }

        List<FlightSchedule> schedules = flightScheduleRepository.findByFlightId(flightId);
        if (schedules.isEmpty()) {
            return null;
        }

        return schedules.get(0);
    }

    private FlightFare resolveFareForSchedule(FlightSchedule schedule) {
        if (schedule == null) {
            return null;
        }

        FlightFare fare = flightFareRepository.findByScheduleIdAndFareClass(schedule.getScheduleId(), FareClass.ECONOMY);
        if (fare != null) {
            return fare;
        }

        List<FlightFare> fares = flightFareRepository.findByScheduleId(schedule.getScheduleId());
        return fares.stream()
                .min(Comparator.comparing(FlightFare::getPrice))
                .orElse(null);
    }

    private BigDecimal resolvePrice(Flight flight, FlightFare fare) {
        if (fare != null && fare.getPrice() != null) {
            return fare.getPrice();
        }

        if (flight != null && flight.getBasePrice() != null) {
            return flight.getBasePrice();
        }

        return BigDecimal.valueOf(1_500_000);
    }

    /**
     * Calculate schedule duration in minutes when both endpoints are present.
     */
    private Integer calculateDuration(FlightSchedule schedule) {
        if (schedule == null || schedule.getDepartureTime() == null || schedule.getArrivalTime() == null) {
            return null;
        }

        return (int) ChronoUnit.MINUTES.between(schedule.getDepartureTime(), schedule.getArrivalTime());
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
     * Generate mock amenities list
     */
    private List<String> generateMockAmenities() {
        return Arrays.asList("WiFi", "Entertainment", "Meal Service", "Power Outlets");
    }
    
    /**
     * Format currency amount for display
     */
    private String formatCurrency(BigDecimal amount, String currency) {
        if (amount == null) return "";
        
        if ("VND".equals(currency)) {
            return currencyFormatter.format(amount.doubleValue());
        }
        
        return String.format("%.2f %s", amount.doubleValue(), currency);
    }
}



