package com.pdh.hotel.service;

import com.pdh.hotel.dto.request.RoomTypeRequestDto;
import com.pdh.hotel.dto.response.RoomTypeResponseDto;
import com.pdh.hotel.mapper.RoomTypeMapper;
import com.pdh.hotel.model.Hotel;
import com.pdh.hotel.model.RoomType;
import com.pdh.hotel.repository.HotelRepository;
import com.pdh.hotel.repository.RoomTypeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Slf4j
public class RoomTypeService {
    
    private final RoomTypeRepository roomTypeRepository;
    private final HotelRepository hotelRepository;
    private final RoomTypeMapper roomTypeMapper;
    private final ImageService imageService;
    
    /**
     * Get all room types for a hotel
     */
    @Transactional(readOnly = true)
    public List<RoomTypeResponseDto> getRoomTypesByHotel(Long hotelId) {
        log.debug("Fetching room types for hotel ID: {}", hotelId);
        
        if (!hotelRepository.existsById(hotelId)) {
            throw new EntityNotFoundException("Hotel not found with ID: " + hotelId);
        }
        
        List<RoomType> roomTypes = roomTypeRepository.findByHotelId(hotelId);
        return roomTypes.stream()
                .map(roomTypeMapper::toResponseDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Get room type by ID
     */
    @Transactional(readOnly = true)
    public RoomTypeResponseDto getRoomTypeById(Long id) {
        log.debug("Fetching room type by ID: {}", id);
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room type not found with ID: " + id));
        return roomTypeMapper.toResponseDto(roomType);
    }
    
    /**
     * Get room types suitable for a specific number of guests
     */
    @Transactional(readOnly = true)
    public List<RoomTypeResponseDto> getSuitableRoomTypes(Long hotelId, Integer guestCount) {
        log.debug("Fetching suitable room types for hotel ID: {} and {} guests", hotelId, guestCount);
        
        if (!hotelRepository.existsById(hotelId)) {
            throw new EntityNotFoundException("Hotel not found with ID: " + hotelId);
        }
        
        List<RoomType> roomTypes = roomTypeRepository.findSuitableRoomTypes(hotelId, guestCount);
        return roomTypes.stream()
                .map(roomTypeMapper::toResponseDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Create a new room type for a hotel
     */
    @Transactional
    public RoomTypeResponseDto createRoomType(Long hotelId, RoomTypeRequestDto requestDto) {
        log.info("Creating new room type for hotel ID: {} with data: {}", hotelId, requestDto);
        
        // Validate input
        if (hotelId == null) {
            throw new IllegalArgumentException("Hotel ID cannot be null");
        }
        if (requestDto == null) {
            throw new IllegalArgumentException("Room type request data cannot be null");
        }
        
        // Validate base price precision (max 8 digits before decimal point)
        if (requestDto.getBasePrice() != null) {
            if (requestDto.getBasePrice().precision() - requestDto.getBasePrice().scale() > 8) {
                throw new IllegalArgumentException("Base price value is too large. Maximum allowed is 99,999,999.99");
            }
        }
        
        // Validate hotel exists
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new EntityNotFoundException("Hotel not found with ID: " + hotelId));

        log.debug("Found hotel: {} for room type creation", hotel.getName());
        
        // Check if room type name already exists for this hotel
        if (roomTypeRepository.existsByHotelIdAndTypeName(hotelId, requestDto.getName())) {
            throw new IllegalArgumentException("Room type with name '" + requestDto.getName() + "' already exists for this hotel");
        }
        
        // Create room type entity
        RoomType roomType = roomTypeMapper.toEntity(requestDto);
        roomType.setHotel(hotel);
        
        log.debug("About to save room type with hotel ID: {}", hotel.getHotelId());
        
        RoomType savedRoomType = roomTypeRepository.save(roomType);
        log.info("Room type created successfully with ID: {}", savedRoomType.getRoomTypeId());

        // Associate media with the newly created room type if provided
        if (requestDto.getMedia() != null && !requestDto.getMedia().isEmpty()) {
            try {
                imageService.updateRoomTypeImagesWithMediaResponse(savedRoomType.getRoomTypeId(), requestDto.getMedia());
                log.info("Associated {} media items with room type ID: {}", requestDto.getMedia().size(), savedRoomType.getRoomTypeId());
            } catch (Exception e) {
                log.error("Error associating media with room type {}: {}", savedRoomType.getRoomTypeId(), e.getMessage());
                // Don't fail the room type creation if media association fails
            }
        }
        
        return roomTypeMapper.toResponseDto(savedRoomType);
    }
    
    /**
     * Update an existing room type
     */
    @Transactional
    public RoomTypeResponseDto updateRoomType(Long id, RoomTypeRequestDto requestDto) {
        log.info("Updating room type with ID: {}", id);
        
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room type not found with ID: " + id));
        
        // Check if the new name conflicts with existing room types (excluding current one)
        Long hotelId = roomType.getHotel().getHotelId();
        if (!roomType.getName().equals(requestDto.getName()) && 
            roomTypeRepository.existsByHotelIdAndTypeName(hotelId, requestDto.getName())) {
            throw new IllegalArgumentException("Room type with name '" + requestDto.getName() + "' already exists for this hotel");
        }
        
        // Update room type fields
        roomTypeMapper.updateEntity(roomType, requestDto);
        
        RoomType updatedRoomType = roomTypeRepository.save(roomType);
        log.info("Room type updated successfully with ID: {}", id);

        // Update media associations if provided
        if (requestDto.getMedia() != null) {
            try {
                if (requestDto.getMedia().isEmpty()) {
                    // Remove all media associations
                    imageService.updateRoomTypeImagesWithMediaResponse(id, Collections.emptyList());
                    log.info("Removed all media associations for room type ID: {}", id);
                } else {
                    // Update media associations
                    imageService.updateRoomTypeImagesWithMediaResponse(id, requestDto.getMedia());
                    log.info("Updated {} media associations for room type ID: {}", requestDto.getMedia().size(), id);
                }
            } catch (Exception e) {
                log.error("Error updating media associations for room type {}: {}", id, e.getMessage());
                // Don't fail the room type update if media association fails
            }
        }
        
        return roomTypeMapper.toResponseDto(updatedRoomType);
    }
    
    /**
     * Delete a room type
     */
    @Transactional
    public void deleteRoomType(Long id) {
        log.info("Deleting room type with ID: {}", id);
        
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room type not found with ID: " + id));
        
        // Check if room type is being used by any rooms
        if (!roomType.getRooms().isEmpty()) {
            throw new IllegalStateException("Cannot delete room type that is being used by " + 
                                          roomType.getRooms().size() + " room(s). Please reassign or delete those rooms first.");
        }
        
        roomTypeRepository.delete(roomType);
        log.info("Room type deleted successfully with ID: {}", id);
    }
}
