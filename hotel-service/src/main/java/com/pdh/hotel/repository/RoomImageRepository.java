package com.pdh.hotel.repository;

import com.pdh.hotel.model.RoomImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface RoomImageRepository extends JpaRepository<RoomImage, Long> {

    /**
     * Find all images for a specific room
     */
    @Query("SELECT ri FROM RoomImage ri WHERE ri.room.id = :roomId")
    List<RoomImage> findByRoomId(@Param("roomId") Long roomId);

    /**
     * Find image by room ID and media ID
     */
    @Query("SELECT ri FROM RoomImage ri WHERE ri.room.id = :roomId AND ri.mediaId = :mediaId")
    RoomImage findByRoomIdAndMediaId(@Param("roomId") Long roomId, @Param("mediaId") Long mediaId);

    /**
     * Delete all images for a specific room
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM RoomImage ri WHERE ri.room.id = :roomId")
    void deleteByRoomId(@Param("roomId") Long roomId);

    /**
     * Delete specific image by room ID and media ID
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM RoomImage ri WHERE ri.room.id = :roomId AND ri.mediaId = :mediaId")
    void deleteByRoomIdAndMediaId(@Param("roomId") Long roomId, @Param("mediaId") Long mediaId);

    /**
     * Check if media is associated with room
     */
    @Query("SELECT COUNT(ri) > 0 FROM RoomImage ri WHERE ri.room.id = :roomId AND ri.mediaId = :mediaId")
    boolean existsByRoomIdAndMediaId(@Param("roomId") Long roomId, @Param("mediaId") Long mediaId);

    /**
     * Find all images for rooms in a specific hotel
     */
    @Query("SELECT ri FROM RoomImage ri WHERE ri.room.hotel.hotelId = :hotelId")
    List<RoomImage> findByHotelId(@Param("hotelId") Long hotelId);
}
