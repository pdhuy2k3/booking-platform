package com.pdh.flight.util;

import com.pdh.flight.dto.response.FlightSearchResultDto;
import com.pdh.flight.model.Flight;
import com.pdh.flight.model.FlightFare;
import com.pdh.flight.model.FlightSchedule;
import com.pdh.flight.model.enums.FareClass;
import com.pdh.flight.repository.FlightFareRepository;
import com.pdh.flight.repository.FlightScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Assembles response payloads for flight endpoints to keep controller logic lean.
 */
@Component
@RequiredArgsConstructor
public class FlightResponseAssembler {

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");
    private static final BigDecimal DEFAULT_BASE_PRICE = BigDecimal.valueOf(2_500_000L);

    private final FlightScheduleRepository flightScheduleRepository;
    private final FlightFareRepository flightFareRepository;

    /**
     * Convert a search result DTO into a response map expected by the storefront clients.
     */
    public Map<String, Object> toSearchResultMap(FlightSearchResultDto result) {
        Map<String, Object> response = new HashMap<>();
        response.put("flightId", result.getFlightId());
        response.put("airline", result.getAirline());
        response.put("flightNumber", result.getFlightNumber());
        response.put("origin", result.getOrigin());
        response.put("destination", result.getDestination());
        response.put("departureTime", result.getDepartureTime());
        response.put("arrivalTime", result.getArrivalTime());
        response.put("duration", result.getDuration());
        response.put("originLatitude", result.getOriginLatitude());
        response.put("originLongitude", result.getOriginLongitude());
        response.put("destinationLatitude", result.getDestinationLatitude());
        response.put("destinationLongitude", result.getDestinationLongitude());
        response.put("price", result.getPrice());
        response.put("currency", result.getCurrency());
        response.put("formattedPrice", result.getFormattedPrice());
        response.put("seatClass", result.getSeatClass());
        response.put("availableSeats", result.getAvailableSeats());
        response.put("aircraft", result.getAircraft());
        response.put("scheduleId", result.getScheduleId());
        response.put("fareId", result.getFareId());
        response.put("airlineLogo", result.getAirlineLogo()); // Add airline logo URL
        return response;
    }

    /**
     * Convert a flight entity into the storefront detail payload, including primary schedule and fare information.
     */
    public Map<String, Object> toFlightDetailMap(Flight flight) {
        FlightSchedule schedule = resolvePrimarySchedule(flight.getFlightId());
        FlightFare fare = resolvePrimaryFare(schedule);

        Map<String, Object> response = new HashMap<>();
        response.put("flightId", flight.getFlightId());
        response.put("airline", flight.getAirline() != null ? flight.getAirline().getName() : "Unknown Airline");
        response.put("airlineLogo", flight.getAirline() != null ? flight.getAirline().getFeaturedMediaUrl() : null); // Add airline logo URL
        response.put("flightNumber", flight.getFlightNumber());
        response.put("origin", flight.getDepartureAirport() != null ? flight.getDepartureAirport().getIataCode() : "");
        response.put("destination", flight.getArrivalAirport() != null ? flight.getArrivalAirport().getIataCode() : "");
        response.put("originLatitude", flight.getDepartureAirport() != null ? flight.getDepartureAirport().getLatitude() : null);
        response.put("originLongitude", flight.getDepartureAirport() != null ? flight.getDepartureAirport().getLongitude() : null);
        response.put("destinationLatitude", flight.getArrivalAirport() != null ? flight.getArrivalAirport().getLatitude() : null);
        response.put("destinationLongitude", flight.getArrivalAirport() != null ? flight.getArrivalAirport().getLongitude() : null);

        if (schedule != null) {
            response.put("departureTime", schedule.getDepartureTime().format(TIME_FORMATTER));
            response.put("arrivalTime", schedule.getArrivalTime().format(TIME_FORMATTER));
            response.put("departureDateTime", schedule.getDepartureTime().toString());
            response.put("arrivalDateTime", schedule.getArrivalTime().toString());
            response.put("scheduleId", schedule.getScheduleId() != null ? schedule.getScheduleId().toString() : null);

            int durationMinutes = (int) ChronoUnit.MINUTES.between(schedule.getDepartureTime(), schedule.getArrivalTime());
            response.put("duration", formatDuration(durationMinutes));
        } else {
            response.put("departureTime", "08:00");
            response.put("arrivalTime", "10:30");
            response.put("duration", formatDuration(flight.getBaseDurationMinutes()));
        }

        if (fare != null) {
            response.put("price", fare.getPrice());
            response.put("currency", "VND");
            response.put("seatClass", fare.getFareClass() != null ? fare.getFareClass().name() : "ECONOMY");
            response.put("availableSeats", fare.getAvailableSeats());
            response.put("fareId", fare.getFareId() != null ? fare.getFareId().toString() : null);
        } else {
            response.put("price", flight.getBasePrice() != null ? flight.getBasePrice() : DEFAULT_BASE_PRICE);
            response.put("currency", "VND");
            response.put("seatClass", "ECONOMY");
            response.put("availableSeats", 100);
        }

        return response;
    }

    private FlightSchedule resolvePrimarySchedule(Long flightId) {
        List<FlightSchedule> schedules = flightScheduleRepository.findByFlightId(flightId);
        if (schedules.isEmpty()) {
            return null;
        }
        return schedules.get(0);
    }

    private FlightFare resolvePrimaryFare(FlightSchedule schedule) {
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

    private String formatDuration(Integer durationMinutes) {
        if (durationMinutes == null) {
            return "2h 30m";
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
}
