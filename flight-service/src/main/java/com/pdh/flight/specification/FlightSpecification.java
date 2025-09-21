package com.pdh.flight.specification;

import com.pdh.flight.model.Flight;
import com.pdh.flight.model.Airport;
import com.pdh.flight.model.FlightSchedule;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA Specifications for Flight entity with destination search capabilities
 * Supports searching by airport city, country, IATA code, and other flight criteria
 */
public class FlightSpecification {

    /**
     * Search flights by origin destination (city, country, or IATA code)
     */
    public static Specification<Flight> hasOriginDestination(String origin) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(origin)) {
                return criteriaBuilder.conjunction();
            }

            Join<Flight, Airport> departureAirport = root.join("departureAirport", JoinType.INNER);
            
            String searchTerm = "%" + origin.toLowerCase() + "%";
            
            return criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(departureAirport.get("city")), searchTerm),
                criteriaBuilder.like(criteriaBuilder.lower(departureAirport.get("country")), searchTerm),
                criteriaBuilder.like(criteriaBuilder.lower(departureAirport.get("iataCode")), searchTerm)
            );
        };
    }

    /**
     * Search flights by destination (city, country, or IATA code)
     */
    public static Specification<Flight> hasDestination(String destination) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(destination)) {
                return criteriaBuilder.conjunction();
            }

            Join<Flight, Airport> arrivalAirport = root.join("arrivalAirport", JoinType.INNER);
            
            String searchTerm = "%" + destination.toLowerCase() + "%";
            
            return criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(arrivalAirport.get("city")), searchTerm),
                criteriaBuilder.like(criteriaBuilder.lower(arrivalAirport.get("country")), searchTerm),
                criteriaBuilder.like(criteriaBuilder.lower(arrivalAirport.get("iataCode")), searchTerm)
            );
        };
    }

    /**
     * Search flights by both origin and destination
     */
    public static Specification<Flight> hasRoute(String origin, String destination) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (StringUtils.hasText(origin)) {
                predicates.add(hasOriginDestination(origin).toPredicate(root, query, criteriaBuilder));
            }
            
            if (StringUtils.hasText(destination)) {
                predicates.add(hasDestination(destination).toPredicate(root, query, criteriaBuilder));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Search flights by departure date range
     * Note: departureTime is in FlightSchedule, so we need to use EXISTS subquery
     */
    public static Specification<Flight> hasDepartureDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return (root, query, criteriaBuilder) -> {
            if (startDate == null && endDate == null) {
                return criteriaBuilder.conjunction();
            }
            
            // Create subquery to check FlightSchedule
            Subquery<Long> subquery = query.subquery(Long.class);
            Root<FlightSchedule> flightScheduleRoot = subquery.from(FlightSchedule.class);
            subquery.select(flightScheduleRoot.get("flightId"));
            
            // Convert LocalDateTime to ZonedDateTime for comparison
            // Use UTC timezone for conversion to match database storage
            ZonedDateTime startZonedDateTime = startDate != null ? 
                startDate.atZone(ZoneId.of("UTC")) : null;
            ZonedDateTime endZonedDateTime = endDate != null ? 
                endDate.atZone(ZoneId.of("UTC")) : null;
            
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(flightScheduleRoot.get("flightId"), root.get("flightId")));
            predicates.add(criteriaBuilder.equal(flightScheduleRoot.get("isDeleted"), false));
            
            if (startZonedDateTime != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(flightScheduleRoot.get("departureTime"), startZonedDateTime));
            }
            
            if (endZonedDateTime != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(flightScheduleRoot.get("departureTime"), endZonedDateTime));
            }
            
            subquery.where(criteriaBuilder.and(predicates.toArray(new Predicate[0])));
            
            return criteriaBuilder.exists(subquery);
        };
    }

    /**
     * Search flights by price range
     */
    public static Specification<Flight> hasPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return (root, query, criteriaBuilder) -> {
            if (minPrice == null && maxPrice == null) {
                return criteriaBuilder.conjunction();
            }
            
            List<Predicate> predicates = new ArrayList<>();
            
            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("basePrice"), minPrice));
            }
            
            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("basePrice"), maxPrice));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Search flights by duration range (in minutes)
     */
    public static Specification<Flight> hasDurationRange(Integer minDuration, Integer maxDuration) {
        return (root, query, criteriaBuilder) -> {
            if (minDuration == null && maxDuration == null) {
                return criteriaBuilder.conjunction();
            }
            
            List<Predicate> predicates = new ArrayList<>();
            
            if (minDuration != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("baseDurationMinutes"), minDuration));
            }
            
            if (maxDuration != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("baseDurationMinutes"), maxDuration));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Search flights by airline
     */
    public static Specification<Flight> hasAirline(String airlineName) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(airlineName)) {
                return criteriaBuilder.conjunction();
            }

            Join<Flight, com.pdh.flight.model.Airline> airline = root.join("airline", JoinType.INNER);
            String searchTerm = "%" + airlineName.toLowerCase() + "%";
            
            return criteriaBuilder.like(criteriaBuilder.lower(airline.get("name")), searchTerm);
        };
    }

    /**
     * Search flights by airline IATA code
     */
    public static Specification<Flight> hasAirlineCode(String airlineCode) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(airlineCode)) {
                return criteriaBuilder.conjunction();
            }

            Join<Flight, com.pdh.flight.model.Airline> airline = root.join("airline", JoinType.INNER);
            String searchTerm = "%" + airlineCode.toLowerCase() + "%";
            
            return criteriaBuilder.like(criteriaBuilder.lower(airline.get("iataCode")), searchTerm);
        };
    }

    /**
     * Filter active flights only
     */
    public static Specification<Flight> isActive() {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("isActive"), true);
    }

    /**
     * Filter flights by status
     */
    public static Specification<Flight> hasStatus(String status) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(status)) {
                return criteriaBuilder.conjunction();
            }
            
            return criteriaBuilder.equal(criteriaBuilder.lower(root.get("status")), status.toLowerCase());
        };
    }

    /**
     * Search flights by flight number
     */
    public static Specification<Flight> hasFlightNumber(String flightNumber) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(flightNumber)) {
                return criteriaBuilder.conjunction();
            }
            
            String searchTerm = "%" + flightNumber.toLowerCase() + "%";
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("flightNumber")), searchTerm);
        };
    }

    /**
     * Search flights by aircraft type
     */
    public static Specification<Flight> hasAircraftType(String aircraftType) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(aircraftType)) {
                return criteriaBuilder.conjunction();
            }
            
            String searchTerm = "%" + aircraftType.toLowerCase() + "%";
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("aircraftType")), searchTerm);
        };
    }

    /**
     * Flexible destination search - searches both origin and destination
     */
    public static Specification<Flight> hasDestinationSearch(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(searchTerm)) {
                return criteriaBuilder.conjunction();
            }

            Join<Flight, Airport> departureAirport = root.join("departureAirport", JoinType.INNER);
            Join<Flight, Airport> arrivalAirport = root.join("arrivalAirport", JoinType.INNER);
            
            String searchPattern = "%" + searchTerm.toLowerCase() + "%";
            
            // Search in both departure and arrival airports
            Predicate departurePredicate = criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(departureAirport.get("city")), searchPattern),
                criteriaBuilder.like(criteriaBuilder.lower(departureAirport.get("country")), searchPattern),
                criteriaBuilder.like(criteriaBuilder.lower(departureAirport.get("iataCode")), searchPattern)
            );
            
            Predicate arrivalPredicate = criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(arrivalAirport.get("city")), searchPattern),
                criteriaBuilder.like(criteriaBuilder.lower(arrivalAirport.get("country")), searchPattern),
                criteriaBuilder.like(criteriaBuilder.lower(arrivalAirport.get("iataCode")), searchPattern)
            );
            
            return criteriaBuilder.or(departurePredicate, arrivalPredicate);
        };
    }

    /**
     * Combine multiple specifications with AND logic
     */
    public static Specification<Flight> combine(Specification<Flight>... specifications) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            for (Specification<Flight> spec : specifications) {
                if (spec != null) {
                    Predicate predicate = spec.toPredicate(root, query, criteriaBuilder);
                    if (predicate != null) {
                        predicates.add(predicate);
                    }
                }
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
