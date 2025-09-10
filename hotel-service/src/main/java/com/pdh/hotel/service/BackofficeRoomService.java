package com.pdh.hotel.service;

import com.pdh.common.dto.response.MediaResponse;
import com.pdh.hotel.dto.request.RoomRequestDto;
import com.pdh.hotel.dto.response.RoomResponseDto;
import com.pdh.hotel.dto.response.RoomListResponseDto;
import com.pdh.hotel.dto.response.RoomSingleResponseDto;
import com.pdh.hotel.mapper.RoomMapper;
import com.pdh.hotel.model.*;
import com.pdh.hotel.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BackofficeRoomService {

    private final RoomRepository roomRepository;
    private final HotelRepository hotelRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final AmenityRepository amenityRepository;
    private final RoomAmenityRepository roomAmenityRepository;
    private final ImageService imageService;
    private final RoomMapper roomMapper;

    /**
     * Get all rooms for a hotel with pagination (legacy method for compatibility)
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getRoomsByHotel(Long hotelId, int page, int size, String sortBy, String sortDirection) {
        log.info("Fetching rooms for hotel ID: {} with pagination", hotelId);
        
        if (!hotelRepository.existsById(hotelId)) {
            throw new EntityNotFoundException("Hotel not found with ID: " + hotelId);
        }
        
        Sort.Direction direction = Sort.Direction.fromString(sortDirection != null ? sortDirection : "ASC");
        Sort sort = Sort.by(direction, sortBy != null ? sortBy : "roomNumber");
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Room> roomPage = roomRepository.findByHotelId(hotelId, pageable);
        
        List<Map<String, Object>> rooms = roomPage.getContent().stream()
            .map(this::convertRoomToResponse)
            .collect(Collectors.toList());
        
        Map<String, Object> response = new HashMap<>();
        response.put("content", rooms);
        response.put("totalElements", roomPage.getTotalElements());
        response.put("totalPages", roomPage.getTotalPages());
        response.put("size", roomPage.getSize());
        response.put("number", roomPage.getNumber());
        response.put("first", roomPage.isFirst());
        response.put("last", roomPage.isLast());
        
        return response;
    }

    /**
     * Get all rooms for a hotel with pagination using DTOs
     */
    @Transactional(readOnly = true)
    public RoomListResponseDto getRoomsByHotelDto(Long hotelId, int page, int size, String sortBy, String sortDirection) {
        log.info("Fetching rooms for hotel ID: {} with pagination using DTOs", hotelId);
        
        if (!hotelRepository.existsById(hotelId)) {
            throw new EntityNotFoundException("Hotel not found with ID: " + hotelId);
        }
        
        Sort.Direction direction = Sort.Direction.fromString(sortDirection != null ? sortDirection : "ASC");
        Sort sort = Sort.by(direction, sortBy != null ? sortBy : "roomNumber");
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<Room> roomPage = roomRepository.findByHotelId(hotelId, pageable);
        List<RoomResponseDto> roomDtos = roomMapper.toResponseDtoList(roomPage.getContent());
        
        return RoomListResponseDto.builder()
            .rooms(roomDtos)
            .totalElements(roomPage.getTotalElements())
            .totalPages(roomPage.getTotalPages())
            .size(roomPage.getSize())
            .number(roomPage.getNumber())
            .first(roomPage.isFirst())
            .last(roomPage.isLast())
            .build();
    }

    /**
     * Get room by ID
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getRoom(Long id) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Room not found with ID: " + id));
        
        return convertRoomToResponse(room);
    }

    /**
     * Get room by ID using DTO
     */
    @Transactional(readOnly = true)
    public RoomSingleResponseDto getRoomDto(Long id) {
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Room not found with ID: " + id));
        
        RoomResponseDto roomDto = roomMapper.toResponseDto(room);
        
        return RoomSingleResponseDto.builder()
            .room(roomDto)
            .build();
    }

    /**
     * Create a new room
     */
    public Map<String, Object> createRoom(Long hotelId, RoomRequestDto roomRequestDto) {
        log.info("Creating new room for hotel ID: {}", hotelId);
        
        Hotel hotel = hotelRepository.findById(hotelId)
            .orElseThrow(() -> new EntityNotFoundException("Hotel not found with ID: " + hotelId));
        
        RoomType roomType = roomTypeRepository.findById(roomRequestDto.getRoomTypeId())
            .orElseThrow(() -> new EntityNotFoundException("Room type not found with ID: " + roomRequestDto.getRoomTypeId()));
        
        Room room = new Room();
        room.setRoomNumber(roomRequestDto.getRoomNumber());
        room.setHotel(hotel);
        room.setRoomType(roomType);
        room.setDescription(roomRequestDto.getDescription());
        room.setPrice(roomRequestDto.getPrice());
        room.setMaxOccupancy(roomRequestDto.getMaxOccupancy());
        room.setBedType(roomRequestDto.getBedType());
        room.setRoomSize(roomRequestDto.getRoomSize());
        room.setIsAvailable(roomRequestDto.getIsAvailable());
        
        Room savedRoom = roomRepository.save(room);
        
        // Handle amenity associations
        if (roomRequestDto.getAmenityIds() != null && !roomRequestDto.getAmenityIds().isEmpty()) {
            updateRoomAmenities(savedRoom.getId(), roomRequestDto.getAmenityIds());
        }
        
        // Handle media associations
        if (roomRequestDto.getMedia() != null && !roomRequestDto.getMedia().isEmpty()) {
            try {
                imageService.updateRoomImagesWithMediaResponse(savedRoom.getId(), roomRequestDto.getMedia());
                log.info("Associated {} media items with room ID: {}", roomRequestDto.getMedia().size(), savedRoom.getId());
            } catch (Exception e) {
                log.error("Error associating media with room {}: {}", savedRoom.getId(), e.getMessage());
            }
        }
        
        Map<String, Object> response = convertRoomToResponse(savedRoom);
        response.put("message", "Room created successfully");
        return response;
    }

    /**
     * Create a new room using DTOs
     */
    public RoomSingleResponseDto createRoomDto(Long hotelId, RoomRequestDto roomRequestDto) {
        log.info("Creating new room for hotel ID: {} using DTOs", hotelId);
        
        Hotel hotel = hotelRepository.findById(hotelId)
            .orElseThrow(() -> new EntityNotFoundException("Hotel not found with ID: " + hotelId));
        
        RoomType roomType = roomTypeRepository.findById(roomRequestDto.getRoomTypeId())
            .orElseThrow(() -> new EntityNotFoundException("Room type not found with ID: " + roomRequestDto.getRoomTypeId()));
        
        Room room = new Room();
        room.setRoomNumber(roomRequestDto.getRoomNumber());
        room.setHotel(hotel);
        room.setRoomType(roomType);
        room.setDescription(roomRequestDto.getDescription());
        room.setPrice(roomRequestDto.getPrice());
        room.setMaxOccupancy(roomRequestDto.getMaxOccupancy());
        room.setBedType(roomRequestDto.getBedType());
        room.setRoomSize(roomRequestDto.getRoomSize());
        room.setIsAvailable(roomRequestDto.getIsAvailable());
        
        Room savedRoom = roomRepository.save(room);
        
        // Handle amenity associations
        if (roomRequestDto.getAmenityIds() != null && !roomRequestDto.getAmenityIds().isEmpty()) {
            updateRoomAmenities(savedRoom.getId(), roomRequestDto.getAmenityIds());
        }
        
        // Handle media associations
        if (roomRequestDto.getMedia() != null && !roomRequestDto.getMedia().isEmpty()) {
            try {
                imageService.updateRoomImagesWithMediaResponse(savedRoom.getId(), roomRequestDto.getMedia());
                log.info("Associated {} media items with room ID: {}", roomRequestDto.getMedia().size(), savedRoom.getId());
            } catch (Exception e) {
                log.error("Error associating media with room {}: {}", savedRoom.getId(), e.getMessage());
            }
        }
        
        RoomResponseDto roomDto = roomMapper.toResponseDto(savedRoom);
        
        return RoomSingleResponseDto.builder()
            .room(roomDto)
            .message("Room created successfully")
            .build();
    }

    /**
     * Update an existing room
     */
    public Map<String, Object> updateRoom(Long id, RoomRequestDto roomRequestDto) {
        log.info("Updating room ID: {}", id);
        
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Room not found with ID: " + id));
        
        if (roomRequestDto.getRoomTypeId() != null) {
            RoomType roomType = roomTypeRepository.findById(roomRequestDto.getRoomTypeId())
                .orElseThrow(() -> new EntityNotFoundException("Room type not found with ID: " + roomRequestDto.getRoomTypeId()));
            room.setRoomType(roomType);
        }
        
        if (roomRequestDto.getRoomNumber() != null) {
            room.setRoomNumber(roomRequestDto.getRoomNumber());
        }
        if (roomRequestDto.getDescription() != null) {
            room.setDescription(roomRequestDto.getDescription());
        }
        if (roomRequestDto.getPrice() != null) {
            room.setPrice(roomRequestDto.getPrice());
        }
        if (roomRequestDto.getMaxOccupancy() != null) {
            room.setMaxOccupancy(roomRequestDto.getMaxOccupancy());
        }
        if (roomRequestDto.getBedType() != null) {
            room.setBedType(roomRequestDto.getBedType());
        }
        if (roomRequestDto.getRoomSize() != null) {
            room.setRoomSize(roomRequestDto.getRoomSize());
        }
        if (roomRequestDto.getIsAvailable() != null) {
            room.setIsAvailable(roomRequestDto.getIsAvailable());
        }
        
        Room updatedRoom = roomRepository.save(room);
        
        // Handle amenity associations
        if (roomRequestDto.getAmenityIds() != null) {
            updateRoomAmenities(id, roomRequestDto.getAmenityIds());
        }
        
        // Handle media associations
        if (roomRequestDto.getMedia() != null) {
            try {
                imageService.updateRoomImagesWithMediaResponse(id, roomRequestDto.getMedia());
                log.info("Updated {} media items for room ID: {}", roomRequestDto.getMedia().size(), id);
            } catch (Exception e) {
                log.error("Error updating media for room {}: {}", id, e.getMessage());
            }
        }
        
        Map<String, Object> response = convertRoomToResponse(updatedRoom);
        response.put("message", "Room updated successfully");
        return response;
    }

    /**
     * Update an existing room using DTOs
     */
    public RoomSingleResponseDto updateRoomDto(Long id, RoomRequestDto roomRequestDto) {
        log.info("Updating room ID: {} using DTOs", id);
        
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Room not found with ID: " + id));
        
        if (roomRequestDto.getRoomTypeId() != null) {
            RoomType roomType = roomTypeRepository.findById(roomRequestDto.getRoomTypeId())
                .orElseThrow(() -> new EntityNotFoundException("Room type not found with ID: " + roomRequestDto.getRoomTypeId()));
            room.setRoomType(roomType);
        }
        
        if (roomRequestDto.getRoomNumber() != null) {
            room.setRoomNumber(roomRequestDto.getRoomNumber());
        }
        if (roomRequestDto.getDescription() != null) {
            room.setDescription(roomRequestDto.getDescription());
        }
        if (roomRequestDto.getPrice() != null) {
            room.setPrice(roomRequestDto.getPrice());
        }
        if (roomRequestDto.getMaxOccupancy() != null) {
            room.setMaxOccupancy(roomRequestDto.getMaxOccupancy());
        }
        if (roomRequestDto.getBedType() != null) {
            room.setBedType(roomRequestDto.getBedType());
        }
        if (roomRequestDto.getRoomSize() != null) {
            room.setRoomSize(roomRequestDto.getRoomSize());
        }
        if (roomRequestDto.getIsAvailable() != null) {
            room.setIsAvailable(roomRequestDto.getIsAvailable());
        }
        
        Room updatedRoom = roomRepository.save(room);
        
        // Handle amenity associations
        if (roomRequestDto.getAmenityIds() != null) {
            updateRoomAmenities(id, roomRequestDto.getAmenityIds());
        }
        
        // Handle media associations
        if (roomRequestDto.getMedia() != null) {
            try {
                imageService.updateRoomImagesWithMediaResponse(id, roomRequestDto.getMedia());
                log.info("Updated {} media items for room ID: {}", roomRequestDto.getMedia().size(), id);
            } catch (Exception e) {
                log.error("Error updating media for room {}: {}", id, e.getMessage());
            }
        }
        
        RoomResponseDto roomDto = roomMapper.toResponseDto(updatedRoom);
        
        return RoomSingleResponseDto.builder()
            .room(roomDto)
            .message("Room updated successfully")
            .build();
    }

    /**
     * Delete a room (soft delete)
     */
    public void deleteRoom(Long id) {
        log.info("Deleting room ID: {}", id);
        
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Room not found with ID: " + id));
        
        // Soft delete
        room.setIsAvailable(false);
        roomRepository.save(room);
        
        // Optionally, remove image associations
        try {
            imageService.updateRoomImagesWithMediaResponse(id, Collections.emptyList());
        } catch (Exception e) {
            log.error("Error removing images for deleted room {}: {}", id, e.getMessage());
        }
    }

    /**
     * Toggle room availability
     */
    public Map<String, Object> toggleRoomAvailability(Long id, boolean isAvailable) {
        log.info("Toggling availability for room ID: {} to {}", id, isAvailable);
        
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Room not found with ID: " + id));
        
        room.setIsAvailable(isAvailable);
        Room updatedRoom = roomRepository.save(room);
        
        Map<String, Object> response = convertRoomToResponse(updatedRoom);
        response.put("message", "Room availability updated successfully");
        return response;
    }

    /**
     * Toggle room availability using DTOs
     */
    public RoomSingleResponseDto toggleRoomAvailabilityDto(Long id, boolean isAvailable) {
        log.info("Toggling availability for room ID: {} to {} using DTOs", id, isAvailable);
        
        Room room = roomRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Room not found with ID: " + id));
        
        room.setIsAvailable(isAvailable);
        Room updatedRoom = roomRepository.save(room);
        
        RoomResponseDto roomDto = roomMapper.toResponseDto(updatedRoom);
        
        return RoomSingleResponseDto.builder()
            .room(roomDto)
            .message("Room availability updated successfully")
            .build();
    }

    /**
     * Bulk update room availability
     */
    public void bulkUpdateAvailability(List<Long> roomIds, boolean isAvailable) {
        log.info("Bulk updating availability for {} rooms to {}", roomIds.size(), isAvailable);
        
        List<Room> rooms = roomRepository.findAllById(roomIds);
        rooms.forEach(room -> room.setIsAvailable(isAvailable));
        roomRepository.saveAll(rooms);
    }

    /**
     * Get available rooms count for a hotel
     */
    @Transactional(readOnly = true)
    public long getAvailableRoomsCount(Long hotelId) {
        return roomRepository.countAvailableRoomsByHotelId(hotelId);
    }

    /**
     * Update room amenities
     */
    private void updateRoomAmenities(Long roomId, List<Long> amenityIds) {
        if (amenityIds == null) amenityIds = Collections.emptyList();
        
        // Validate amenity IDs
        List<Amenity> amenities = amenityIds.isEmpty() ? 
            Collections.emptyList() : 
            amenityRepository.findActiveAmenitiesByIds(amenityIds);
        
        Set<Long> validIds = amenities.stream()
            .map(Amenity::getAmenityId)
            .collect(Collectors.toSet());
        
        // Replace existing mappings
        roomAmenityRepository.deleteByRoomId(roomId);
        
        if (!validIds.isEmpty()) {
            Room room = roomRepository.findById(roomId).orElse(null);
            if (room != null) {
                List<RoomAmenity> mappings = validIds.stream()
                    .map(amenityId -> {
                        Amenity amenity = amenityRepository.findById(amenityId).orElse(null);
                        if (amenity != null) {
                            RoomAmenity roomAmenity = new RoomAmenity();
                            roomAmenity.setRoom(room);
                            roomAmenity.setAmenity(amenity);
                            roomAmenity.setIsActive(true);
                            return roomAmenity;
                        }
                        return null;
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
                roomAmenityRepository.saveAll(mappings);
            }
        }
    }

    /**
     * Convert Room entity to response format
     */
    private Map<String, Object> convertRoomToResponse(Room room) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", room.getId());
        response.put("roomNumber", room.getRoomNumber() != null ? room.getRoomNumber() : "");
        response.put("description", room.getDescription() != null ? room.getDescription() : "");
        response.put("price", room.getPrice() != null ? room.getPrice().doubleValue() : 0.0);
        response.put("maxOccupancy", room.getMaxOccupancy() != null ? room.getMaxOccupancy() : 0);
        response.put("bedType", room.getBedType() != null ? room.getBedType() : "");
        response.put("roomSize", room.getRoomSize() != null ? room.getRoomSize() : 0);
        response.put("isAvailable", room.getIsAvailable() != null ? room.getIsAvailable() : false);
        response.put("hotelId", room.getHotel() != null ? room.getHotel().getHotelId() : null);
        response.put("hotelName", room.getHotel() != null ? room.getHotel().getName() : "");
        
        // Room type information
        if (room.getRoomType() != null) {
            Map<String, Object> roomTypeInfo = new HashMap<>();
            roomTypeInfo.put("id", room.getRoomType().getRoomTypeId());
            roomTypeInfo.put("name", room.getRoomType().getName());
            roomTypeInfo.put("description", room.getRoomType().getDescription());
            roomTypeInfo.put("basePrice", room.getRoomType().getBasePrice() != null ? 
                room.getRoomType().getBasePrice().doubleValue() : 0.0);
            response.put("roomType", roomTypeInfo);
            response.put("roomTypeId", room.getRoomType().getRoomTypeId());
        }
        
        // Get amenities
        List<Amenity> amenities = roomAmenityRepository.findAmenitiesByRoomId(room.getId());
        if (amenities == null) {
            amenities = Collections.emptyList();
        }
        List<Map<String, Object>> amenityList = amenities.stream()
            .map(this::convertAmenityToResponse)
            .collect(Collectors.toList());
        response.put("amenities", amenityList);
        response.put("amenityIds", amenities.stream().map(Amenity::getAmenityId).collect(Collectors.toList()));
        
        // Get images
        List<Long> mediaIds = imageService.getRoomMediaIds(room.getId());
        List<String> imagePublicIds = mediaIds.stream()
            .map(String::valueOf)
            .collect(Collectors.toList());
        response.put("images", imagePublicIds);
        response.put("mediaPublicIds", imagePublicIds);
        
        return response;
    }

    /**
     * Convert Amenity entity to response format
     */
    private Map<String, Object> convertAmenityToResponse(Amenity amenity) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", amenity.getAmenityId());
        response.put("name", amenity.getName());
        response.put("iconUrl", amenity.getIconUrl());
        response.put("isActive", amenity.getIsActive() != null ? amenity.getIsActive() : Boolean.TRUE);
        response.put("displayOrder", amenity.getDisplayOrder());
        return response;
    }
}
