package com.pdh.hotel.service;

import com.pdh.hotel.model.Hotel;
import com.pdh.hotel.repository.HotelRepository;
import com.pdh.hotel.specification.HotelSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

/**
 * Service for hotel search using JPA Specifications
 * Provides flexible and performant search capabilities
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HotelSearchSpecificationService {

    private final HotelRepository hotelRepository;

    /**
     * Search hotels with flexible criteria using JPA Specifications
     */
    public Page<Hotel> searchHotels(HotelSearchCriteria criteria, Pageable pageable) {
        log.info("Searching hotels with criteria: {}", criteria);
        
        Specification<Hotel> spec = buildSpecification(criteria);
        
        Page<Hotel> results = hotelRepository.findAll(spec, pageable);
        
        log.info("Found {} hotels out of {} total", results.getNumberOfElements(), results.getTotalElements());
        
        return results;
    }

    /**
     * Search hotels by destination (city, country, or address)
     */
    public Page<Hotel> searchHotelsByDestination(String destination, Pageable pageable) {
        log.info("Searching hotels by destination: '{}'", destination);
        
        Specification<Hotel> spec = HotelSpecification.combine(
            HotelSpecification.isActive(),
            HotelSpecification.hasDestinationSearch(destination)
        );
        
        return hotelRepository.findAll(spec, pageable);
    }

    /**
     * Search hotels by city
     */
    public Page<Hotel> searchHotelsByCity(String city, Pageable pageable) {
        log.info("Searching hotels by city: '{}'", city);
        
        Specification<Hotel> spec = HotelSpecification.combine(
            HotelSpecification.isActive(),
            HotelSpecification.hasCity(city)
        );
        
        return hotelRepository.findAll(spec, pageable);
    }

    /**
     * Search hotels by country
     */
    public Page<Hotel> searchHotelsByCountry(String country, Pageable pageable) {
        log.info("Searching hotels by country: '{}'", country);
        
        Specification<Hotel> spec = HotelSpecification.combine(
            HotelSpecification.isActive(),
            HotelSpecification.hasCountry(country)
        );
        
        return hotelRepository.findAll(spec, pageable);
    }

    /**
     * Search hotels by address
     */
    public Page<Hotel> searchHotelsByAddress(String address, Pageable pageable) {
        log.info("Searching hotels by address: '{}'", address);
        
        Specification<Hotel> spec = HotelSpecification.combine(
            HotelSpecification.isActive(),
            HotelSpecification.hasAddress(address)
        );
        
        return hotelRepository.findAll(spec, pageable);
    }

    /**
     * Search hotels by name
     */
    public Page<Hotel> searchHotelsByName(String name, Pageable pageable) {
        log.info("Searching hotels by name: '{}'", name);
        
        Specification<Hotel> spec = HotelSpecification.combine(
            HotelSpecification.isActive(),
            HotelSpecification.hasName(name)
        );
        
        return hotelRepository.findAll(spec, pageable);
    }

    /**
     * Search hotels by star rating range
     */
    public Page<Hotel> searchHotelsByStarRatingRange(BigDecimal minRating, BigDecimal maxRating, Pageable pageable) {
        log.info("Searching hotels by star rating range: {} - {}", minRating, maxRating);
        
        Specification<Hotel> spec = HotelSpecification.combine(
            HotelSpecification.isActive(),
            HotelSpecification.hasStarRatingRange(minRating, maxRating)
        );
        
        return hotelRepository.findAll(spec, pageable);
    }

    /**
     * Search hotels by minimum star rating
     */
    public Page<Hotel> searchHotelsByMinimumStarRating(BigDecimal minRating, Pageable pageable) {
        log.info("Searching hotels by minimum star rating: {}", minRating);
        
        Specification<Hotel> spec = HotelSpecification.combine(
            HotelSpecification.isActive(),
            HotelSpecification.hasMinimumStarRating(minRating)
        );
        
        return hotelRepository.findAll(spec, pageable);
    }

    /**
     * Search hotels by exact star rating
     */
    public Page<Hotel> searchHotelsByStarRating(BigDecimal rating, Pageable pageable) {
        log.info("Searching hotels by star rating: {}", rating);
        
        Specification<Hotel> spec = HotelSpecification.combine(
            HotelSpecification.isActive(),
            HotelSpecification.hasStarRating(rating)
        );
        
        return hotelRepository.findAll(spec, pageable);
    }

    /**
     * Search hotels by description content
     */
    public Page<Hotel> searchHotelsByDescription(String description, Pageable pageable) {
        log.info("Searching hotels by description: '{}'", description);
        
        Specification<Hotel> spec = HotelSpecification.combine(
            HotelSpecification.isActive(),
            HotelSpecification.hasDescription(description)
        );
        
        return hotelRepository.findAll(spec, pageable);
    }

    /**
     * Search hotels by name or description
     */
    public Page<Hotel> searchHotelsByNameOrDescription(String searchTerm, Pageable pageable) {
        log.info("Searching hotels by name or description: '{}'", searchTerm);
        
        Specification<Hotel> spec = HotelSpecification.combine(
            HotelSpecification.isActive(),
            HotelSpecification.hasNameOrDescription(searchTerm)
        );
        
        return hotelRepository.findAll(spec, pageable);
    }

    /**
     * Search hotels by city and country combination
     */
    public Page<Hotel> searchHotelsByCityAndCountry(String city, String country, Pageable pageable) {
        log.info("Searching hotels by city: '{}' and country: '{}'", city, country);
        
        Specification<Hotel> spec = HotelSpecification.combine(
            HotelSpecification.isActive(),
            HotelSpecification.hasCityAndCountry(city, country)
        );
        
        return hotelRepository.findAll(spec, pageable);
    }

    /**
     * Search hotels by location coordinates
     */
    public Page<Hotel> searchHotelsByLocation(BigDecimal latitude, BigDecimal longitude, BigDecimal radiusKm, Pageable pageable) {
        log.info("Searching hotels by location: lat={}, lon={}, radius={}km", latitude, longitude, radiusKm);
        
        Specification<Hotel> spec = HotelSpecification.combine(
            HotelSpecification.isActive(),
            HotelSpecification.hasLocationWithinRadius(latitude, longitude, radiusKm)
        );
        
        return hotelRepository.findAll(spec, pageable);
    }

    /**
     * Search hotels by latitude range
     */
    public Page<Hotel> searchHotelsByLatitudeRange(BigDecimal minLat, BigDecimal maxLat, Pageable pageable) {
        log.info("Searching hotels by latitude range: {} - {}", minLat, maxLat);
        
        Specification<Hotel> spec = HotelSpecification.combine(
            HotelSpecification.isActive(),
            HotelSpecification.hasLatitudeRange(minLat, maxLat)
        );
        
        return hotelRepository.findAll(spec, pageable);
    }

    /**
     * Search hotels by longitude range
     */
    public Page<Hotel> searchHotelsByLongitudeRange(BigDecimal minLon, BigDecimal maxLon, Pageable pageable) {
        log.info("Searching hotels by longitude range: {} - {}", minLon, maxLon);
        
        Specification<Hotel> spec = HotelSpecification.combine(
            HotelSpecification.isActive(),
            HotelSpecification.hasLongitudeRange(minLon, maxLon)
        );
        
        return hotelRepository.findAll(spec, pageable);
    }

    /**
     * Get search statistics
     */
    public Map<String, Object> getSearchStatistics(HotelSearchCriteria criteria) {
        log.info("Getting search statistics for criteria: {}", criteria);
        
        Specification<Hotel> spec = buildSpecification(criteria);
        
        long totalHotels = hotelRepository.count(spec);
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalHotels", totalHotels);
        stats.put("searchCriteria", criteria);
        
        return stats;
    }

    /**
     * Build JPA Specification from search criteria
     */
    private Specification<Hotel> buildSpecification(HotelSearchCriteria criteria) {
        if (criteria == null) {
            return HotelSpecification.isActive();
        }
        
        return HotelSpecification.combine(
            HotelSpecification.isActive(),
            StringUtils.hasText(criteria.getDestination()) ? HotelSpecification.hasDestinationSearch(criteria.getDestination()) : null,
            StringUtils.hasText(criteria.getCity()) ? HotelSpecification.hasCity(criteria.getCity()) : null,
            StringUtils.hasText(criteria.getCountry()) ? HotelSpecification.hasCountry(criteria.getCountry()) : null,
            StringUtils.hasText(criteria.getAddress()) ? HotelSpecification.hasAddress(criteria.getAddress()) : null,
            StringUtils.hasText(criteria.getName()) ? HotelSpecification.hasName(criteria.getName()) : null,
            StringUtils.hasText(criteria.getDescription()) ? HotelSpecification.hasDescription(criteria.getDescription()) : null,
            criteria.getMinRating() != null || criteria.getMaxRating() != null ? 
                HotelSpecification.hasStarRatingRange(criteria.getMinRating(), criteria.getMaxRating()) : null,
            criteria.getLatitude() != null && criteria.getLongitude() != null && criteria.getRadiusKm() != null ? 
                HotelSpecification.hasLocationWithinRadius(criteria.getLatitude(), criteria.getLongitude(), criteria.getRadiusKm()) : null,
            criteria.getMinLat() != null || criteria.getMaxLat() != null ? 
                HotelSpecification.hasLatitudeRange(criteria.getMinLat(), criteria.getMaxLat()) : null,
            criteria.getMinLon() != null || criteria.getMaxLon() != null ? 
                HotelSpecification.hasLongitudeRange(criteria.getMinLon(), criteria.getMaxLon()) : null
        );
    }

    /**
     * Hotel search criteria DTO
     */
    public static class HotelSearchCriteria {
        private String destination;
        private String city;
        private String country;
        private String address;
        private String name;
        private String description;
        private BigDecimal minRating;
        private BigDecimal maxRating;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private BigDecimal radiusKm;
        private BigDecimal minLat;
        private BigDecimal maxLat;
        private BigDecimal minLon;
        private BigDecimal maxLon;

        // Constructors
        public HotelSearchCriteria() {}

        public HotelSearchCriteria(String destination) {
            this.destination = destination;
        }

        public HotelSearchCriteria(String city, String country) {
            this.city = city;
            this.country = country;
        }

        // Getters and Setters
        public String getDestination() { return destination; }
        public void setDestination(String destination) { this.destination = destination; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getCountry() { return country; }
        public void setCountry(String country) { this.country = country; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public BigDecimal getMinRating() { return minRating; }
        public void setMinRating(BigDecimal minRating) { this.minRating = minRating; }

        public BigDecimal getMaxRating() { return maxRating; }
        public void setMaxRating(BigDecimal maxRating) { this.maxRating = maxRating; }

        public BigDecimal getLatitude() { return latitude; }
        public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

        public BigDecimal getLongitude() { return longitude; }
        public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

        public BigDecimal getRadiusKm() { return radiusKm; }
        public void setRadiusKm(BigDecimal radiusKm) { this.radiusKm = radiusKm; }

        public BigDecimal getMinLat() { return minLat; }
        public void setMinLat(BigDecimal minLat) { this.minLat = minLat; }

        public BigDecimal getMaxLat() { return maxLat; }
        public void setMaxLat(BigDecimal maxLat) { this.maxLat = maxLat; }

        public BigDecimal getMinLon() { return minLon; }
        public void setMinLon(BigDecimal minLon) { this.minLon = minLon; }

        public BigDecimal getMaxLon() { return maxLon; }
        public void setMaxLon(BigDecimal maxLon) { this.maxLon = maxLon; }

        @Override
        public String toString() {
            return "HotelSearchCriteria{" +
                    "destination='" + destination + '\'' +
                    ", city='" + city + '\'' +
                    ", country='" + country + '\'' +
                    ", address='" + address + '\'' +
                    ", name='" + name + '\'' +
                    ", description='" + description + '\'' +
                    ", minRating=" + minRating +
                    ", maxRating=" + maxRating +
                    ", latitude=" + latitude +
                    ", longitude=" + longitude +
                    ", radiusKm=" + radiusKm +
                    ", minLat=" + minLat +
                    ", maxLat=" + maxLat +
                    ", minLon=" + minLon +
                    ", maxLon=" + maxLon +
                    '}';
        }
    }
}
