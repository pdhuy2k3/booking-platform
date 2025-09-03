package com.pdh.flight.service;

import com.pdh.flight.model.FlightImage;
import com.pdh.flight.model.enums.FlightImageType;
import com.pdh.flight.repository.FlightImageRepository;
import com.pdh.flight.repository.FlightRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service for managing flight images
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FlightImageService {

    private final FlightImageRepository flightImageRepository;
    private final FlightRepository flightRepository;

    /**
     * Create flight image
     */
    public Map<String, Object> createFlightImage(Map<String, Object> imageData) {
        log.info("Creating flight image for flight ID: {}", imageData.get("flightId"));
        
        Long flightId = Long.valueOf(imageData.get("flightId").toString());
        var flight = flightRepository.findById(flightId)
                .orElseThrow(() -> new RuntimeException("Flight not found with ID: " + flightId));
        
        FlightImage flightImage = new FlightImage();
        flightImage.setFlight(flight);
        flightImage.setImageUrl((String) imageData.get("imageUrl"));
        
        if (imageData.get("imageType") != null) {
            flightImage.setImageType(FlightImageType.valueOf(imageData.get("imageType").toString()));
        }
        
        flightImage.setAltText((String) imageData.get("altText"));
        flightImage.setDisplayOrder(imageData.get("displayOrder") != null ? 
                Integer.valueOf(imageData.get("displayOrder").toString()) : 0);
        flightImage.setIsPrimary(imageData.get("isPrimary") != null ? 
                Boolean.valueOf(imageData.get("isPrimary").toString()) : false);
        flightImage.setIsActive(true);
        
        FlightImage savedImage = flightImageRepository.save(flightImage);
        
        return convertToMap(savedImage);
    }

    /**
     * Get flight images
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getFlightImages(Long flightId) {
        log.info("Getting images for flight ID: {}", flightId);
        
        List<FlightImage> images = flightImageRepository.findByFlightIdAndIsActiveTrue(flightId);
        return images.stream()
                .map(this::convertToMap)
                .collect(Collectors.toList());
    }

    /**
     * Delete flight image
     */
    public void deleteFlightImage(Long imageId) {
        log.info("Deleting flight image ID: {}", imageId);
        
        FlightImage image = flightImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Flight image not found with ID: " + imageId));
        
        // Soft delete
        image.setIsActive(false);
        flightImageRepository.save(image);
    }

    private Map<String, Object> convertToMap(FlightImage image) {
        Map<String, Object> result = new HashMap<>();
        result.put("id", image.getId());
        result.put("imageUrl", image.getImageUrl());
        result.put("imageType", image.getImageType());
        result.put("altText", image.getAltText());
        result.put("displayOrder", image.getDisplayOrder());
        result.put("isPrimary", image.getIsPrimary());
        result.put("isActive", image.getIsActive());
        result.put("flightId", image.getFlight().getFlightId());
        return result;
    }
}