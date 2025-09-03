package com.pdh.flight.repository;

import com.pdh.flight.model.AirlineImage;
import com.pdh.flight.model.enums.AirlineImageType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for AirlineImage entity
 */
@Repository
public interface AirlineImageRepository extends JpaRepository<AirlineImage, Long> {

    /**
     * Find all active images for a specific airline
     * @param airlineId the airline ID
     * @return List of active airline images
     */
    @Query("SELECT ai FROM AirlineImage ai WHERE ai.airline.airlineId = :airlineId AND ai.isActive = true ORDER BY ai.displayOrder ASC, ai.id ASC")
    List<AirlineImage> findByAirlineIdAndIsActiveTrue(@Param("airlineId") Long airlineId);

    /**
     * Find images by airline and image type
     * @param airlineId the airline ID
     * @param imageType the image type
     * @return List of matching images
     */
    @Query("SELECT ai FROM AirlineImage ai WHERE ai.airline.airlineId = :airlineId AND ai.imageType = :imageType AND ai.isActive = true ORDER BY ai.displayOrder ASC")
    List<AirlineImage> findByAirlineIdAndImageTypeAndIsActiveTrue(@Param("airlineId") Long airlineId, @Param("imageType") AirlineImageType imageType);

    /**
     * Find primary image for an airline
     * @param airlineId the airline ID
     * @return Optional containing the primary image if found
     */
    @Query("SELECT ai FROM AirlineImage ai WHERE ai.airline.airlineId = :airlineId AND ai.isPrimary = true AND ai.isActive = true")
    Optional<AirlineImage> findPrimaryImageByAirlineId(@Param("airlineId") Long airlineId);

    /**
     * Find all images for an airline with pagination
     * @param airlineId the airline ID
     * @param pageable pagination information
     * @return Page of airline images
     */
    @Query("SELECT ai FROM AirlineImage ai WHERE ai.airline.airlineId = :airlineId ORDER BY ai.displayOrder ASC, ai.id ASC")
    Page<AirlineImage> findByAirlineId(@Param("airlineId") Long airlineId, Pageable pageable);

    /**
     * Count active images for an airline
     * @param airlineId the airline ID
     * @return Number of active images
     */
    @Query("SELECT COUNT(ai) FROM AirlineImage ai WHERE ai.airline.airlineId = :airlineId AND ai.isActive = true")
    long countActiveImagesByAirlineId(@Param("airlineId") Long airlineId);
}