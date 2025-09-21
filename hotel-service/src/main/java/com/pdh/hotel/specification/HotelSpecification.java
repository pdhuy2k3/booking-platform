package com.pdh.hotel.specification;

import com.pdh.hotel.model.Hotel;
import jakarta.persistence.criteria.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA Specifications for Hotel entity with destination search capabilities
 * Supports searching by city, country, address, and other hotel criteria
 */
public class HotelSpecification {

    /**
     * Search hotels by city
     */
    public static Specification<Hotel> hasCity(String city) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(city)) {
                return criteriaBuilder.conjunction();
            }
            
            String searchTerm = "%" + city.toLowerCase() + "%";
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("city")), searchTerm);
        };
    }

    /**
     * Search hotels by country
     */
    public static Specification<Hotel> hasCountry(String country) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(country)) {
                return criteriaBuilder.conjunction();
            }
            
            String searchTerm = "%" + country.toLowerCase() + "%";
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("country")), searchTerm);
        };
    }

    /**
     * Search hotels by address
     */
    public static Specification<Hotel> hasAddress(String address) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(address)) {
                return criteriaBuilder.conjunction();
            }
            
            String searchTerm = "%" + address.toLowerCase() + "%";
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("address")), searchTerm);
        };
    }

    /**
     * Flexible destination search - searches city, country, and address
     */
    public static Specification<Hotel> hasDestinationSearch(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(searchTerm)) {
                return criteriaBuilder.conjunction();
            }
            
            String searchPattern = "%" + searchTerm.toLowerCase() + "%";
            
            return criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("city")), searchPattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("country")), searchPattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("address")), searchPattern)
            );
        };
    }

    /**
     * Search hotels by name
     */
    public static Specification<Hotel> hasName(String name) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(name)) {
                return criteriaBuilder.conjunction();
            }
            
            String searchTerm = "%" + name.toLowerCase() + "%";
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchTerm);
        };
    }

    /**
     * Search hotels by star rating range
     */
    public static Specification<Hotel> hasStarRatingRange(BigDecimal minRating, BigDecimal maxRating) {
        return (root, query, criteriaBuilder) -> {
            if (minRating == null && maxRating == null) {
                return criteriaBuilder.conjunction();
            }
            
            List<Predicate> predicates = new ArrayList<>();
            
            if (minRating != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("starRating"), minRating));
            }
            
            if (maxRating != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("starRating"), maxRating));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Search hotels by minimum star rating
     */
    public static Specification<Hotel> hasMinimumStarRating(BigDecimal minRating) {
        return (root, query, criteriaBuilder) -> {
            if (minRating == null) {
                return criteriaBuilder.conjunction();
            }
            
            return criteriaBuilder.greaterThanOrEqualTo(root.get("starRating"), minRating);
        };
    }

    /**
     * Search hotels by exact star rating
     */
    public static Specification<Hotel> hasStarRating(BigDecimal rating) {
        return (root, query, criteriaBuilder) -> {
            if (rating == null) {
                return criteriaBuilder.conjunction();
            }
            
            return criteriaBuilder.equal(root.get("starRating"), rating);
        };
    }

    /**
     * Search hotels by description content
     */
    public static Specification<Hotel> hasDescription(String description) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(description)) {
                return criteriaBuilder.conjunction();
            }
            
            String searchTerm = "%" + description.toLowerCase() + "%";
            return criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchTerm);
        };
    }

    /**
     * Filter active hotels only
     */
    public static Specification<Hotel> isActive() {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("isActive"), true);
    }

    /**
     * Search hotels by location coordinates (within radius)
     */
    public static Specification<Hotel> hasLocationWithinRadius(BigDecimal latitude, BigDecimal longitude, BigDecimal radiusKm) {
        return (root, query, criteriaBuilder) -> {
            if (latitude == null || longitude == null || radiusKm == null) {
                return criteriaBuilder.conjunction();
            }
            
            // Using Haversine formula for distance calculation
            // This is a simplified version - for production, consider using PostGIS or similar
            Expression<Double> lat1 = criteriaBuilder.literal(latitude.doubleValue());
            Expression<Double> lon1 = criteriaBuilder.literal(longitude.doubleValue());
            Expression<Double> lat2 = root.get("latitude").as(Double.class);
            Expression<Double> lon2 = root.get("longitude").as(Double.class);
            
            // Simplified distance calculation (not accurate for large distances)
            Expression<Double> distance = criteriaBuilder.function(
                "SQRT",
                Double.class,
                criteriaBuilder.sum(
                    criteriaBuilder.prod(
                        criteriaBuilder.diff(lat2, lat1),
                        criteriaBuilder.diff(lat2, lat1)
                    ),
                    criteriaBuilder.prod(
                        criteriaBuilder.diff(lon2, lon1),
                        criteriaBuilder.diff(lon2, lon1)
                    )
                )
            );
            
            return criteriaBuilder.lessThanOrEqualTo(distance, radiusKm.doubleValue());
        };
    }

    /**
     * Search hotels by latitude range
     */
    public static Specification<Hotel> hasLatitudeRange(BigDecimal minLat, BigDecimal maxLat) {
        return (root, query, criteriaBuilder) -> {
            if (minLat == null && maxLat == null) {
                return criteriaBuilder.conjunction();
            }
            
            List<Predicate> predicates = new ArrayList<>();
            
            if (minLat != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("latitude"), minLat));
            }
            
            if (maxLat != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("latitude"), maxLat));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Search hotels by longitude range
     */
    public static Specification<Hotel> hasLongitudeRange(BigDecimal minLon, BigDecimal maxLon) {
        return (root, query, criteriaBuilder) -> {
            if (minLon == null && maxLon == null) {
                return criteriaBuilder.conjunction();
            }
            
            List<Predicate> predicates = new ArrayList<>();
            
            if (minLon != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("longitude"), minLon));
            }
            
            if (maxLon != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("longitude"), maxLon));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Search hotels by name or description
     */
    public static Specification<Hotel> hasNameOrDescription(String searchTerm) {
        return (root, query, criteriaBuilder) -> {
            if (!StringUtils.hasText(searchTerm)) {
                return criteriaBuilder.conjunction();
            }
            
            String searchPattern = "%" + searchTerm.toLowerCase() + "%";
            
            return criteriaBuilder.or(
                criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchPattern),
                criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchPattern)
            );
        };
    }

    /**
     * Search hotels by city and country combination
     */
    public static Specification<Hotel> hasCityAndCountry(String city, String country) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            if (StringUtils.hasText(city)) {
                String cityPattern = "%" + city.toLowerCase() + "%";
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("city")), cityPattern));
            }
            
            if (StringUtils.hasText(country)) {
                String countryPattern = "%" + country.toLowerCase() + "%";
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(root.get("country")), countryPattern));
            }
            
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    /**
     * Combine multiple specifications with AND logic
     */
    public static Specification<Hotel> combine(Specification<Hotel>... specifications) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            for (Specification<Hotel> spec : specifications) {
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

    /**
     * Combine multiple specifications with OR logic
     */
    public static Specification<Hotel> combineOr(Specification<Hotel>... specifications) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            for (Specification<Hotel> spec : specifications) {
                if (spec != null) {
                    Predicate predicate = spec.toPredicate(root, query, criteriaBuilder);
                    if (predicate != null) {
                        predicates.add(predicate);
                    }
                }
            }
            
            return criteriaBuilder.or(predicates.toArray(new Predicate[0]));
        };
    }
}
