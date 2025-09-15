package com.pdh.flight.repository;

import com.pdh.flight.model.Airline;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Airline entity
 */
@Repository
public interface AirlineRepository extends JpaRepository<Airline, Long> {

    /**
     * Find airline by IATA code
     * @param iataCode the IATA code
     * @return Optional containing the airline if found
     */
    Optional<Airline> findByIataCodeIgnoreCase(String iataCode);

    /**
     * Find all active airlines
     * @return List of active airlines
     */
    @Query("SELECT a FROM Airline a WHERE a.isActive = true")
    List<Airline> findAllActive();
    
    /**
     * Find airlines by name containing the given string (case insensitive)
     * @param name the name to search for
     * @return List of matching airlines
     */
    List<Airline> findByNameContainingIgnoreCase(String name);
    
    /**
     * Find active airlines by name containing the given string (case insensitive)
     * @param name the name to search for
     * @return List of matching active airlines
     */
    @Query("SELECT a FROM Airline a WHERE a.isActive = true AND LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Airline> findActiveByNameContainingIgnoreCase(@Param("name") String name);
    
    /**
     * Check if an airline exists by IATA code
     * @param iataCode the IATA code
     * @return true if exists, false otherwise
     */
    boolean existsByIataCodeIgnoreCase(String iataCode);
    
    /**
     * Find airline by ID and active status
     * @param id the airline ID
     * @param isActive the active status
     * @return Optional containing the airline if found
     */
    Optional<Airline> findByAirlineIdAndIsActive(Long id, Boolean isActive);
    
    /**
     * Find active airlines with pagination
     * @param pageable pagination information
     * @return Page of active airlines
     */
    Page<Airline> findByIsActiveTrue(Pageable pageable);
    
    /**
     * Search airlines by name or IATA code (for autocomplete)
     * @param name search term for name
     * @param iataCode search term for IATA code
     * @param pageable pagination information
     * @return Page of matching airlines
     */
    Page<Airline> findByNameContainingIgnoreCaseOrIataCodeContainingIgnoreCase(
        String name, String iataCode, Pageable pageable);
    
    /**
     * Find airlines by name containing the given string with pagination
     * @param name the name to search for
     * @param pageable pagination information
     * @return Page of matching airlines
     */
    Page<Airline> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    /**
     * Find active airlines by name containing the given string with pagination
     * @param name the name to search for
     * @param pageable pagination information
     * @return Page of matching active airlines
     */
    @Query("SELECT a FROM Airline a WHERE a.isActive = true AND LOWER(a.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    Page<Airline> findActiveByNameContainingIgnoreCase(@Param("name") String name, Pageable pageable);
}
