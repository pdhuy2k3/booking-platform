package com.pdh.hotel.repository;

import com.pdh.hotel.model.RoomImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for RoomImage entity
 */
@Repository
public interface RoomImageRepository extends JpaRepository<RoomImage, Long> {

    /**
     * Find all images for a room ordered by display order
     * @param roomId the room ID
     * @return List of room images
     */
    @Query("SELECT ri FROM RoomImage ri WHERE ri.room.id = :roomId ORDER BY ri.displayOrder ASC, ri.id ASC")
    List<RoomImage> findByRoomIdOrderByDisplayOrder(@Param("roomId") Long roomId);

    /**
     * Find all active images for a room
     * @param roomId the room ID
     * @return List of active room images
     */
    @Query("SELECT ri FROM RoomImage ri WHERE ri.room.id = :roomId AND ri.isActive = true ORDER BY ri.displayOrder ASC")
    List<RoomImage> findByRoomIdAndIsActiveTrue(@Param("roomId") Long roomId);

    /**
     * Find primary image for a room
     * @param roomId the room ID
     * @return Optional containing the primary image if found
     */
    @Query("SELECT ri FROM RoomImage ri WHERE ri.room.id = :roomId AND ri.isPrimary = true AND ri.isActive = true")
    Optional<RoomImage> findPrimaryImageByRoomId(@Param("roomId") Long roomId);

    /**
     * Count active images for a room
     * @param roomId the room ID
     * @return Number of active images
     */
    @Query("SELECT COUNT(ri) FROM RoomImage ri WHERE ri.room.id = :roomId AND ri.isActive = true")
    long countActiveImagesByRoomId(@Param("roomId") Long roomId);
}