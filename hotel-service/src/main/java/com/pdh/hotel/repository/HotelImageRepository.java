package com.pdh.hotel.repository;

import com.pdh.hotel.model.HotelImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface HotelImageRepository extends JpaRepository<HotelImage, Long> {

    /**
     * Find all images for a specific hotel
     */
    @Query("SELECT hi FROM HotelImage hi WHERE hi.hotel.hotelId = :hotelId")
    List<HotelImage> findByHotelId(@Param("hotelId") Long hotelId);

    /**
     * Find image by hotel ID and media ID
     */
    @Query("SELECT hi FROM HotelImage hi WHERE hi.hotel.hotelId = :hotelId AND hi.mediaId = :mediaId")
    HotelImage findByHotelIdAndMediaId(@Param("hotelId") Long hotelId, @Param("mediaId") Long mediaId);

    /**
     * Delete all images for a specific hotel
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM HotelImage hi WHERE hi.hotel.hotelId = :hotelId")
    void deleteByHotelId(@Param("hotelId") Long hotelId);

    /**
     * Delete specific image by hotel ID and media ID
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM HotelImage hi WHERE hi.hotel.hotelId = :hotelId AND hi.mediaId = :mediaId")
    void deleteByHotelIdAndMediaId(@Param("hotelId") Long hotelId, @Param("mediaId") Long mediaId);

    /**
     * Check if media is associated with hotel
     */
    @Query("SELECT COUNT(hi) > 0 FROM HotelImage hi WHERE hi.hotel.hotelId = :hotelId AND hi.mediaId = :mediaId")
    boolean existsByHotelIdAndMediaId(@Param("hotelId") Long hotelId, @Param("mediaId") Long mediaId);
}
