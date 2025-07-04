package com.pdh.hotel.service;

import com.pdh.hotel.model.Amenity;
import com.pdh.hotel.repository.AmenityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AmenityService {

    private final AmenityRepository amenityRepository;

    public List<Amenity> getAllActiveAmenities() {
        return amenityRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
    }

    public List<Amenity> getAmenitiesByCategory(Amenity.AmenityCategory category) {
        return amenityRepository.findByCategoryAndIsActiveTrueOrderByDisplayOrderAsc(category);
    }

    public List<Amenity.AmenityCategory> getActiveCategories() {
        return amenityRepository.findDistinctActiveCategories();
    }

    public Optional<Amenity> findByName(String name) {
        return amenityRepository.findByNameIgnoreCase(name);
    }

    public Amenity createAmenity(String name, String description, Amenity.AmenityCategory category, String iconUrl) {
        if (amenityRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Amenity with name '" + name + "' already exists");
        }

        Amenity amenity = new Amenity();
        amenity.setName(name);
        amenity.setDescription(description);
        amenity.setCategory(category);
        amenity.setIconUrl(iconUrl);
        amenity.setIsActive(true);
        amenity.setDisplayOrder(getNextDisplayOrder());

        return amenityRepository.save(amenity);
    }

    public Amenity updateAmenity(Long id, String name, String description, Amenity.AmenityCategory category, String iconUrl) {
        Amenity amenity = amenityRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Amenity not found with id: " + id));

        // Check if name is being changed and if new name already exists
        if (!amenity.getName().equalsIgnoreCase(name) && amenityRepository.existsByNameIgnoreCase(name)) {
            throw new IllegalArgumentException("Amenity with name '" + name + "' already exists");
        }

        amenity.setName(name);
        amenity.setDescription(description);
        amenity.setCategory(category);
        amenity.setIconUrl(iconUrl);

        return amenityRepository.save(amenity);
    }

    public void deactivateAmenity(Long id) {
        Amenity amenity = amenityRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Amenity not found with id: " + id));

        amenity.setIsActive(false);
        amenityRepository.save(amenity);

        log.info("Deactivated amenity: {}", amenity.getName());
    }

    public void activateAmenity(Long id) {
        Amenity amenity = amenityRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Amenity not found with id: " + id));

        amenity.setIsActive(true);
        amenityRepository.save(amenity);

        log.info("Activated amenity: {}", amenity.getName());
    }

    private Integer getNextDisplayOrder() {
        return amenityRepository.findAll().stream()
            .mapToInt(a -> a.getDisplayOrder() != null ? a.getDisplayOrder() : 0)
            .max()
            .orElse(0) + 1;
    }
}
