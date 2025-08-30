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
     * Find all active airlines (not deleted)
     * @return List of active airlines
     */
    @Query("SELECT a FROM Airline a WHERE a.isDeleted = false")
    List<Airline> findAllActive();

    /**
     * Find airlines by name containing the given string (case insensitive)
     * @param name the name to search for
     * @return List of matching airlines
     */
    List<Airline> findByNameContainingIgnoreCase(String name);

    /**
     * Check if an airline exists by IATA code
     * @param iataCode the IATA code
     * @return true if exists, false otherwise
     */
    boolean existsByIataCodeIgnoreCase(String iataCode);
    
    /**
     * Find active airlines with pagination
     * @param pageable pagination information
     * @return Page of active airlines
     */
    @Query("SELECT a FROM Airline a WHERE a.isDeleted = false")
    Page<Airline> findAllActive(Pageable pageable);
    
    /**
     * Find airlines by name containing the given string with pagination
     * @param name the name to search for
     * @param pageable pagination information
     * @return Page of matching airlines
     */
    Page<Airline> findByNameContainingIgnoreCase(String name, Pageable pageable);
}
