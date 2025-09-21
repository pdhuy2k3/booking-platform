package com.pdh.hotel.service;

import com.pdh.hotel.model.RoomAvailability;
import com.pdh.hotel.model.RoomType;
import com.pdh.hotel.repository.RoomAvailabilityRepository;
import com.pdh.hotel.repository.RoomRepository;
import com.pdh.hotel.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Service for managing hotel room inventory and reservations
 * Handles room availability, reservations, and releases for hotel bookings
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class HotelInventoryService {

    private final RoomAvailabilityRepository roomAvailabilityRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final RoomRepository roomRepository;

    /**
     * Reserve rooms for a hotel booking
     * 
     * @param hotelId The hotel ID
     * @param roomTypeName The room type name
     * @param roomCount Number of rooms to reserve
     * @param checkInDate Check-in date
     * @param checkOutDate Check-out date
     * @return true if reservation successful, false otherwise
     */
    @Transactional
    public boolean reserveRooms(Long hotelId, String roomTypeName, Integer roomCount, 
                               LocalDate checkInDate, LocalDate checkOutDate) {
        log.info("Attempting to reserve {} rooms of type {} for hotel {} from {} to {}", 
                roomCount, roomTypeName, hotelId, checkInDate, checkOutDate);
        
        try {
            // Find room type
            Optional<RoomType> roomTypeOpt = roomTypeRepository.findByHotelIdAndTypeName(hotelId, roomTypeName);
            if (roomTypeOpt.isEmpty()) {
                log.warn("Room type {} not found for hotel {}", roomTypeName, hotelId);
                return false;
            }
            
            RoomType roomType = roomTypeOpt.get();
            
            // Check and reserve availability for each date in the stay period
            LocalDate currentDate = checkInDate;
            while (currentDate.isBefore(checkOutDate)) {
                if (!reserveRoomForDate(roomType.getRoomTypeId(), currentDate, roomCount)) {
                    // If any date fails, rollback previous reservations
                    rollbackReservations(roomType.getRoomTypeId(), checkInDate, currentDate, roomCount);
                    return false;
                }
                currentDate = currentDate.plusDays(1);
            }
            
            log.info("Successfully reserved {} rooms of type {} for hotel {} from {} to {}", 
                    roomCount, roomTypeName, hotelId, checkInDate, checkOutDate);

            refreshRoomAvailabilityFlag(roomType, checkInDate, checkOutDate);
            return true;
            
        } catch (Exception e) {
            log.error("Error reserving rooms for hotel {}: {}", hotelId, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Release rooms for a hotel booking (compensation action)
     * 
     * @param hotelId The hotel ID
     * @param roomTypeName The room type name
     * @param roomCount Number of rooms to release
     * @param checkInDate Check-in date
     * @param checkOutDate Check-out date
     */
    @Transactional
    public void releaseRooms(Long hotelId, String roomTypeName, Integer roomCount, 
                            LocalDate checkInDate, LocalDate checkOutDate) {
        log.info("Releasing {} rooms of type {} for hotel {} from {} to {}", 
                roomCount, roomTypeName, hotelId, checkInDate, checkOutDate);
        
        try {
            // Find room type
            Optional<RoomType> roomTypeOpt = roomTypeRepository.findByHotelIdAndTypeName(hotelId, roomTypeName);
            if (roomTypeOpt.isEmpty()) {
                log.warn("Room type {} not found for hotel {}", roomTypeName, hotelId);
                return;
            }
            
            RoomType roomType = roomTypeOpt.get();
            
            // Release availability for each date in the stay period
            LocalDate currentDate = checkInDate;
            while (currentDate.isBefore(checkOutDate)) {
                releaseRoomForDate(roomType.getRoomTypeId(), currentDate, roomCount);
                currentDate = currentDate.plusDays(1);
            }
            
            log.info("Successfully released {} rooms of type {} for hotel {} from {} to {}", 
                    roomCount, roomTypeName, hotelId, checkInDate, checkOutDate);

            refreshRoomAvailabilityFlag(roomType, checkInDate, checkOutDate);
            
        } catch (Exception e) {
            log.error("Error releasing rooms for hotel {}: {}", hotelId, e.getMessage(), e);
        }
    }

    /**
     * Check room availability for a hotel booking
     * 
     * @param hotelId The hotel ID
     * @param roomTypeName The room type name
     * @param roomCount Number of rooms needed
     * @param checkInDate Check-in date
     * @param checkOutDate Check-out date
     * @return true if rooms are available, false otherwise
     */
    @Transactional(readOnly = true)
    public boolean checkAvailability(Long hotelId, String roomTypeName, Integer roomCount, 
                                   LocalDate checkInDate, LocalDate checkOutDate) {
        log.debug("Checking availability for {} rooms of type {} at hotel {} from {} to {}", 
                roomCount, roomTypeName, hotelId, checkInDate, checkOutDate);
        
        try {
            // Find room type
            Optional<RoomType> roomTypeOpt = roomTypeRepository.findByHotelIdAndTypeName(hotelId, roomTypeName);
            if (roomTypeOpt.isEmpty()) {
                return false;
            }
            
            RoomType roomType = roomTypeOpt.get();
            
            // Check availability for each date in the stay period
            LocalDate currentDate = checkInDate;
            while (currentDate.isBefore(checkOutDate)) {
                if (!isRoomAvailableForDate(roomType.getRoomTypeId(), currentDate, roomCount)) {
                    return false;
                }
                currentDate = currentDate.plusDays(1);
            }
            
            return true;
            
        } catch (Exception e) {
            log.error("Error checking availability for hotel {}: {}", hotelId, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Reserve room for a specific date
     */
    private void refreshRoomAvailabilityFlag(RoomType roomType, LocalDate checkInDate, LocalDate checkOutDate) {
        if (roomType == null || roomType.getRoomTypeId() == null || checkInDate == null || checkOutDate == null) {
            return;
        }

        LocalDate endDate = checkOutDate.minusDays(1);
        if (endDate.isBefore(checkInDate)) {
            endDate = checkInDate;
        }

        List<RoomAvailability> availabilityRange = roomAvailabilityRepository
                .findByRoomTypeIdAndDateBetween(roomType.getRoomTypeId(), checkInDate, endDate);

        if (availabilityRange.isEmpty()) {
            return;
        }

        boolean soldOut = availabilityRange.stream().allMatch(availability -> remainingRooms(availability) <= 0);
        boolean hasAvailability = availabilityRange.stream().anyMatch(availability -> remainingRooms(availability) > 0);

        if (soldOut) {
            roomRepository.updateAvailabilityByRoomType(roomType.getRoomTypeId(), false);
        } else if (hasAvailability) {
            roomRepository.updateAvailabilityByRoomType(roomType.getRoomTypeId(), true);
        }
    }

    private int remainingRooms(RoomAvailability availability) {
        if (availability == null) {
            return 0;
        }
        int totalInventory = Optional.ofNullable(availability.getTotalInventory()).orElse(0);
        int totalReserved = Optional.ofNullable(availability.getTotalReserved()).orElse(0);
        return totalInventory - totalReserved;
    }

    /**
     * Reserve room for a specific date
     */
    private boolean reserveRoomForDate(Long roomTypeId, LocalDate date, Integer roomCount) {
        Optional<RoomAvailability> availabilityOpt = roomAvailabilityRepository
            .findByRoomTypeIdAndDate(roomTypeId, date);
        
        if (availabilityOpt.isEmpty()) {
            log.warn("No availability record found for room type {} on date {}", roomTypeId, date);
            return false;
        }
        
        RoomAvailability availability = availabilityOpt.get();
        
        // Check if enough rooms are available
        int availableRooms = availability.getTotalInventory() - availability.getTotalReserved();
        if (availableRooms < roomCount) {
            log.warn("Insufficient rooms available on {}. Required: {}, Available: {}", 
                    date, roomCount, availableRooms);
            return false;
        }
        
        // Reserve rooms
        availability.setTotalReserved(availability.getTotalReserved() + roomCount);
        roomAvailabilityRepository.save(availability);
        
        log.debug("Reserved {} rooms for room type {} on date {}", roomCount, roomTypeId, date);
        return true;
    }

    /**
     * Release room for a specific date
     */
    private void releaseRoomForDate(Long roomTypeId, LocalDate date, Integer roomCount) {
        Optional<RoomAvailability> availabilityOpt = roomAvailabilityRepository
            .findByRoomTypeIdAndDate(roomTypeId, date);
        
        if (availabilityOpt.isPresent()) {
            RoomAvailability availability = availabilityOpt.get();
            
            // Release rooms (ensure we don't go below 0)
            int newReservedRooms = Math.max(0, availability.getTotalReserved() - roomCount);
            availability.setTotalReserved(newReservedRooms);
            roomAvailabilityRepository.save(availability);
            
            log.debug("Released {} rooms for room type {} on date {}", roomCount, roomTypeId, date);
        } else {
            log.warn("No availability record found for room type {} on date {}", roomTypeId, date);
        }
    }

    /**
     * Check if room is available for a specific date
     */
    private boolean isRoomAvailableForDate(Long roomTypeId, LocalDate date, Integer roomCount) {
        Optional<RoomAvailability> availabilityOpt = roomAvailabilityRepository
            .findByRoomTypeIdAndDate(roomTypeId, date);
        
        if (availabilityOpt.isEmpty()) {
            return false;
        }
        
        RoomAvailability availability = availabilityOpt.get();
        int availableRooms = availability.getTotalInventory() - availability.getTotalReserved();
        
        return availableRooms >= roomCount;
    }

    /**
     * Rollback reservations for failed booking
     */
    private void rollbackReservations(Long roomTypeId, LocalDate startDate, LocalDate endDate, Integer roomCount) {
        log.warn("Rolling back room reservations for room type {} from {} to {}", roomTypeId, startDate, endDate);
        
        LocalDate currentDate = startDate;
        while (currentDate.isBefore(endDate)) {
            releaseRoomForDate(roomTypeId, currentDate, roomCount);
            currentDate = currentDate.plusDays(1);
        }
    }

    /**
     * Get available room count for a room type on a specific date
     * 
     * @param roomTypeId The room type ID
     * @param date The date
     * @return Available room count
     */
    @Transactional(readOnly = true)
    public int getAvailableRooms(Long roomTypeId, LocalDate date) {
        try {
            Optional<RoomAvailability> availabilityOpt = roomAvailabilityRepository
                .findByRoomTypeIdAndDate(roomTypeId, date);
            
            if (availabilityOpt.isEmpty()) {
                return 0;
            }
            
            RoomAvailability availability = availabilityOpt.get();
            return availability.getTotalInventory() - availability.getTotalReserved();
            
        } catch (Exception e) {
            log.error("Error getting available rooms for room type {} on date {}: {}", 
                    roomTypeId, date, e.getMessage(), e);
            return 0;
        }
    }
}
