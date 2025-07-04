package com.pdh.hotel.repository;

import com.pdh.hotel.model.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    
    List<Room> findByHotelIdAndIsAvailableTrue(Long hotelId);
    
    List<Room> findByRoomTypeAndIsAvailableTrue(String roomType);
    
    @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId AND " +
           "r.isAvailable = true AND r.price BETWEEN :minPrice AND :maxPrice")
    List<Room> findAvailableRoomsByHotelAndPriceRange(
            @Param("hotelId") Long hotelId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice);
    
    @Query("SELECT r FROM Room r WHERE r.hotel.id = :hotelId AND " +
           "r.isAvailable = true AND r.maxOccupancy >= :guests")
    List<Room> findAvailableRoomsByHotelAndOccupancy(
            @Param("hotelId") Long hotelId,
            @Param("guests") Integer guests);
}
