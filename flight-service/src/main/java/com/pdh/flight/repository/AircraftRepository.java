package com.pdh.flight.repository;

import com.pdh.flight.model.Aircraft;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Aircraft entity
 */
@Repository
public interface AircraftRepository extends JpaRepository<Aircraft, Long> {

    /**
     * Find aircraft by model
     * @param model the aircraft model
     * @return Optional containing the aircraft if found
     */
    Optional<Aircraft> findByModelIgnoreCase(String model);

    /**
     * Find all active aircraft
     * @return List of active aircraft
     */
    @Query("SELECT a FROM Aircraft a WHERE a.isActive = true")
    List<Aircraft> findAllActive();
    
    /**
     * Find aircraft by model containing the given string (case insensitive)
     * @param model the model to search for
     * @return List of matching aircraft
     */
    List<Aircraft> findByModelContainingIgnoreCase(String model);
    
    /**
     * Find active aircraft by model containing the given string (case insensitive)
     * @param model the model to search for
     * @return List of matching active aircraft
     */
    @Query("SELECT a FROM Aircraft a WHERE a.isActive = true AND LOWER(a.model) LIKE LOWER(CONCAT('%', :model, '%'))")
    List<Aircraft> findActiveByModelContainingIgnoreCase(@Param("model") String model);
    
    /**
     * Check if an aircraft exists by registration number
     * @param registrationNumber the registration number
     * @return true if exists, false otherwise
     */
    boolean existsByRegistrationNumberIgnoreCase(String registrationNumber);
    
    /**
     * Find active aircraft with pagination
     * @param pageable pagination information
     * @return Page of active aircraft
     */
    @Query("SELECT a FROM Aircraft a WHERE a.isActive = true")
    Page<Aircraft> findAllActive(Pageable pageable);
    
    /**
     * Find aircraft by model containing the given string with pagination
     * @param model the model to search for
     * @param pageable pagination information
     * @return Page of matching aircraft
     */
    Page<Aircraft> findByModelContainingIgnoreCase(String model, Pageable pageable);
    
    /**
     * Find active aircraft by model containing the given string with pagination
     * @param model the model to search for
     * @param pageable pagination information
     * @return Page of matching active aircraft
     */
    @Query("SELECT a FROM Aircraft a WHERE a.isActive = true AND LOWER(a.model) LIKE LOWER(CONCAT('%', :model, '%'))")
    Page<Aircraft> findActiveByModelContainingIgnoreCase(@Param("model") String model, Pageable pageable);
}