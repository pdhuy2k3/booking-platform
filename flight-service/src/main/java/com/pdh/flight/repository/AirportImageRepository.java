package com.pdh.flight.repository;

import com.pdh.flight.model.AirportImage;
import com.pdh.flight.model.enums.AirportImageType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for AirportImage entity
 */
@Repository
public interface AirportImageRepository extends JpaRepository<AirportImage, Long> {

    /**
     * Find all active images for a specific airport
     * @param airportId the airport ID
     * @return List of active airport images
     */
    @Query("SELECT ai FROM AirportImage ai WHERE ai.airport.airportId = :airportId AND ai.isActive = true ORDER BY ai.displayOrder ASC, ai.id ASC")
    List<AirportImage> findByAirportIdAndIsActiveTrue(@Param("airportId") Long airportId);

    /**
     * Find images by airport and image type
     * @param airportId the airport ID
     * @param imageType the image type
     * @return List of matching images
     */
    @Query("SELECT ai FROM AirportImage ai WHERE ai.airport.airportId = :airportId AND ai.imageType = :imageType AND ai.isActive = true ORDER BY ai.displayOrder ASC")
    List<AirportImage> findByAirportIdAndImageTypeAndIsActiveTrue(@Param("airportId") Long airportId, @Param("imageType") AirportImageType imageType);

    /**
     * Find primary image for an airport
     * @param airportId the airport ID
     * @return Optional containing the primary image if found
     */
    @Query("SELECT ai FROM AirportImage ai WHERE ai.airport.airportId = :airportId AND ai.isPrimary = true AND ai.isActive = true")
    Optional<AirportImage> findPrimaryImageByAirportId(@Param("airportId") Long airportId);

    /**
     * Find all images for an airport with pagination
     * @param airportId the airport ID
     * @param pageable pagination information
     * @return Page of airport images
     */
    @Query("SELECT ai FROM AirportImage ai WHERE ai.airport.airportId = :airportId ORDER BY ai.displayOrder ASC, ai.id ASC")
    Page<AirportImage> findByAirportId(@Param("airportId") Long airportId, Pageable pageable);

    /**
     * Count active images for an airport
     * @param airportId the airport ID
     * @return Number of active images
     */
    @Query("SELECT COUNT(ai) FROM AirportImage ai WHERE ai.airport.airportId = :airportId AND ai.isActive = true")
    long countActiveImagesByAirportId(@Param("airportId") Long airportId);
}