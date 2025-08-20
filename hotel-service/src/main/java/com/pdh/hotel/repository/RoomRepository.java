package com.pdh.hotel.repository;

import com.pdh.hotel.model.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

/**
 * Repository interface for Room entity
 */
@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    /**
     * Find available rooms by hotel ID
     * @param hotelId the hotel ID
     * @param pageable pagination information
     * @return Page of available rooms
     */
    @Query("""
        SELECT r FROM Room r 
        JOIN FETCH r.hotel h 
        LEFT JOIN FETCH r.roomType rt 
        WHERE h.hotelId = :hotelId 
        AND r.isAvailable = true 
        AND (r.isDeleted IS NULL OR r.isDeleted = false)
        ORDER BY r.price ASC
        """)
    Page<Room> findAvailableRoomsByHotelId(@Param("hotelId") Long hotelId, Pageable pageable);

    /**
     * Find rooms by hotel ID and price range
     * @param hotelId the hotel ID
     * @param minPrice minimum price
     * @param maxPrice maximum price
     * @param pageable pagination information
     * @return Page of rooms within price range
     */
    @Query("""
        SELECT r FROM Room r 
        JOIN FETCH r.hotel h 
        LEFT JOIN FETCH r.roomType rt 
        WHERE h.hotelId = :hotelId 
        AND r.price BETWEEN :minPrice AND :maxPrice 
        AND r.isAvailable = true 
        AND (r.isDeleted IS NULL OR r.isDeleted = false)
        ORDER BY r.price ASC
        """)
    Page<Room> findRoomsByHotelIdAndPriceRange(
        @Param("hotelId") Long hotelId,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        Pageable pageable
    );

    /**
     * Find rooms by hotel ID and room type
     * @param hotelId the hotel ID
     * @param roomTypeName the room type name
     * @param pageable pagination information
     * @return Page of rooms of specified type
     */
    @Query("""
        SELECT r FROM Room r 
        JOIN FETCH r.hotel h 
        LEFT JOIN FETCH r.roomType rt 
        WHERE h.hotelId = :hotelId 
        AND rt.name = :roomTypeName 
        AND r.isAvailable = true 
        AND (r.isDeleted IS NULL OR r.isDeleted = false)
        ORDER BY r.price ASC
        """)
    Page<Room> findRoomsByHotelIdAndRoomType(
        @Param("hotelId") Long hotelId,
        @Param("roomTypeName") String roomTypeName,
        Pageable pageable
    );

    /**
     * Count available rooms by hotel ID
     * @param hotelId the hotel ID
     * @return number of available rooms
     */
    @Query("""
        SELECT COUNT(r) FROM Room r 
        WHERE r.hotel.hotelId = :hotelId 
        AND r.isAvailable = true 
        AND (r.isDeleted IS NULL OR r.isDeleted = false)
        """)
    Long countAvailableRoomsByHotelId(@Param("hotelId") Long hotelId);

    /**
     * Find cheapest room price by hotel ID
     * @param hotelId the hotel ID
     * @return minimum room price
     */
    @Query("""
        SELECT MIN(r.price) FROM Room r 
        WHERE r.hotel.hotelId = :hotelId 
        AND r.isAvailable = true 
        AND (r.isDeleted IS NULL OR r.isDeleted = false)
        """)
    BigDecimal findMinPriceByHotelId(@Param("hotelId") Long hotelId);
}
