package com.pdh.hotel.repository;

import com.pdh.hotel.model.HotelImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for HotelImage entity
 */
@Repository
public interface HotelImageRepository extends JpaRepository<HotelImage, Long> {

    /**
     * Find all images for a hotel ordered by display order
     * @param hotelId the hotel ID
     * @return List of hotel images
     */
    @Query("SELECT hi FROM HotelImage hi WHERE hi.hotel.hotelId = :hotelId ORDER BY hi.displayOrder ASC, hi.id ASC")
    List<HotelImage> findByHotelIdOrderByDisplayOrder(@Param("hotelId") Long hotelId);

    /**
     * Find all active images for a hotel
     * @param hotelId the hotel ID
     * @return List of active hotel images
     */
    @Query("SELECT hi FROM HotelImage hi WHERE hi.hotel.hotelId = :hotelId AND hi.isActive = true ORDER BY hi.displayOrder ASC")
    List<HotelImage> findByHotelIdAndIsActiveTrue(@Param("hotelId") Long hotelId);

    /**
     * Find primary image for a hotel
     * @param hotelId the hotel ID
     * @return Optional containing the primary image if found
     */
    @Query("SELECT hi FROM HotelImage hi WHERE hi.hotel.hotelId = :hotelId AND hi.isPrimary = true AND hi.isActive = true")
    Optional<HotelImage> findPrimaryImageByHotelId(@Param("hotelId") Long hotelId);

    /**
     * Count active images for a hotel
     * @param hotelId the hotel ID
     * @return Number of active images
     */
    @Query("SELECT COUNT(hi) FROM HotelImage hi WHERE hi.hotel.hotelId = :hotelId AND hi.isActive = true")
    long countActiveImagesByHotelId(@Param("hotelId") Long hotelId);
}