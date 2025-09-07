package com.pdh.flight.repository;

import com.pdh.flight.model.Airport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Airport entity
 */
@Repository
public interface AirportRepository extends JpaRepository<Airport, Long> {

    /**
     * Find airport by IATA code
     * @param iataCode the IATA code
     * @return Optional containing the airport if found
     */
    Optional<Airport> findByIataCodeIgnoreCase(String iataCode);

    /**
     * Find airport by IATA code (exact match)
     * @param iataCode the IATA code
     * @return Optional containing the airport if found
     */
    Optional<Airport> findByIataCode(String iataCode);

    /**
     * Find all active airports
     * @return List of active airports
     */
    @Query("SELECT a FROM Airport a WHERE a.isActive = true")
    List<Airport> findAllActive();
    
    /**
     * Find airports by city (case insensitive)
     * @param city the city name
     * @return List of airports in the city
     */
    List<Airport> findByCityIgnoreCase(String city);
    
    /**
     * Find airports by country (case insensitive)
     * @param country the country name
     * @return List of airports in the country
     */
    List<Airport> findByCountryIgnoreCase(String country);
    
    /**
     * Find airports by name containing the given string (case insensitive)
     * @param name the name to search for
     * @return List of matching airports
     */
    List<Airport> findByNameContainingIgnoreCase(String name);
    
    /**
     * Check if an airport exists by IATA code
     * @param iataCode the IATA code
     * @return true if exists, false otherwise
     */
    boolean existsByIataCodeIgnoreCase(String iataCode);
    
    /**
     * Search airports by name, IATA code, or city (for autocomplete)
     * @param name search term for name
     * @param iataCode search term for IATA code
     * @param city search term for city
     * @param pageable pagination information
     * @return Page of matching airports
     */
    Page<Airport> findByNameContainingIgnoreCaseOrIataCodeContainingIgnoreCaseOrCityContainingIgnoreCase(
        String name, String iataCode, String city, Pageable pageable);
    
    /**
     * Find active airports with pagination
     * @param pageable pagination information
     * @return Page of active airports
     */
    @Query("SELECT a FROM Airport a WHERE a.isActive = true")
    Page<Airport> findAllActive(Pageable pageable);
    
    /**
     * Find airports by city with pagination
     * @param city the city name
     * @param pageable pagination information
     * @return Page of airports in the city
     */
    Page<Airport> findByCityIgnoreCase(String city, Pageable pageable);
    
    /**
     * Find airports by country with pagination
     * @param country the country name
     * @param pageable pagination information
     * @return Page of airports in the country
     */
    Page<Airport> findByCountryIgnoreCase(String country, Pageable pageable);
}
