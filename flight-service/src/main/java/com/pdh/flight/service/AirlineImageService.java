package com.pdh.flight.service;

import com.pdh.flight.model.AirlineImage;
import com.pdh.flight.model.enums.AirlineImageType;
import com.pdh.flight.repository.AirlineImageRepository;
import com.pdh.flight.repository.AirlineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing airline images
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AirlineImageService {

    private final AirlineImageRepository airlineImageRepository;
    private final AirlineRepository airlineRepository;

    /**
     * Create airline image
     */
    public Map<String, Object> createAirlineImage(Map<String, Object> imageData) {
        log.info("Creating airline image for airline ID: {}", imageData.get("airlineId"));
        
        Long airlineId = Long.valueOf(imageData.get("airlineId").toString());
        var airline = airlineRepository.findById(airlineId)
                .orElseThrow(() -> new RuntimeException("Airline not found with ID: " + airlineId));
        
        AirlineImage airlineImage = new AirlineImage();
        airlineImage.setAirline(airline);
        airlineImage.setImageUrl((String) imageData.get("imageUrl"));
        
        if (imageData.get("imageType") != null) {
            airlineImage.setImageType(AirlineImageType.valueOf(imageData.get("imageType").toString()));
        }
        
        airlineImage.setAltText((String) imageData.get("altText"));
        airlineImage.setDisplayOrder(imageData.get("displayOrder") != null ? 
                Integer.valueOf(imageData.get("displayOrder").toString()) : 0);
        airlineImage.setIsPrimary(imageData.get("isPrimary") != null ? 
                Boolean.valueOf(imageData.get("isPrimary").toString()) : false);
        airlineImage.setIsActive(true);
        
        AirlineImage savedImage = airlineImageRepository.save(airlineImage);
        
        return convertToMap(savedImage);
    }

    /**
     * Get airline images
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAirlineImages(Long airlineId) {
        log.info("Getting images for airline ID: {}", airlineId);
        
        List<AirlineImage> images = airlineImageRepository.findByAirlineIdAndIsActiveTrue(airlineId);
        return images.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    /**
     * Delete airline image
     */
    public void deleteAirlineImage(Long imageId) {
        log.info("Deleting airline image ID: {}", imageId);
        
        AirlineImage image = airlineImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Airline image not found with ID: " + imageId));
        
        // Soft delete
        image.setIsActive(false);
        airlineImageRepository.save(image);
    }

    private Map<String, Object> convertToMap(AirlineImage image) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", image.getId());
        result.put("imageUrl", image.getImageUrl());
        result.put("imageType", image.getImageType());
        result.put("altText", image.getAltText());
        result.put("displayOrder", image.getDisplayOrder());
        result.put("isPrimary", image.getIsPrimary());
        result.put("isActive", image.getIsActive());
        result.put("airlineId", image.getAirline().getAirlineId());
        return result;
    }
}