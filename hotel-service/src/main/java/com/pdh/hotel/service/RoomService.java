package com.pdh.hotel.service;

import com.pdh.hotel.dto.request.RoomRequestDto;
import com.pdh.hotel.dto.response.RoomResponseDto;
import com.pdh.hotel.mapper.RoomMapper;
import com.pdh.hotel.model.*;
import com.pdh.hotel.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RoomService {
    
    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final AmenityRepository amenityRepository;
    private final RoomMapper roomMapper;
    private final ImageService imageService;


    /**
     * Get all rooms for a hotel with pagination
     */
    @Transactional(readOnly = true)
    public Page<RoomResponseDto> getRoomsByHotel(Long hotelId, Pageable pageable) {
        log.debug("Fetching rooms for hotel ID: {}", hotelId);
        
        if (!hotelRepository.existsById(hotelId)) {
            throw new EntityNotFoundException("Hotel not found with ID: " + hotelId);
        }
        
        Page<Room> rooms = roomRepository.findAvailableRoomsByHotelId(hotelId, pageable);
        return rooms.map(roomMapper::toResponseDto);
    }
    
    /**
     * Get room by ID
     */
    @Transactional(readOnly = true)
    public RoomResponseDto getRoomById(Long id) {
        log.debug("Fetching room by ID: {}", id);
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room not found with ID: " + id));
        return roomMapper.toResponseDto(room);
    }
    
    /**
     * Create a new room for a hotel
     */
    public RoomResponseDto createRoom(Long hotelId, RoomRequestDto requestDto) {
        log.info("Creating new room for hotel ID: {}", hotelId);
        
        // Validate hotel exists
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new EntityNotFoundException("Hotel not found with ID: " + hotelId));
        
        // Validate room type exists
        RoomType roomType = null;
        if (requestDto.getRoomTypeId() != null) {
            roomType = roomTypeRepository.findById(requestDto.getRoomTypeId())
                    .orElseThrow(() -> new EntityNotFoundException("Room type not found with ID: " + requestDto.getRoomTypeId()));
        }
        
        // Create room entity
        Room room = roomMapper.toEntity(requestDto);
        room.setHotel(hotel);
        room.setRoomType(roomType);
        
        // Handle amenities if provided
        if (requestDto.getAmenityIds() != null && !requestDto.getAmenityIds().isEmpty()) {
            List<Amenity> amenities = amenityRepository.findActiveAmenitiesByIds(requestDto.getAmenityIds());
            List<RoomAmenity> roomAmenities = new ArrayList<>();
            
            for (Amenity amenity : amenities) {
                RoomAmenity roomAmenity = new RoomAmenity();
                roomAmenity.setRoom(room);
                roomAmenity.setAmenity(amenity);
                roomAmenities.add(roomAmenity);
            }
            room.setRoomAmenities(roomAmenities);
        }
        
        Room savedRoom = roomRepository.save(room);
        log.info("Room created successfully with ID: {}", savedRoom.getId());

        // Associate media with the newly created room if provided
        if (requestDto.getMedia() != null && !requestDto.getMedia().isEmpty()) {
            try {
                imageService.updateRoomImagesWithMediaResponse(savedRoom.getId(), requestDto.getMedia());
                log.info("Associated {} media items with room ID: {}", requestDto.getMedia().size(), savedRoom.getId());
            } catch (Exception e) {
                log.error("Error associating media with room {}: {}", savedRoom.getId(), e.getMessage());
                // Don't fail the room creation if media association fails
            }
        }
        
        return roomMapper.toResponseDto(savedRoom);
    }
    
    /**
     * Update an existing room
     */
    public RoomResponseDto updateRoom(Long id, RoomRequestDto requestDto) {
        log.info("Updating room with ID: {}", id);
        
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room not found with ID: " + id));
        
        // Update room type if changed
        if (requestDto.getRoomTypeId() != null && 
            (room.getRoomType() == null || !room.getRoomType().getRoomTypeId().equals(requestDto.getRoomTypeId()))) {
            RoomType roomType = roomTypeRepository.findById(requestDto.getRoomTypeId())
                    .orElseThrow(() -> new EntityNotFoundException("Room type not found with ID: " + requestDto.getRoomTypeId()));
            room.setRoomType(roomType);
        }
        
        // Update basic fields
        roomMapper.updateEntity(room, requestDto);
        
        // Update amenities if provided
        if (requestDto.getAmenityIds() != null) {
            // Clear existing amenities
            room.getRoomAmenities().clear();
            
            if (!requestDto.getAmenityIds().isEmpty()) {
                List<Amenity> amenities = amenityRepository.findActiveAmenitiesByIds(requestDto.getAmenityIds());
                List<RoomAmenity> roomAmenities = new ArrayList<>();
                
                for (Amenity amenity : amenities) {
                    RoomAmenity roomAmenity = new RoomAmenity();
                    roomAmenity.setRoom(room);
                    roomAmenity.setAmenity(amenity);
                    roomAmenities.add(roomAmenity);
                }
                room.setRoomAmenities(roomAmenities);
            }
        }

        
        Room updatedRoom = roomRepository.save(room);
        log.info("Room updated successfully with ID: {}", id);

        // Update media associations if provided
        if (requestDto.getMedia() != null) {
            try {
                if (requestDto.getMedia().isEmpty()) {
                    // Remove all media associations
                    imageService.updateRoomImagesWithMediaResponse(id, Collections.emptyList());
                    log.info("Removed all media associations for room ID: {}", id);
                } else {
                    // Update media associations
                    imageService.updateRoomImagesWithMediaResponse(id, requestDto.getMedia());
                    log.info("Updated {} media associations for room ID: {}", requestDto.getMedia().size(), id);
                }
            } catch (Exception e) {
                log.error("Error updating media associations for room {}: {}", id, e.getMessage());
                // Don't fail the room update if media association fails
            }
        }
        
        return roomMapper.toResponseDto(updatedRoom);
    }
    
    /**
     * Delete a room
     */
    public void deleteRoom(Long id) {
        log.info("Deleting room with ID: {}", id);
        
        if (!roomRepository.existsById(id)) {
            throw new EntityNotFoundException("Room not found with ID: " + id);
        }
        
        roomRepository.deleteById(id);
        log.info("Room deleted successfully with ID: {}", id);
    }
    
    /**
     * Toggle room availability
     */
    public RoomResponseDto toggleRoomAvailability(Long id, boolean isAvailable) {
        log.info("Toggling room availability for ID: {} to {}", id, isAvailable);
        
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room not found with ID: " + id));
        
        room.setIsAvailable(isAvailable);
        Room updatedRoom = roomRepository.save(room);
        
        log.info("Room availability updated successfully for ID: {}", id);
        return roomMapper.toResponseDto(updatedRoom);
    }
    
    /**
     * Get available rooms count for a hotel
     */
    @Transactional(readOnly = true)
    public Long getAvailableRoomsCount(Long hotelId) {
        log.debug("Getting available rooms count for hotel ID: {}", hotelId);
        return roomRepository.countAvailableRoomsByHotelId(hotelId);
    }
    
    /**
     * Bulk update room availability
     */
    public void bulkUpdateAvailability(List<Long> roomIds, boolean isAvailable) {
        log.info("Bulk updating availability for {} rooms to {}", roomIds.size(), isAvailable);
        
        for (Long roomId : roomIds) {
            Room room = roomRepository.findById(roomId)
                    .orElseThrow(() -> new EntityNotFoundException("Room not found with ID: " + roomId));
            room.setIsAvailable(isAvailable);
            roomRepository.save(room);
        List<Room> rooms = roomRepository.findAllById(roomIds);
        if (rooms.size() != roomIds.size()) {
            // Find missing IDs
            List<Long> foundIds = new ArrayList<>();
            for (Room room1 : rooms) {
                foundIds.add(room1.getId());
            }
            List<Long> missingIds = new ArrayList<>(roomIds);
            missingIds.removeAll(foundIds);
            throw new EntityNotFoundException("Rooms not found with IDs: " + missingIds);
        }
        for (Room room2 : rooms) {
            room2.setIsAvailable(isAvailable);
        }
        roomRepository.saveAll(rooms);
        
        log.info("Bulk availability update completed for {} rooms", roomIds.size());
        }
    }
    public BigDecimal calculateMinRoomPerNightByHotel(Long hotelId){
        return roomRepository.findMinPriceByHotelId(hotelId);
    }
}
