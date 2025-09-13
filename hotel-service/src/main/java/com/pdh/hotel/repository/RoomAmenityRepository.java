package com.pdh.hotel.repository;

import com.pdh.hotel.model.Amenity;
import com.pdh.hotel.model.RoomAmenity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface RoomAmenityRepository extends JpaRepository<RoomAmenity, Long> {

    /**
     * Find all amenities for a specific room
     */
    @Query("SELECT ra.amenity FROM RoomAmenity ra WHERE ra.room.id = :roomId AND ra.isActive = true")
    List<Amenity> findAmenitiesByRoomId(@Param("roomId") Long roomId);

    /**
     * Find all room amenity associations for a specific room
     */
    @Query("SELECT ra FROM RoomAmenity ra WHERE ra.room.id = :roomId")
    List<RoomAmenity> findByRoomId(@Param("roomId") Long roomId);

    /**
     * Find room amenity association by room ID and amenity ID
     */
    @Query("SELECT ra FROM RoomAmenity ra WHERE ra.room.id = :roomId AND ra.amenity.amenityId = :amenityId")
    RoomAmenity findByRoomIdAndAmenityId(@Param("roomId") Long roomId, @Param("amenityId") Long amenityId);

    /**
     * Delete all amenity associations for a specific room
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM RoomAmenity ra WHERE ra.room.id = :roomId")
    void deleteByRoomId(@Param("roomId") Long roomId);

    /**
     * Delete specific amenity association
     */
    @Modifying
    @Transactional
    @Query("DELETE FROM RoomAmenity ra WHERE ra.room.id = :roomId AND ra.amenity.amenityId = :amenityId")
    void deleteByRoomIdAndAmenityId(@Param("roomId") Long roomId, @Param("amenityId") Long amenityId);

    /**
     * Check if room has specific amenity
     */
    @Query("SELECT COUNT(ra) > 0 FROM RoomAmenity ra WHERE ra.room.id = :roomId AND ra.amenity.amenityId = :amenityId AND ra.isActive = true")
    boolean existsByRoomIdAndAmenityId(@Param("roomId") Long roomId, @Param("amenityId") Long amenityId);

    /**
     * Find all room amenities for rooms in a specific hotel
     */
    @Query("SELECT ra FROM RoomAmenity ra WHERE ra.room.hotel.hotelId = :hotelId")
    List<RoomAmenity> findByHotelId(@Param("hotelId") Long hotelId);
}
