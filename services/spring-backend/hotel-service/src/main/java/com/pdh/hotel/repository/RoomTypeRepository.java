package com.pdh.hotel.repository;

import com.pdh.hotel.model.RoomType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for RoomType entity
 * Provides CRUD operations and custom queries for room type management
 */
@Repository
public interface RoomTypeRepository extends JpaRepository<RoomType, Long> {

    /**
     * Find room type by hotel ID and type name
     *
     * @param hotelId The hotel ID
     * @param typeName The room type name
     * @return Optional RoomType
     */
    @Query("SELECT rt FROM RoomType rt WHERE rt.hotel.hotelId = :hotelId AND rt.name = :typeName")
    Optional<RoomType> findByHotelIdAndTypeName(@Param("hotelId") Long hotelId, @Param("typeName") String typeName);

    /**
     * Find all room types for a hotel
     *
     * @param hotelId The hotel ID
     * @return List of RoomType records
     */
    @Query("SELECT rt FROM RoomType rt WHERE rt.hotel.hotelId = :hotelId ORDER BY rt.name")
    List<RoomType> findByHotelId(@Param("hotelId") Long hotelId);

    /**
     * Find room types by hotel ID (simplified - no isActive field in entity)
     *
     * @param hotelId The hotel ID
     * @return List of RoomType records
     */
    @Query("SELECT rt FROM RoomType rt WHERE rt.hotel.hotelId = :hotelId ORDER BY rt.name")
    List<RoomType> findByHotelIdAndIsActive(@Param("hotelId") Long hotelId, @Param("isActive") Boolean isActive);

    /**
     * Find room types by price range
     *
     * @param hotelId The hotel ID
     * @param minPrice Minimum price
     * @param maxPrice Maximum price
     * @return List of RoomType records
     */
    @Query("SELECT rt FROM RoomType rt WHERE rt.hotel.hotelId = :hotelId " +
           "AND rt.basePrice BETWEEN :minPrice AND :maxPrice ORDER BY rt.basePrice")
    List<RoomType> findByHotelIdAndPriceRange(@Param("hotelId") Long hotelId,
                                             @Param("minPrice") Double minPrice,
                                             @Param("maxPrice") Double maxPrice);

    /**
     * Find room types by capacity (using capacityAdults field)
     *
     * @param hotelId The hotel ID
     * @param capacity Required capacity
     * @return List of RoomType records
     */
    @Query("SELECT rt FROM RoomType rt WHERE rt.hotel.hotelId = :hotelId " +
           "AND rt.capacityAdults >= :capacity ORDER BY rt.capacityAdults, rt.basePrice")
    List<RoomType> findByHotelIdAndCapacityGreaterThanEqual(@Param("hotelId") Long hotelId,
                                                           @Param("capacity") Integer capacity);

    /**
     * Find room types with specific description content (no amenities field in entity)
     *
     * @param hotelId The hotel ID
     * @param searchTerm The term to search for in description
     * @return List of RoomType records
     */
    @Query("SELECT rt FROM RoomType rt WHERE rt.hotel.hotelId = :hotelId " +
           "AND rt.description LIKE CONCAT('%', :searchTerm, '%') ORDER BY rt.name")
    List<RoomType> findByHotelIdAndDescriptionContaining(@Param("hotelId") Long hotelId, @Param("searchTerm") String searchTerm);

    /**
     * Count room types for a hotel
     *
     * @param hotelId The hotel ID
     * @return Number of room types
     */
    @Query("SELECT COUNT(rt) FROM RoomType rt WHERE rt.hotel.hotelId = :hotelId")
    Long countByHotelId(@Param("hotelId") Long hotelId);

    /**
     * Find the cheapest room type for a hotel (removed isActive check as field doesn't exist)
     *
     * @param hotelId The hotel ID
     * @return Optional RoomType with lowest price
     */
    @Query("SELECT rt FROM RoomType rt WHERE rt.hotel.hotelId = :hotelId " +
           "ORDER BY rt.basePrice ASC LIMIT 1")
    Optional<RoomType> findCheapestRoomType(@Param("hotelId") Long hotelId);

    /**
     * Find the most expensive room type for a hotel (removed isActive check as field doesn't exist)
     *
     * @param hotelId The hotel ID
     * @return Optional RoomType with highest price
     */
    @Query("SELECT rt FROM RoomType rt WHERE rt.hotel.hotelId = :hotelId " +
           "ORDER BY rt.basePrice DESC LIMIT 1")
    Optional<RoomType> findMostExpensiveRoomType(@Param("hotelId") Long hotelId);

    /**
     * Find room types suitable for a specific number of guests (using capacityAdults)
     *
     * @param hotelId The hotel ID
     * @param guestCount Number of guests
     * @return List of suitable RoomType records
     */
    @Query("SELECT rt FROM RoomType rt WHERE rt.hotel.hotelId = :hotelId " +
           "AND rt.capacityAdults >= :guestCount " +
           "ORDER BY rt.capacityAdults ASC, rt.basePrice ASC")
    List<RoomType> findSuitableRoomTypes(@Param("hotelId") Long hotelId, @Param("guestCount") Integer guestCount);

    /**
     * Check if a room type exists for a hotel
     *
     * @param hotelId The hotel ID
     * @param typeName The room type name
     * @return true if exists, false otherwise
     */
    @Query("SELECT CASE WHEN COUNT(rt) > 0 THEN true ELSE false END FROM RoomType rt " +
           "WHERE rt.hotel.hotelId = :hotelId AND rt.name = :typeName")
    Boolean existsByHotelIdAndTypeName(@Param("hotelId") Long hotelId, @Param("typeName") String typeName);
}
