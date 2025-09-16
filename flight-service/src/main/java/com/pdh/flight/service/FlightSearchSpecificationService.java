package com.pdh.flight.service;

import com.pdh.flight.model.Flight;
import com.pdh.flight.repository.FlightRepository;
import com.pdh.flight.specification.FlightSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for flight search using JPA Specifications
 * Provides flexible and performant search capabilities
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class FlightSearchSpecificationService {

    private final FlightRepository flightRepository;

    /**
     * Search flights with flexible criteria using JPA Specifications
     */
    public Page<Flight> searchFlights(FlightSearchCriteria criteria, Pageable pageable) {
        log.info("Searching flights with criteria: {}", criteria);
        
        Specification<Flight> spec = buildSpecification(criteria);
        
        Page<Flight> results = flightRepository.findAll(spec, pageable);
        
        log.info("Found {} flights out of {} total", results.getNumberOfElements(), results.getTotalElements());
        
        return results;
    }

    /**
     * Search flights by destination (origin and/or destination)
     */
    public Page<Flight> searchFlightsByDestination(String origin, String destination, Pageable pageable) {
        log.info("Searching flights from '{}' to '{}'", origin, destination);
        
        Specification<Flight> spec = FlightSpecification.combine(
            FlightSpecification.isActive(),
            FlightSpecification.hasRoute(origin, destination)
        );
        
        return flightRepository.findAll(spec, pageable);
    }

    /**
     * Search flights by flexible destination search (searches both origin and destination)
     */
    public Page<Flight> searchFlightsByDestinationSearch(String searchTerm, Pageable pageable) {
        log.info("Searching flights with destination search term: '{}'", searchTerm);
        
        Specification<Flight> spec = FlightSpecification.combine(
            FlightSpecification.isActive(),
            FlightSpecification.hasDestinationSearch(searchTerm)
        );
        
        return flightRepository.findAll(spec, pageable);
    }

    /**
     * Search flights by airline
     */
    public Page<Flight> searchFlightsByAirline(String airlineName, String airlineCode, Pageable pageable) {
        log.info("Searching flights by airline: name='{}', code='{}'", airlineName, airlineCode);
        
        Specification<Flight> spec = FlightSpecification.combine(
            FlightSpecification.isActive(),
            StringUtils.hasText(airlineName) ? FlightSpecification.hasAirline(airlineName) : null,
            StringUtils.hasText(airlineCode) ? FlightSpecification.hasAirlineCode(airlineCode) : null
        );
        
        return flightRepository.findAll(spec, pageable);
    }

    /**
     * Search flights by price range
     */
    public Page<Flight> searchFlightsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice, Pageable pageable) {
        log.info("Searching flights by price range: {} - {}", minPrice, maxPrice);
        
        Specification<Flight> spec = FlightSpecification.combine(
            FlightSpecification.isActive(),
            FlightSpecification.hasPriceRange(minPrice, maxPrice)
        );
        
        return flightRepository.findAll(spec, pageable);
    }

    /**
     * Search flights by duration range
     */
    public Page<Flight> searchFlightsByDurationRange(Integer minDuration, Integer maxDuration, Pageable pageable) {
        log.info("Searching flights by duration range: {} - {} minutes", minDuration, maxDuration);
        
        Specification<Flight> spec = FlightSpecification.combine(
            FlightSpecification.isActive(),
            FlightSpecification.hasDurationRange(minDuration, maxDuration)
        );
        
        return flightRepository.findAll(spec, pageable);
    }

    /**
     * Search flights by departure date range
     */
    public Page<Flight> searchFlightsByDepartureDateRange(LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        log.info("Searching flights by departure date range: {} - {}", startDate, endDate);
        
        Specification<Flight> spec = FlightSpecification.combine(
            FlightSpecification.isActive(),
            FlightSpecification.hasDepartureDateRange(startDate, endDate)
        );
        
        return flightRepository.findAll(spec, pageable);
    }

    /**
     * Search flights by flight number
     */
    public Page<Flight> searchFlightsByFlightNumber(String flightNumber, Pageable pageable) {
        log.info("Searching flights by flight number: '{}'", flightNumber);
        
        Specification<Flight> spec = FlightSpecification.combine(
            FlightSpecification.isActive(),
            FlightSpecification.hasFlightNumber(flightNumber)
        );
        
        return flightRepository.findAll(spec, pageable);
    }

    /**
     * Search flights by aircraft type
     */
    public Page<Flight> searchFlightsByAircraftType(String aircraftType, Pageable pageable) {
        log.info("Searching flights by aircraft type: '{}'", aircraftType);
        
        Specification<Flight> spec = FlightSpecification.combine(
            FlightSpecification.isActive(),
            FlightSpecification.hasAircraftType(aircraftType)
        );
        
        return flightRepository.findAll(spec, pageable);
    }

    /**
     * Search flights by status
     */
    public Page<Flight> searchFlightsByStatus(String status, Pageable pageable) {
        log.info("Searching flights by status: '{}'", status);
        
        Specification<Flight> spec = FlightSpecification.combine(
            FlightSpecification.isActive(),
            FlightSpecification.hasStatus(status)
        );
        
        return flightRepository.findAll(spec, pageable);
    }

    /**
     * Get search statistics
     */
    public Map<String, Object> getSearchStatistics(FlightSearchCriteria criteria) {
        log.info("Getting search statistics for criteria: {}", criteria);
        
        Specification<Flight> spec = buildSpecification(criteria);
        
        long totalFlights = flightRepository.count(spec);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalFlights", totalFlights);
        stats.put("searchCriteria", criteria);
        
        return stats;
    }

    /**
     * Build JPA Specification from search criteria
     */
    private Specification<Flight> buildSpecification(FlightSearchCriteria criteria) {
        if (criteria == null) {
            return FlightSpecification.isActive();
        }
        
        return FlightSpecification.combine(
            FlightSpecification.isActive(),
            StringUtils.hasText(criteria.getOrigin()) ? FlightSpecification.hasOriginDestination(criteria.getOrigin()) : null,
            StringUtils.hasText(criteria.getDestination()) ? FlightSpecification.hasDestination(criteria.getDestination()) : null,
            StringUtils.hasText(criteria.getAirlineName()) ? FlightSpecification.hasAirline(criteria.getAirlineName()) : null,
            StringUtils.hasText(criteria.getAirlineCode()) ? FlightSpecification.hasAirlineCode(criteria.getAirlineCode()) : null,
            StringUtils.hasText(criteria.getFlightNumber()) ? FlightSpecification.hasFlightNumber(criteria.getFlightNumber()) : null,
            StringUtils.hasText(criteria.getAircraftType()) ? FlightSpecification.hasAircraftType(criteria.getAircraftType()) : null,
            StringUtils.hasText(criteria.getStatus()) ? FlightSpecification.hasStatus(criteria.getStatus()) : null,
            criteria.getMinPrice() != null || criteria.getMaxPrice() != null ? 
                FlightSpecification.hasPriceRange(criteria.getMinPrice(), criteria.getMaxPrice()) : null,
            criteria.getMinDuration() != null || criteria.getMaxDuration() != null ? 
                FlightSpecification.hasDurationRange(criteria.getMinDuration(), criteria.getMaxDuration()) : null,
            criteria.getStartDate() != null || criteria.getEndDate() != null ? 
                FlightSpecification.hasDepartureDateRange(criteria.getStartDate(), criteria.getEndDate()) : null
        );
    }

    /**
     * Flight search criteria DTO
     */
    public static class FlightSearchCriteria {
        private String origin;
        private String destination;
        private String airlineName;
        private String airlineCode;
        private String flightNumber;
        private String aircraftType;
        private String status;
        private BigDecimal minPrice;
        private BigDecimal maxPrice;
        private Integer minDuration;
        private Integer maxDuration;
        private LocalDateTime startDate;
        private LocalDateTime endDate;

        // Constructors
        public FlightSearchCriteria() {}

        public FlightSearchCriteria(String origin, String destination) {
            this.origin = origin;
            this.destination = destination;
        }

        // Getters and Setters
        public String getOrigin() { return origin; }
        public void setOrigin(String origin) { this.origin = origin; }

        public String getDestination() { return destination; }
        public void setDestination(String destination) { this.destination = destination; }

        public String getAirlineName() { return airlineName; }
        public void setAirlineName(String airlineName) { this.airlineName = airlineName; }

        public String getAirlineCode() { return airlineCode; }
        public void setAirlineCode(String airlineCode) { this.airlineCode = airlineCode; }

        public String getFlightNumber() { return flightNumber; }
        public void setFlightNumber(String flightNumber) { this.flightNumber = flightNumber; }

        public String getAircraftType() { return aircraftType; }
        public void setAircraftType(String aircraftType) { this.aircraftType = aircraftType; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public BigDecimal getMinPrice() { return minPrice; }
        public void setMinPrice(BigDecimal minPrice) { this.minPrice = minPrice; }

        public BigDecimal getMaxPrice() { return maxPrice; }
        public void setMaxPrice(BigDecimal maxPrice) { this.maxPrice = maxPrice; }

        public Integer getMinDuration() { return minDuration; }
        public void setMinDuration(Integer minDuration) { this.minDuration = minDuration; }

        public Integer getMaxDuration() { return maxDuration; }
        public void setMaxDuration(Integer maxDuration) { this.maxDuration = maxDuration; }

        public LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

        public LocalDateTime getEndDate() { return endDate; }
        public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

        @Override
        public String toString() {
            return "FlightSearchCriteria{" +
                    "origin='" + origin + '\'' +
                    ", destination='" + destination + '\'' +
                    ", airlineName='" + airlineName + '\'' +
                    ", airlineCode='" + airlineCode + '\'' +
                    ", flightNumber='" + flightNumber + '\'' +
                    ", aircraftType='" + aircraftType + '\'' +
                    ", status='" + status + '\'' +
                    ", minPrice=" + minPrice +
                    ", maxPrice=" + maxPrice +
                    ", minDuration=" + minDuration +
                    ", maxDuration=" + maxDuration +
                    ", startDate=" + startDate +
                    ", endDate=" + endDate +
                    '}';
        }
    }
}
