package com.pdh.hotel.service;

import com.pdh.hotel.model.RoomAvailability;
import com.pdh.hotel.model.RoomType;
import com.pdh.hotel.repository.RoomAvailabilityRepository;
import com.pdh.hotel.repository.RoomRepository;
import com.pdh.hotel.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

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
                if (!reserveRoomForDate(roomType, currentDate, roomCount)) {
                    // If any date fails, rollback previous reservations
                    rollbackReservations(roomType, checkInDate, currentDate, roomCount);
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
                releaseRoomForDate(roomType, currentDate, roomCount);
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
                if (!isRoomAvailableForDate(roomType, currentDate, roomCount)) {
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
    private boolean reserveRoomForDate(RoomType roomType, LocalDate date, Integer roomCount) {
        int roomsToReserve = normalizeRoomCount(roomCount);

        Optional<RoomAvailability> availabilityOpt = getAvailabilityRecord(roomType, date, true);

        if (availabilityOpt.isEmpty()) {
            log.warn("Unable to initialize availability for room type {} on {}", roomType.getRoomTypeId(), date);
            return false;
        }

        RoomAvailability availability = availabilityOpt.get();

        int availableRooms = remainingRooms(availability);
        if (availableRooms < roomsToReserve) {
            log.warn("Insufficient rooms available on {}. Required: {}, Available: {}",
                    date, roomsToReserve, availableRooms);
            return false;
        }

        availability.setTotalReserved(Optional.ofNullable(availability.getTotalReserved()).orElse(0) + roomsToReserve);
        roomAvailabilityRepository.save(availability);

        log.debug("Reserved {} rooms for room type {} on date {}", roomsToReserve, roomType.getRoomTypeId(), date);
        return true;
    }

    /**
     * Release room for a specific date
     */
    private void releaseRoomForDate(RoomType roomType, LocalDate date, Integer roomCount) {
        int roomsToRelease = normalizeRoomCount(roomCount);

        Optional<RoomAvailability> availabilityOpt = getAvailabilityRecord(roomType, date, false);

        if (availabilityOpt.isEmpty()) {
            log.warn("No availability record found for room type {} on date {}", roomType.getRoomTypeId(), date);
            return;
        }

        RoomAvailability availability = availabilityOpt.get();
        int currentReserved = Optional.ofNullable(availability.getTotalReserved()).orElse(0);
        int newReservedRooms = Math.max(0, currentReserved - roomsToRelease);
        availability.setTotalReserved(newReservedRooms);
        roomAvailabilityRepository.save(availability);

        log.debug("Released {} rooms for room type {} on date {}", roomsToRelease, roomType.getRoomTypeId(), date);
    }

    /**
     * Check if room is available for a specific date
     */
    private boolean isRoomAvailableForDate(RoomType roomType, LocalDate date, Integer roomCount) {
        int roomsRequested = normalizeRoomCount(roomCount);

        Optional<RoomAvailability> availabilityOpt = getAvailabilityRecord(roomType, date, false);

        if (availabilityOpt.isEmpty()) {
            int fallbackInventory = calculateTotalInventory(roomType);
            return fallbackInventory >= roomsRequested;
        }

        RoomAvailability availability = availabilityOpt.get();
        int availableRooms = remainingRooms(availability);

        return availableRooms >= roomsRequested;
    }

    /**
     * Rollback reservations for failed booking
     */
    private void rollbackReservations(RoomType roomType, LocalDate startDate, LocalDate endDate, Integer roomCount) {
        log.warn("Rolling back room reservations for room type {} from {} to {}", roomType.getRoomTypeId(), startDate, endDate);
        
        LocalDate currentDate = startDate;
        while (currentDate.isBefore(endDate)) {
            releaseRoomForDate(roomType, currentDate, roomCount);
            currentDate = currentDate.plusDays(1);
        }
    }

    @Transactional(readOnly = true)
    public AvailabilitySummary getAvailabilitySummary(Long hotelId, String roomTypeName, Integer roomCount,
                                                      LocalDate checkInDate, LocalDate checkOutDate) {
        int roomsRequested = normalizeRoomCount(roomCount);

        if (checkInDate == null || checkOutDate == null || !checkOutDate.isAfter(checkInDate)) {
            return AvailabilitySummary.unavailable("checkOutDate must be after checkInDate", roomsRequested, List.of());
        }

        Optional<RoomType> roomTypeOpt = roomTypeRepository.findByHotelIdAndTypeName(hotelId, roomTypeName);
        if (roomTypeOpt.isEmpty()) {
            return AvailabilitySummary.unavailable("Room type not found for hotel", roomsRequested, List.of());
        }

        RoomType roomType = roomTypeOpt.get();
        LocalDate endDate = checkOutDate.minusDays(1);

        List<RoomAvailability> availabilityRange = roomAvailabilityRepository
                .findByRoomTypeIdAndDateBetween(roomType.getRoomTypeId(), checkInDate, endDate);

        Map<LocalDate, RoomAvailability> availabilityByDate = availabilityRange.stream()
                .collect(Collectors.toMap(RoomAvailability::getDate, ra -> ra, (existing, replacement) -> existing));

        List<AvailabilityDetail> details = new ArrayList<>();

        int totalInventory = calculateTotalInventory(roomType);
        int minRemaining = Integer.MAX_VALUE;

        LocalDate cursor = checkInDate;
        while (!cursor.isAfter(endDate)) {
            RoomAvailability availability = availabilityByDate.get(cursor);

            int inventoryForDate = availability != null
                    ? Optional.ofNullable(availability.getTotalInventory()).orElse(totalInventory)
                    : totalInventory;

            int reservedForDate = availability != null
                    ? Optional.ofNullable(availability.getTotalReserved()).orElse(0)
                    : 0;

            int remaining = Math.max(inventoryForDate - reservedForDate, 0);
            minRemaining = Math.min(minRemaining, remaining);

            details.add(new AvailabilityDetail(cursor, inventoryForDate, reservedForDate, remaining));

            cursor = cursor.plusDays(1);
        }

        if (details.isEmpty()) {
            // No records yet; treat as full inventory if rooms exist
            if (totalInventory <= 0) {
                return AvailabilitySummary.unavailable("No active rooms configured for this room type", roomsRequested, List.of());
            }

            LocalDate tempCursor = checkInDate;
            while (tempCursor.isBefore(checkOutDate)) {
                details.add(new AvailabilityDetail(tempCursor, totalInventory, 0, totalInventory));
                tempCursor = tempCursor.plusDays(1);
            }
            minRemaining = totalInventory;
        } else if (minRemaining == Integer.MAX_VALUE) {
            minRemaining = totalInventory;
        }

        boolean available = minRemaining >= roomsRequested && minRemaining > 0;
        String message = available
                ? "Rooms available for the requested stay"
                : "Only %d room(s) available across the requested dates".formatted(Math.max(minRemaining, 0));

        return new AvailabilitySummary(available, roomsRequested, Math.max(minRemaining, 0), details, message);
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
            Optional<RoomType> roomTypeOpt = roomTypeRepository.findById(roomTypeId);
            if (roomTypeOpt.isEmpty()) {
                return 0;
            }

            Optional<RoomAvailability> availabilityOpt = getAvailabilityRecord(roomTypeOpt.get(), date, false);

            if (availabilityOpt.isEmpty()) {
                return calculateTotalInventory(roomTypeOpt.get());
            }

            RoomAvailability availability = availabilityOpt.get();
            return remainingRooms(availability);
            
        } catch (Exception e) {
            log.error("Error getting available rooms for room type {} on date {}: {}", 
                    roomTypeId, date, e.getMessage(), e);
            return 0;
        }
    }

    private Optional<RoomAvailability> getAvailabilityRecord(RoomType roomType, LocalDate date, boolean createWhenMissing) {
        if (roomType == null || roomType.getRoomTypeId() == null) {
            return Optional.empty();
        }

        Optional<RoomAvailability> existing = roomAvailabilityRepository
                .findByRoomTypeIdAndDate(roomType.getRoomTypeId(), date);

        if (existing.isPresent() || !createWhenMissing) {
            return existing;
        }

        int totalInventory = calculateTotalInventory(roomType);
        if (totalInventory <= 0) {
            log.warn("Cannot initialize availability for room type {} on {} because total inventory is {}", roomType.getRoomTypeId(), date, totalInventory);
            return Optional.empty();
        }

        RoomAvailability availability = new RoomAvailability();
        availability.setRoomTypeId(roomType.getRoomTypeId());
        availability.setDate(date);
        availability.setTotalInventory(totalInventory);
        availability.setTotalReserved(0);

        try {
            return Optional.of(roomAvailabilityRepository.save(availability));
        } catch (DataIntegrityViolationException ex) {
            log.debug("Availability record for room type {} on {} already exists, re-fetching",
                    roomType.getRoomTypeId(), date);
            return roomAvailabilityRepository.findByRoomTypeIdAndDate(roomType.getRoomTypeId(), date);
        }
    }

    private int calculateTotalInventory(RoomType roomType) {
        if (roomType == null || roomType.getRoomTypeId() == null) {
            return 0;
        }

        long activeRooms = roomRepository.countActiveRoomsByRoomType(roomType.getRoomTypeId());
        if (activeRooms > Integer.MAX_VALUE) {
            log.warn("Room type {} has more rooms than supported integer range ({}). Capping value.", roomType.getRoomTypeId(), activeRooms);
            return Integer.MAX_VALUE;
        }

        return (int) activeRooms;
    }

    private int normalizeRoomCount(Integer roomCount) {
        return (roomCount == null || roomCount < 1) ? 1 : roomCount;
    }

    public record AvailabilityDetail(LocalDate date, int totalInventory, int totalReserved, int remaining) {}

    public record AvailabilitySummary(boolean available, int requestedRooms, int roomsAvailable,
                                      List<AvailabilityDetail> dailyDetails, String message) {

        public static AvailabilitySummary unavailable(String message, int requestedRooms, List<AvailabilityDetail> details) {
            return new AvailabilitySummary(false, requestedRooms, 0, details, message);
        }
    }

    @Transactional
    public void refreshAvailabilityForRange(RoomType roomType, LocalDate startDate, LocalDate endDateInclusive) {
        if (roomType == null || roomType.getRoomTypeId() == null) {
            return;
        }

        LocalDate effectiveStart = Optional.ofNullable(startDate).orElse(LocalDate.now());
        LocalDate effectiveEnd = Optional.ofNullable(endDateInclusive).orElse(effectiveStart);
        LocalDate checkOutDate = effectiveEnd.plusDays(1);

        refreshRoomAvailabilityFlag(roomType, effectiveStart, checkOutDate);
    }
}
