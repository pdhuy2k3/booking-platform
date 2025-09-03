package com.pdh.flight.service;

import com.pdh.flight.model.AirportImage;
import com.pdh.flight.model.enums.AirportImageType;
import com.pdh.flight.repository.AirportImageRepository;
import com.pdh.flight.repository.AirportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing airport images
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AirportImageService {

    private final AirportImageRepository airportImageRepository;
    private final AirportRepository airportRepository;

    /**
     * Create airport image
     */
    public Map<String, Object> createAirportImage(Map<String, Object> imageData) {
        log.info("Creating airport image for airport ID: {}", imageData.get("airportId"));
        
        Long airportId = Long.valueOf(imageData.get("airportId").toString());
        var airport = airportRepository.findById(airportId)
                .orElseThrow(() -> new RuntimeException("Airport not found with ID: " + airportId));
        
        AirportImage airportImage = new AirportImage();
        airportImage.setAirport(airport);
        airportImage.setImageUrl((String) imageData.get("imageUrl"));
        
        if (imageData.get("imageType") != null) {
            airportImage.setImageType(AirportImageType.valueOf(imageData.get("imageType").toString()));
        }
        
        airportImage.setAltText((String) imageData.get("altText"));
        airportImage.setDisplayOrder(imageData.get("displayOrder") != null ? 
                Integer.valueOf(imageData.get("displayOrder").toString()) : 0);
        airportImage.setIsPrimary(imageData.get("isPrimary") != null ? 
                Boolean.valueOf(imageData.get("isPrimary").toString()) : false);
        airportImage.setIsActive(true);
        
        AirportImage savedImage = airportImageRepository.save(airportImage);
        
        return convertToMap(savedImage);
    }

    /**
     * Get airport images
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAirportImages(Long airportId) {
        log.info("Getting images for airport ID: {}", airportId);
        
        List<AirportImage> images = airportImageRepository.findByAirportIdAndIsActiveTrue(airportId);
        return images.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    /**
     * Delete airport image
     */
    public void deleteAirportImage(Long imageId) {
        log.info("Deleting airport image ID: {}", imageId);
        
        AirportImage image = airportImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Airport image not found with ID: " + imageId));
        
        // Soft delete
        image.setIsActive(false);
        airportImageRepository.save(image);
    }

    private Map<String, Object> convertToMap(AirportImage image) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", image.getId());
        result.put("imageUrl", image.getImageUrl());
        result.put("imageType", image.getImageType());
        result.put("altText", image.getAltText());
        result.put("displayOrder", image.getDisplayOrder());
        result.put("isPrimary", image.getIsPrimary());
        result.put("isActive", image.getIsActive());
        result.put("airportId", image.getAirport().getAirportId());
        return result;
    }
}