package com.pdh.hotel.service;

import com.pdh.common.dto.response.MediaResponse;

import com.pdh.hotel.model.*;
import com.pdh.hotel.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for handling image associations for hotels, rooms, and room types
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ImageService {


    private final HotelImageRepository hotelImageRepository;
    private final RoomImageRepository roomImageRepository;
    private final RoomTypeImageRepository roomTypeImageRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final RoomTypeRepository roomTypeRepository;

    // ===== HOTEL IMAGE OPERATIONS =====

    /**
     * Associate MediaResponse objects with a hotel (replaces existing associations)
     * This method uses complete media information from MediaResponse objects
     */
    public void updateHotelImagesWithMediaResponse(Long hotelId, List<MediaResponse> mediaResponses) {
        log.info("Updating images for hotel ID: {} with {} media response items", hotelId, mediaResponses != null ? mediaResponses.size() : 0);
        
        Hotel hotel = hotelRepository.findById(hotelId)
            .orElseThrow(() -> new RuntimeException("Hotel not found with ID: " + hotelId));
        
        // Delete existing associations
        hotelImageRepository.deleteByHotelId(hotelId);
        
        // Create new associations if mediaResponses provided
        if (mediaResponses != null && !mediaResponses.isEmpty()) {
            List<HotelImage> hotelImages = new ArrayList<>();
            
            // Determine which image should be primary (first one if none specified)
            boolean hasExplicitPrimary = mediaResponses.stream().anyMatch(MediaResponse::getIsPrimary);
            boolean isFirst = true;
            
            for (MediaResponse mediaResponse : mediaResponses) {
                boolean isPrimary = hasExplicitPrimary 
                    ? Boolean.TRUE.equals(mediaResponse.getIsPrimary()) 
                    : isFirst;
                    
                HotelImage hotelImage = HotelImage.builder()
                    .hotel(hotel)
                    .mediaId(mediaResponse.getId()) // Use id from MediaResponse as mediaId
                    .publicId(mediaResponse.getPublicId())
                    .url(mediaResponse.getSecureUrl() != null ? mediaResponse.getSecureUrl() : mediaResponse.getUrl())
                    .isPrimary(isPrimary)
                    .build();
                    
                hotelImages.add(hotelImage);
                isFirst = false;
            }
            
            hotelImageRepository.saveAll(hotelImages);
            log.info("Successfully associated {} images with hotel ID: {}, primary image: {}", 
                hotelImages.size(), hotelId, 
                hotelImages.stream().filter(HotelImage::isPrimary).findFirst()
                    .map(img -> img.getPublicId()).orElse("none"));
        }
    }

    /**
     * Get all media IDs for a hotel
     */
    public List<Long> getHotelMediaIds(Long hotelId) {
        return hotelImageRepository.findByHotelId(hotelId)
            .stream()
            .map(HotelImage::getMediaId)
            .collect(Collectors.toList());
    }
    
    /**
     * Get complete media information for a hotel
     */
    public List<MediaResponse> getHotelMedia(Long hotelId) {
        return hotelImageRepository.findByHotelId(hotelId)
            .stream()
            .map(hotelImage -> MediaResponse.builder()
                .id(hotelImage.getMediaId())
                .mediaId(hotelImage.getMediaId())
                .publicId(hotelImage.getPublicId())
                .url(hotelImage.getUrl())
                .secureUrl(hotelImage.getUrl()) // For now, use the same URL for both
                .isPrimary(hotelImage.isPrimary())
                .displayOrder(0) // Default display order
                .build())
            .collect(Collectors.toList());
    }

    // ===== ROOM IMAGE OPERATIONS =====

    /**
     * Associate MediaResponse objects with a room (replaces existing associations)
     * This method uses complete media information from MediaResponse objects
     */
    public void updateRoomImagesWithMediaResponse(Long roomId, List<MediaResponse> mediaResponses) {
        log.info("Updating images for room ID: {} with {} media response items", roomId, mediaResponses != null ? mediaResponses.size() : 0);
        
        Room room = roomRepository.findById(roomId)
            .orElseThrow(() -> new RuntimeException("Room not found with ID: " + roomId));
        
        // Delete existing associations
        roomImageRepository.deleteByRoomId(roomId);
        
        // Create new associations if mediaResponses provided
        if (mediaResponses != null && !mediaResponses.isEmpty()) {
            List<RoomImage> roomImages = new ArrayList<>();
            
            // Determine which image should be primary (first one if none specified)
            boolean hasExplicitPrimary = mediaResponses.stream().anyMatch(MediaResponse::getIsPrimary);
            boolean isFirst = true;
            
            for (MediaResponse mediaResponse : mediaResponses) {
                boolean isPrimary = hasExplicitPrimary 
                    ? Boolean.TRUE.equals(mediaResponse.getIsPrimary()) 
                    : isFirst;
                    
                RoomImage roomImage = RoomImage.builder()
                    .room(room)
                    .mediaId(mediaResponse.getId()) // Use id from MediaResponse as mediaId
                    .publicId(mediaResponse.getPublicId())
                    .url(mediaResponse.getSecureUrl() != null ? mediaResponse.getSecureUrl() : mediaResponse.getUrl())
                    .isPrimary(isPrimary)
                    .build();
                    
                roomImages.add(roomImage);
                isFirst = false;
            }
            
            roomImageRepository.saveAll(roomImages);
            log.info("Successfully associated {} images with room ID: {}, primary image: {}", 
                roomImages.size(), roomId, 
                roomImages.stream().filter(RoomImage::isPrimary).findFirst()
                    .map(img -> img.getPublicId()).orElse("none"));
        }
    }

    /**
     * Get all media IDs for a room
     */
    public List<Long> getRoomMediaIds(Long roomId) {
        return roomImageRepository.findByRoomId(roomId)
            .stream()
            .map(RoomImage::getMediaId)
            .collect(Collectors.toList());
    }
    
    /**
     * Get complete media information for a room
     */
    public List<MediaResponse> getRoomMedia(Long roomId) {
        return roomImageRepository.findByRoomId(roomId)
            .stream()
            .map(roomImage -> MediaResponse.builder()
                .id(roomImage.getMediaId())
                .mediaId(roomImage.getMediaId())
                .publicId(roomImage.getPublicId())
                .url(roomImage.getUrl())
                .secureUrl(roomImage.getUrl()) // For now, use the same URL for both
                .isPrimary(roomImage.isPrimary())
                .displayOrder(0) // Default display order
                .build())
            .collect(Collectors.toList());
    }

    // ===== ROOM TYPE IMAGE OPERATIONS =====

    /**
     * Associate MediaResponse objects with a room type (replaces existing associations)
     * This method uses complete media information from MediaResponse objects
     */
    public void updateRoomTypeImagesWithMediaResponse(Long roomTypeId, List<MediaResponse> mediaResponses) {
        log.info("Updating images for room type ID: {} with {} media response items", roomTypeId, mediaResponses != null ? mediaResponses.size() : 0);
        
        RoomType roomType = roomTypeRepository.findById(roomTypeId)
            .orElseThrow(() -> new RuntimeException("Room type not found with ID: " + roomTypeId));
        
        // Delete existing associations
        roomTypeImageRepository.deleteByRoomTypeId(roomTypeId);
        
        // Create new associations if mediaResponses provided
        if (mediaResponses != null && !mediaResponses.isEmpty()) {
            List<RoomTypeImage> roomTypeImages = new ArrayList<>();
            
            // Determine which image should be primary (first one if none specified)
            boolean hasExplicitPrimary = mediaResponses.stream().anyMatch(MediaResponse::getIsPrimary);
            boolean isFirst = true;
            
            for (MediaResponse mediaResponse : mediaResponses) {
                boolean isPrimary = hasExplicitPrimary 
                    ? Boolean.TRUE.equals(mediaResponse.getIsPrimary()) 
                    : isFirst;
                    
                RoomTypeImage roomTypeImage = RoomTypeImage.builder()
                    .roomType(roomType)
                    .mediaId(mediaResponse.getId()) // Use id from MediaResponse as mediaId
                    .publicId(mediaResponse.getPublicId())
                    .url(mediaResponse.getSecureUrl() != null ? mediaResponse.getSecureUrl() : mediaResponse.getUrl())
                    .isPrimary(isPrimary)
                    .build();
                    
                roomTypeImages.add(roomTypeImage);
                isFirst = false;
            }
            
            roomTypeImageRepository.saveAll(roomTypeImages);
            log.info("Successfully associated {} images with room type ID: {}, primary image: {}", 
                roomTypeImages.size(), roomTypeId, 
                roomTypeImages.stream().filter(RoomTypeImage::isPrimary).findFirst()
                    .map(img -> img.getPublicId()).orElse("none"));
        }
    }

    /**
     * Get all media IDs for a room type
     */
    public List<Long> getRoomTypeMediaIds(Long roomTypeId) {
        return roomTypeImageRepository.findByRoomTypeId(roomTypeId)
            .stream()
            .map(RoomTypeImage::getMediaId)
            .collect(Collectors.toList());
    }
    
    /**
     * Get complete media information for a room type
     */
    public List<MediaResponse> getRoomTypeMedia(Long roomTypeId) {
        return roomTypeImageRepository.findByRoomTypeId(roomTypeId)
            .stream()
            .map(roomTypeImage -> MediaResponse.builder()
                .id(roomTypeImage.getMediaId())
                .mediaId(roomTypeImage.getMediaId())
                .publicId(roomTypeImage.getPublicId())
                .url(roomTypeImage.getUrl())
                .secureUrl(roomTypeImage.getUrl()) // For now, use the same URL for both
                .isPrimary(roomTypeImage.isPrimary())
                .displayOrder(0) // Default display order
                .build())
            .collect(Collectors.toList());
    }
}
