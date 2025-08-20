package com.pdh.hotel.repository;

import com.pdh.hotel.model.Amenity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for Amenity entity
 */
@Repository
public interface AmenityRepository extends JpaRepository<Amenity, Long> {
    
    /**
     * Find all active amenities
     * @return List of active amenities
     */
    List<Amenity> findByIsActiveTrue();
    
    /**
     * Find all active amenities with pagination
     * @param pageable pagination information
     * @return Page of active amenities
     */
    Page<Amenity> findByIsActiveTrue(Pageable pageable);
    
    /**
     * Search amenities by name (case-insensitive)
     * @param name the search term
     * @return List of matching amenities
     */
    List<Amenity> findByNameContainingIgnoreCase(String name);
    
    /**
     * Search amenities by name with pagination
     * @param name the search term
     * @param pageable pagination information
     * @return Page of matching amenities
     */
    Page<Amenity> findByNameContainingIgnoreCase(String name, Pageable pageable);
    
    /**
     * Get all amenities sorted by display order
     * @return List of amenities sorted by display order
     */
    List<Amenity> findAllByOrderByDisplayOrderAsc();
    
    /**
     * Get active amenities sorted by display order
     * @return List of active amenities sorted by display order
     */
    List<Amenity> findByIsActiveTrueOrderByDisplayOrderAsc();
    
    /**
     * Find amenity by name (exact match, case-sensitive)
     * @param name the amenity name
     * @return Optional containing the amenity if found
     */
    Optional<Amenity> findByName(String name);
    
    /**
     * Check if amenity exists by name
     * @param name the amenity name
     * @return true if exists, false otherwise
     */
    boolean existsByName(String name);
    
    /**
     * Check if amenity exists by name excluding a specific ID
     * @param name the amenity name
     * @param amenityId the ID to exclude
     * @return true if exists, false otherwise
     */
    boolean existsByNameAndAmenityIdNot(String name, Long amenityId);
    
    /**
     * Find amenities by IDs
     * @param ids list of amenity IDs
     * @return List of amenities
     */
    @Query("SELECT a FROM Amenity a WHERE a.amenityId IN :ids AND a.isActive = true")
    List<Amenity> findActiveAmenitiesByIds(@Param("ids") List<Long> ids);
    
    /**
     * Get the next display order value
     * @return the next display order value
     */
    @Query("SELECT COALESCE(MAX(a.displayOrder), 0) + 1 FROM Amenity a")
    Integer getNextDisplayOrder();
}
