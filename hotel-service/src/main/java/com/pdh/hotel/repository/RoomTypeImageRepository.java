package com.pdh.hotel.repository;

import com.pdh.hotel.model.RoomTypeImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface RoomTypeImageRepository extends JpaRepository<RoomTypeImage, Long> {

    /**
     * Find all images for a specific room type
     */
    @Query("SELECT rti FROM RoomTypeImage rti WHERE rti.roomType.roomTypeId = :roomTypeId")
    List<RoomTypeImage> findByRoomTypeId(@Param("roomTypeId") Long roomTypeId);

    /**
     * Find image by room type ID and media ID
     */
    @Query("SELECT rti FROM RoomTypeImage rti WHERE rti.roomType.roomTypeId = :roomTypeId AND rti.mediaId = :mediaId")
    RoomTypeImage findByRoomTypeIdAndMediaId(@Param("roomTypeId") Long roomTypeId, @Param("mediaId") Long mediaId);

    /**
     * Delete all images for a specific room type
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM RoomTypeImage rti WHERE rti.roomType.roomTypeId = :roomTypeId")
    void deleteByRoomTypeId(@Param("roomTypeId") Long roomTypeId);

    /**
     * Delete specific image by room type ID and media ID
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM RoomTypeImage rti WHERE rti.roomType.roomTypeId = :roomTypeId AND rti.mediaId = :mediaId")
    void deleteByRoomTypeIdAndMediaId(@Param("roomTypeId") Long roomTypeId, @Param("mediaId") Long mediaId);

    /**
     * Check if media is associated with room type
     */
    @Query("SELECT COUNT(rti) > 0 FROM RoomTypeImage rti WHERE rti.roomType.roomTypeId = :roomTypeId AND rti.mediaId = :mediaId")
    boolean existsByRoomTypeIdAndMediaId(@Param("roomTypeId") Long roomTypeId, @Param("mediaId") Long mediaId);

    /**
     * Find all images for room types in a specific hotel
     */
    @Query("SELECT rti FROM RoomTypeImage rti WHERE rti.roomType.hotel.hotelId = :hotelId")
    List<RoomTypeImage> findByHotelId(@Param("hotelId") Long hotelId);
}
