package com.pdh.hotel.service;

import com.pdh.common.dto.response.MediaResponse;
import com.pdh.hotel.dto.request.RoomTypeRequestDto;
import com.pdh.hotel.dto.response.RoomTypeListResponseDto;
import com.pdh.hotel.dto.response.RoomTypeResponseDto;
import com.pdh.hotel.dto.response.RoomTypeSingleResponseDto;
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
@Transactional
public class BackofficeRoomTypeService {

    private final RoomTypeRepository roomTypeRepository;
    private final HotelRepository hotelRepository;
    private final ImageService imageService;
    private final RoomTypeMapper roomTypeMapper;

    /**
     * Get all room types for a hotel
     */
    @Transactional(readOnly = true)
    public RoomTypeListResponseDto getRoomTypesByHotel(Long hotelId) {
        log.info("Fetching room types for hotel ID: {}", hotelId);
        
        if (!hotelRepository.existsById(hotelId)) {
            throw new EntityNotFoundException("Hotel not found with ID: " + hotelId);
        }
        
        List<RoomType> roomTypes = roomTypeRepository.findByHotelId(hotelId);
        List<RoomTypeResponseDto> roomTypeDtos = roomTypes.stream()
            .map(roomTypeMapper::toResponseDto)
            .collect(Collectors.toList());
        
        return RoomTypeListResponseDto.builder()
            .roomTypes(roomTypeDtos)
            .total(roomTypes.size())
            .build();
    }

    /**
     * Get room type by ID
     */
    @Transactional(readOnly = true)
    public RoomTypeSingleResponseDto getRoomType(Long id) {
        RoomType roomType = roomTypeRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Room type not found with ID: " + id));
        
        RoomTypeResponseDto roomTypeDto = roomTypeMapper.toResponseDto(roomType);
        
        return RoomTypeSingleResponseDto.builder()
            .roomType(roomTypeDto)
            .build();
    }

    /**
     * Get suitable room types for a specific number of guests
     */
    @Transactional(readOnly = true)
    public RoomTypeListResponseDto getSuitableRoomTypes(Long hotelId, int guestCount) {
        log.info("Fetching suitable room types for hotel ID: {} and {} guests", hotelId, guestCount);
        
        if (!hotelRepository.existsById(hotelId)) {
            throw new EntityNotFoundException("Hotel not found with ID: " + hotelId);
        }
        
        List<RoomType> roomTypes = roomTypeRepository.findSuitableRoomTypes(hotelId, guestCount);
        List<RoomTypeResponseDto> roomTypeDtos = roomTypes.stream()
            .map(roomTypeMapper::toResponseDto)
            .collect(Collectors.toList());
        
        return RoomTypeListResponseDto.builder()
            .roomTypes(roomTypeDtos)
            .total(roomTypes.size())
            .build();
    }

    /**
     * Create a new room type for a hotel
     */
    public RoomTypeSingleResponseDto createRoomType(Long hotelId, RoomTypeRequestDto roomTypeRequestDto) {
        log.info("Creating new room type for hotel ID: {}", hotelId);
        
        Hotel hotel = hotelRepository.findById(hotelId)
            .orElseThrow(() -> new EntityNotFoundException("Hotel not found with ID: " + hotelId));
        
        RoomType roomType = new RoomType();
        roomType.setName(roomTypeRequestDto.getName());
        roomType.setDescription(roomTypeRequestDto.getDescription());
        roomType.setCapacityAdults(roomTypeRequestDto.getCapacityAdults());
        roomType.setBasePrice(roomTypeRequestDto.getBasePrice());
        roomType.setHotel(hotel);
        
        RoomType savedRoomType = roomTypeRepository.save(roomType);
        
        // Handle media associations
        if (roomTypeRequestDto.getMedia() != null && !roomTypeRequestDto.getMedia().isEmpty()) {
            try {
                imageService.updateRoomTypeImagesWithMediaResponse(savedRoomType.getRoomTypeId(), roomTypeRequestDto.getMedia());
                log.info("Associated {} media items with room type ID: {}", roomTypeRequestDto.getMedia().size(), savedRoomType.getRoomTypeId());
            } catch (Exception e) {
                log.error("Error associating media with room type {}: {}", savedRoomType.getRoomTypeId(), e.getMessage());
            }
        }
        
        RoomTypeResponseDto roomTypeDto = roomTypeMapper.toResponseDto(savedRoomType);
        
        return RoomTypeSingleResponseDto.builder()
            .roomType(roomTypeDto)
            .message("Room type created successfully")
            .build();
    }

    /**
     * Update an existing room type
     */
    public RoomTypeSingleResponseDto updateRoomType(Long id, RoomTypeRequestDto roomTypeRequestDto) {
        log.info("Updating room type ID: {}", id);
        
        RoomType roomType = roomTypeRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Room type not found with ID: " + id));
        
        if (roomTypeRequestDto.getName() != null) {
            roomType.setName(roomTypeRequestDto.getName());
        }
        if (roomTypeRequestDto.getDescription() != null) {
            roomType.setDescription(roomTypeRequestDto.getDescription());
        }
        if (roomTypeRequestDto.getCapacityAdults() != null) {
            roomType.setCapacityAdults(roomTypeRequestDto.getCapacityAdults());
        }
        if (roomTypeRequestDto.getBasePrice() != null) {
            roomType.setBasePrice(roomTypeRequestDto.getBasePrice());
        }
        
        RoomType updatedRoomType = roomTypeRepository.save(roomType);
        
        // Handle media associations
        if (roomTypeRequestDto.getMedia() != null) {
            try {
                imageService.updateRoomTypeImagesWithMediaResponse(id, roomTypeRequestDto.getMedia());
                log.info("Updated {} media items for room type ID: {}", roomTypeRequestDto.getMedia().size(), id);
            } catch (Exception e) {
                log.error("Error updating media for room type {}: {}", id, e.getMessage());
            }
        }
        
        RoomTypeResponseDto roomTypeDto = roomTypeMapper.toResponseDto(updatedRoomType);
        
        return RoomTypeSingleResponseDto.builder()
            .roomType(roomTypeDto)
            .message("Room type updated successfully")
            .build();
    }

    /**
     * Delete a room type
     */
    public void deleteRoomType(Long id) {
        log.info("Deleting room type ID: {}", id);
        
        RoomType roomType = roomTypeRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Room type not found with ID: " + id));
        
        // Remove image associations
        try {
            imageService.updateRoomTypeImagesWithMediaResponse(id, Collections.emptyList());
        } catch (Exception e) {
            log.error("Error removing images for deleted room type {}: {}", id, e.getMessage());
        }
        
        roomTypeRepository.delete(roomType);
    }
}
