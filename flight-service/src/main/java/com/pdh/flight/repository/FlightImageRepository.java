package com.pdh.flight.repository;

import com.pdh.flight.model.FlightImage;
import com.pdh.flight.model.enums.FlightImageType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for FlightImage entity
 */
@Repository
public interface FlightImageRepository extends JpaRepository<FlightImage, Long> {

    /**
     * Find all active images for a specific flight
     * @param flightId the flight ID
     * @return List of active flight images
     */
    @Query("SELECT fi FROM FlightImage fi WHERE fi.flight.flightId = :flightId AND fi.isActive = true ORDER BY fi.displayOrder ASC, fi.id ASC")
    List<FlightImage> findByFlightIdAndIsActiveTrue(@Param("flightId") Long flightId);

    /**
     * Find images by flight and image type
     * @param flightId the flight ID
     * @param imageType the image type
     * @return List of matching images
     */
    @Query("SELECT fi FROM FlightImage fi WHERE fi.flight.flightId = :flightId AND fi.imageType = :imageType AND fi.isActive = true ORDER BY fi.displayOrder ASC")
    List<FlightImage> findByFlightIdAndImageTypeAndIsActiveTrue(@Param("flightId") Long flightId, @Param("imageType") FlightImageType imageType);

    /**
     * Find primary image for a flight
     * @param flightId the flight ID
     * @return Optional containing the primary image if found
     */
    @Query("SELECT fi FROM FlightImage fi WHERE fi.flight.flightId = :flightId AND fi.isPrimary = true AND fi.isActive = true")
    Optional<FlightImage> findPrimaryImageByFlightId(@Param("flightId") Long flightId);

    /**
     * Find all images for a flight with pagination
     * @param flightId the flight ID
     * @param pageable pagination information
     * @return Page of flight images
     */
    @Query("SELECT fi FROM FlightImage fi WHERE fi.flight.flightId = :flightId ORDER BY fi.displayOrder ASC, fi.id ASC")
    Page<FlightImage> findByFlightId(@Param("flightId") Long flightId, Pageable pageable);

    /**
     * Count active images for a flight
     * @param flightId the flight ID
     * @return Number of active images
     */
    @Query("SELECT COUNT(fi) FROM FlightImage fi WHERE fi.flight.flightId = :flightId AND fi.isActive = true")
    long countActiveImagesByFlightId(@Param("flightId") Long flightId);
}