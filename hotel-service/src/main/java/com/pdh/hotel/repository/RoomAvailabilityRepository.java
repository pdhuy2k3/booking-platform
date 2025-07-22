package com.pdh.hotel.repository;

import com.pdh.hotel.model.RoomAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for RoomAvailability entity
 * Provides CRUD operations and custom queries for room availability management
 */
@Repository
public interface RoomAvailabilityRepository extends JpaRepository<RoomAvailability, Long> {

    /**
     * Find room availability by room type ID and date
     *
     * @param roomTypeId The room type ID
     * @param date The date
     * @return Optional RoomAvailability
     */
    Optional<RoomAvailability> findByRoomTypeIdAndDate(Long roomTypeId, LocalDate date);

    /**
     * Find all availability records for a room type
     *
     * @param roomTypeId The room type ID
     * @return List of RoomAvailability records
     */
    List<RoomAvailability> findByRoomTypeId(Long roomTypeId);


    /**
     * Find all availability records for a room type within a date range
     * 
     * @param roomTypeId The room type ID
     * @param startDate Start date (inclusive)
     * @param endDate End date (inclusive)
     * @return List of RoomAvailability records
     */
    @Query("SELECT ra FROM RoomAvailability ra WHERE ra.roomTypeId = :roomTypeId " +
           "AND ra.date BETWEEN :startDate AND :endDate ORDER BY ra.date")
    List<RoomAvailability> findByRoomTypeIdAndDateBetween(@Param("roomTypeId") Long roomTypeId,
                                                         @Param("startDate") LocalDate startDate,
                                                         @Param("endDate") LocalDate endDate);

    /**
     * Find availability records with available rooms for a room type
     * 
     * @param roomTypeId The room type ID
     * @return List of RoomAvailability records with available rooms
     */
    @Query("SELECT ra FROM RoomAvailability ra WHERE ra.roomTypeId = :roomTypeId " +
           "AND ra.totalInventory > ra.totalReserved ORDER BY ra.date")
    List<RoomAvailability> findAvailableRoomsByRoomTypeId(@Param("roomTypeId") Long roomTypeId);

    /**
     * Get total available rooms for a room type on a specific date
     * 
     * @param roomTypeId The room type ID
     * @param date The date
     * @return Available rooms count
     */
    @Query("SELECT (ra.totalInventory - ra.totalReserved) FROM RoomAvailability ra " +
           "WHERE ra.roomTypeId = :roomTypeId AND ra.date = :date")
    Integer getAvailableRoomsForDate(@Param("roomTypeId") Long roomTypeId, @Param("date") LocalDate date);

    /**
     * Check if minimum rooms are available for a room type on a specific date
     * 
     * @param roomTypeId The room type ID
     * @param date The date
     * @param minRooms Minimum required rooms
     * @return true if available, false otherwise
     */
    @Query("SELECT CASE WHEN (ra.totalInventory - ra.totalReserved) >= :minRooms THEN true ELSE false END " +
           "FROM RoomAvailability ra WHERE ra.roomTypeId = :roomTypeId AND ra.date = :date")
    Boolean hasMinimumRoomsAvailable(@Param("roomTypeId") Long roomTypeId, 
                                   @Param("date") LocalDate date, 
                                   @Param("minRooms") Integer minRooms);

    /**
     * Find availability records that need attention (low availability)
     * 
     * @param threshold The threshold for low availability
     * @return List of RoomAvailability records with low availability
     */
    @Query("SELECT ra FROM RoomAvailability ra WHERE (ra.totalInventory - ra.totalReserved) <= :threshold " +
           "AND ra.totalInventory > ra.totalReserved ORDER BY ra.date")
    List<RoomAvailability> findLowAvailabilityRooms(@Param("threshold") Integer threshold);

    /**
     * Get minimum available rooms across a date range for a room type
     * 
     * @param roomTypeId The room type ID
     * @param startDate Start date
     * @param endDate End date
     * @return Minimum available rooms count
     */
    @Query("SELECT MIN(ra.totalInventory - ra.totalReserved) FROM RoomAvailability ra " +
           "WHERE ra.roomTypeId = :roomTypeId AND ra.date BETWEEN :startDate AND :endDate")
    Integer getMinimumAvailableRoomsInRange(@Param("roomTypeId") Long roomTypeId,
                                          @Param("startDate") LocalDate startDate,
                                          @Param("endDate") LocalDate endDate);

    /**
     * Find dates with no availability for a room type
     * 
     * @param roomTypeId The room type ID
     * @param startDate Start date
     * @param endDate End date
     * @return List of dates with no availability
     */
    @Query("SELECT ra.date FROM RoomAvailability ra WHERE ra.roomTypeId = :roomTypeId " +
           "AND ra.date BETWEEN :startDate AND :endDate " +
           "AND ra.totalInventory <= ra.totalReserved ORDER BY ra.date")
    List<LocalDate> findDatesWithNoAvailability(@Param("roomTypeId") Long roomTypeId,
                                               @Param("startDate") LocalDate startDate,
                                               @Param("endDate") LocalDate endDate);

    /**
     * Count total reserved rooms for a room type within a date range
     * 
     * @param roomTypeId The room type ID
     * @param startDate Start date
     * @param endDate End date
     * @return Total reserved rooms
     */
    @Query("SELECT SUM(ra.totalReserved) FROM RoomAvailability ra " +
           "WHERE ra.roomTypeId = :roomTypeId AND ra.date BETWEEN :startDate AND :endDate")
    Integer getTotalReservedRoomsInRange(@Param("roomTypeId") Long roomTypeId,
                                       @Param("startDate") LocalDate startDate,
                                       @Param("endDate") LocalDate endDate);

    /**
     * Find all room types with availability on a specific date
     * 
     * @param date The date
     * @return List of room type IDs with availability
     */
    @Query("SELECT DISTINCT ra.roomTypeId FROM RoomAvailability ra " +
           "WHERE ra.date = :date AND ra.totalInventory > ra.totalReserved")
    List<Long> findRoomTypesWithAvailabilityOnDate(@Param("date") LocalDate date);
}
