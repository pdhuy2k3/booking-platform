package com.pdh.hotel.service;

import com.pdh.hotel.dto.request.AmenityRequestDto;
import com.pdh.hotel.dto.response.AmenityResponseDto;
import com.pdh.hotel.mapper.AmenityMapper;
import com.pdh.hotel.model.Amenity;
import com.pdh.hotel.repository.AmenityRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service class for managing amenities
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AmenityService {
    
    private final AmenityRepository amenityRepository;
    private final AmenityMapper amenityMapper;
    
    /**
     * Get all amenities with pagination
     */
    @Transactional(readOnly = true)
    public Page<AmenityResponseDto> getAllAmenities(Pageable pageable) {
        log.debug("Fetching all amenities with pagination: {}", pageable);
        Page<Amenity> amenities = amenityRepository.findAll(pageable);
        return amenities.map(amenityMapper::toResponseDto);
    }
    
    /**
     * Get all active amenities
     */
    @Transactional(readOnly = true)
    public List<AmenityResponseDto> getActiveAmenities() {
        log.debug("Fetching all active amenities");
        List<Amenity> amenities = amenityRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        return amenityMapper.toResponseDtoList(amenities);
    }
    
    /**
     * Search amenities by name
     */
    @Transactional(readOnly = true)
    public Page<AmenityResponseDto> searchAmenities(String searchTerm, Pageable pageable) {
        log.debug("Searching amenities with term: {}", searchTerm);
        Page<Amenity> amenities;
        
        if (searchTerm == null || searchTerm.trim().isEmpty()) {
            amenities = amenityRepository.findAll(pageable);
        } else {
            amenities = amenityRepository.findByNameContainingIgnoreCase(searchTerm.trim(), pageable);
        }
        
        return amenities.map(amenityMapper::toResponseDto);
    }
    
    /**
     * Get amenity by ID
     */
    @Transactional(readOnly = true)
    public AmenityResponseDto getAmenityById(Long id) {
        log.debug("Fetching amenity by ID: {}", id);
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Amenity not found with ID: " + id));
        return amenityMapper.toResponseDto(amenity);
    }
    
    /**
     * Create a new amenity
     */
    public AmenityResponseDto createAmenity(AmenityRequestDto requestDto) {
        log.info("Creating new amenity: {}", requestDto.getName());
        
        // Check if amenity with same name already exists
        if (amenityRepository.existsByName(requestDto.getName())) {
            throw new IllegalArgumentException("Amenity with name '" + requestDto.getName() + "' already exists");
        }
        
        Amenity amenity = amenityMapper.toEntity(requestDto);
        
        // Set display order if not provided
        if (amenity.getDisplayOrder() == null) {
            amenity.setDisplayOrder(amenityRepository.getNextDisplayOrder());
        }
        
        Amenity savedAmenity = amenityRepository.save(amenity);
        log.info("Amenity created successfully with ID: {}", savedAmenity.getAmenityId());
        
        return amenityMapper.toResponseDto(savedAmenity);
    }
    
    /**
     * Update an existing amenity
     */
    public AmenityResponseDto updateAmenity(Long id, AmenityRequestDto requestDto) {
        log.info("Updating amenity with ID: {}", id);
        
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Amenity not found with ID: " + id));
        
        // Check if another amenity with the same name exists
        if (amenityRepository.existsByNameAndAmenityIdNot(requestDto.getName(), id)) {
            throw new IllegalArgumentException("Another amenity with name '" + requestDto.getName() + "' already exists");
        }
        
        amenityMapper.updateEntity(amenity, requestDto);
        Amenity updatedAmenity = amenityRepository.save(amenity);
        
        log.info("Amenity updated successfully with ID: {}", updatedAmenity.getAmenityId());
        return amenityMapper.toResponseDto(updatedAmenity);
    }
    
    /**
     * Delete an amenity
     */
    public void deleteAmenity(Long id) {
        log.info("Deleting amenity with ID: {}", id);
        
        if (!amenityRepository.existsById(id)) {
            throw new EntityNotFoundException("Amenity not found with ID: " + id);
        }
        
        amenityRepository.deleteById(id);
        log.info("Amenity deleted successfully with ID: {}", id);
    }
    
    /**
     * Activate or deactivate an amenity
     */
    public AmenityResponseDto toggleAmenityStatus(Long id, boolean isActive) {
        log.info("Toggling amenity status for ID: {} to {}", id, isActive);
        
        Amenity amenity = amenityRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Amenity not found with ID: " + id));
        
        amenity.setIsActive(isActive);
        Amenity updatedAmenity = amenityRepository.save(amenity);
        
        log.info("Amenity status updated successfully for ID: {}", id);
        return amenityMapper.toResponseDto(updatedAmenity);
    }
    
    /**
     * Get amenities by IDs
     */
    @Transactional(readOnly = true)
    public List<AmenityResponseDto> getAmenitiesByIds(List<Long> ids) {
        log.debug("Fetching amenities by IDs: {}", ids);
        List<Amenity> amenities = amenityRepository.findActiveAmenitiesByIds(ids);
        return amenityMapper.toResponseDtoList(amenities);
    }
    
    /**
     * Update display order for multiple amenities
     */
    public void updateDisplayOrder(List<Long> amenityIds) {
        log.info("Updating display order for {} amenities", amenityIds.size());
        
        int order = 1;
        for (Long id : amenityIds) {
            Amenity amenity = amenityRepository.findById(id)
                    .orElseThrow(() -> new EntityNotFoundException("Amenity not found with ID: " + id));
            amenity.setDisplayOrder(order++);
            amenityRepository.save(amenity);
        }
        
        log.info("Display order updated successfully for {} amenities", amenityIds.size());
    }
}
