package com.pdh.hotel.service;

import com.pdh.hotel.model.RoomImage;
import com.pdh.hotel.repository.RoomImageRepository;
import com.pdh.hotel.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing room images
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class RoomImageService {

    private final RoomImageRepository roomImageRepository;
    private final RoomRepository roomRepository;

    /**
     * Create room image
     */
    public Map<String, Object> createRoomImage(Map<String, Object> imageData) {
        log.info("Creating room image for room ID: {}", imageData.get("roomId"));
        
        Long roomId = Long.valueOf(imageData.get("roomId").toString());
        var room = roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Room not found with ID: " + roomId));
        
        RoomImage roomImage = new RoomImage();
        roomImage.setRoom(room);
        roomImage.setImageUrl((String) imageData.get("imageUrl"));
        roomImage.setImageType((String) imageData.get("imageType"));
        roomImage.setAltText((String) imageData.get("altText"));
        roomImage.setDisplayOrder(imageData.get("displayOrder") != null ? 
                Integer.valueOf(imageData.get("displayOrder").toString()) : 0);
        roomImage.setIsPrimary(imageData.get("isPrimary") != null ? 
                Boolean.valueOf(imageData.get("isPrimary").toString()) : false);
        roomImage.setIsActive(true);
        
        RoomImage savedImage = roomImageRepository.save(roomImage);
        
        return convertToMap(savedImage);
    }

    /**
     * Get room images
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getRoomImages(Long roomId) {
        log.info("Getting images for room ID: {}", roomId);
        
        List<RoomImage> images = roomImageRepository.findByRoomIdOrderByDisplayOrder(roomId);
        return images.stream()
                .filter(RoomImage::getIsActive)
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    /**
     * Delete room image
     */
    public void deleteRoomImage(Long imageId) {
        log.info("Deleting room image ID: {}", imageId);
        
        RoomImage image = roomImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Room image not found with ID: " + imageId));
        
        // Soft delete
        image.setIsActive(false);
        roomImageRepository.save(image);
    }

    private Map<String, Object> convertToMap(RoomImage image) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", image.getId());
        result.put("imageUrl", image.getImageUrl());
        result.put("imageType", image.getImageType());
        result.put("altText", image.getAltText());
        result.put("displayOrder", image.getDisplayOrder());
        result.put("isPrimary", image.getIsPrimary());
        result.put("isActive", image.getIsActive());
        result.put("roomId", image.getRoom().getId());
        return result;
    }
}