package com.pdh.hotel.service;

import com.pdh.hotel.model.HotelImage;
import com.pdh.hotel.repository.HotelImageRepository;
import com.pdh.hotel.repository.HotelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing hotel images
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class HotelImageService {

    private final HotelImageRepository hotelImageRepository;
    private final HotelRepository hotelRepository;

    /**
     * Create hotel image
     */
    public Map<String, Object> createHotelImage(Map<String, Object> imageData) {
        log.info("Creating hotel image for hotel ID: {}", imageData.get("hotelId"));
        
        Long hotelId = Long.valueOf(imageData.get("hotelId").toString());
        var hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new RuntimeException("Hotel not found with ID: " + hotelId));
        
        HotelImage hotelImage = new HotelImage();
        hotelImage.setHotel(hotel);
        hotelImage.setImageUrl((String) imageData.get("imageUrl"));
        hotelImage.setImageType((String) imageData.get("imageType"));
        hotelImage.setAltText((String) imageData.get("altText"));
        hotelImage.setDisplayOrder(imageData.get("displayOrder") != null ? 
                Integer.valueOf(imageData.get("displayOrder").toString()) : 0);
        hotelImage.setIsPrimary(imageData.get("isPrimary") != null ? 
                Boolean.valueOf(imageData.get("isPrimary").toString()) : false);
        hotelImage.setIsActive(true);
        
        HotelImage savedImage = hotelImageRepository.save(hotelImage);
        
        return convertToMap(savedImage);
    }

    /**
     * Get hotel images
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getHotelImages(Long hotelId) {
        log.info("Getting images for hotel ID: {}", hotelId);
        
        List<HotelImage> images = hotelImageRepository.findByHotelIdOrderByDisplayOrder(hotelId);
        return images.stream()
                .filter(HotelImage::getIsActive)
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    /**
     * Delete hotel image
     */
    public void deleteHotelImage(Long imageId) {
        log.info("Deleting hotel image ID: {}", imageId);
        
        HotelImage image = hotelImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Hotel image not found with ID: " + imageId));
        
        // Soft delete
        image.setIsActive(false);
        hotelImageRepository.save(image);
    }

    private Map<String, Object> convertToMap(HotelImage image) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", image.getId());
        result.put("imageUrl", image.getImageUrl());
        result.put("imageType", image.getImageType());
        result.put("altText", image.getAltText());
        result.put("displayOrder", image.getDisplayOrder());
        result.put("isPrimary", image.getIsPrimary());
        result.put("isActive", image.getIsActive());
        result.put("hotelId", image.getHotel().getHotelId());
        return result;
    }
}