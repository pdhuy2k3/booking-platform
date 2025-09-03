package com.pdh.hotel.service;

import com.pdh.hotel.model.Amenity;
import com.pdh.hotel.model.Hotel;
import com.pdh.hotel.model.HotelAmenity;
import com.pdh.hotel.model.HotelImage;
import com.pdh.hotel.model.Room;
import com.pdh.hotel.repository.AmenityRepository;
import com.pdh.hotel.repository.HotelAmenityRepository;
import com.pdh.hotel.repository.HotelImageRepository;
import com.pdh.hotel.repository.HotelRepository;
import com.pdh.hotel.repository.RoomRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;
import java.time.ZonedDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BackofficeHotelService {

    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final AmenityRepository amenityRepository;
    private final HotelAmenityRepository hotelAmenityRepository;
    private final HotelImageRepository hotelImageRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getAllHotels(int page, int size, String search, String city, String status) {
        Sort sort = Sort.by(Sort.Direction.DESC, "starRating").and(Sort.by("name"));
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Hotel> hotelPage;
        if (search != null && !search.isEmpty()) {
            if (city != null && !city.isEmpty()) {
                hotelPage = hotelRepository.findHotelsByDestinationAndRating(search, BigDecimal.ZERO, BigDecimal.TEN, pageable);
            } else {
                hotelPage = hotelRepository.findHotelsByDestination(search, pageable);
            }
        } else if (city != null && !city.isEmpty()) {
            hotelPage = hotelRepository.findHotelsByCity(city, pageable);
        } else {
            hotelPage = hotelRepository.findAllWithDetails(pageable);
        }

        List<Map<String, Object>> hotels = hotelPage.getContent().stream()
            .map(this::convertHotelToResponse)
            .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("content", hotels);
        response.put("totalElements", hotelPage.getTotalElements());
        response.put("totalPages", hotelPage.getTotalPages());
        response.put("size", hotelPage.getSize());
        response.put("number", hotelPage.getNumber());
        response.put("first", hotelPage.isFirst());
        response.put("last", hotelPage.isLast());
        return response;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Hotel not found with ID: " + id));
        Map<String, Object> response = convertHotelToDetailedResponse(hotel);

        Pageable pageable = PageRequest.of(0, 50);
        Page<Room> roomPage = roomRepository.findAvailableRoomsByHotelId(id, pageable);
        List<Map<String, Object>> rooms = roomPage.getContent().stream()
            .map(this::convertRoomToResponse)
            .collect(Collectors.toList());

        response.put("rooms", rooms);
        return response;
    }

    public Map<String, Object> createHotel(Map<String, Object> hotelData) {
        Hotel hotel = new Hotel();
        hotel.setName((String) hotelData.get("name"));
        hotel.setAddress((String) hotelData.get("address"));
        hotel.setCity((String) hotelData.get("city"));
        hotel.setCountry((String) hotelData.get("country"));
        hotel.setDescription((String) hotelData.get("description"));

        Object ratingObj = hotelData.get("starRating");
        if (ratingObj instanceof Number) {
            hotel.setStarRating(BigDecimal.valueOf(((Number) ratingObj).doubleValue()));
        } else if (ratingObj instanceof String) {
            try {
                hotel.setStarRating(BigDecimal.valueOf(Double.parseDouble((String) ratingObj)));
            } catch (NumberFormatException e) {
                log.warn("Invalid star rating format: {}", ratingObj);
            }
        }

        Hotel savedHotel = hotelRepository.save(hotel);
        
        // Handle images if provided
        Object imagesObj = hotelData.get("images");
        if (imagesObj instanceof List<?>) {
            @SuppressWarnings("unchecked")
            List<String> imageUrls = (List<String>) imagesObj;
            processHotelImages(savedHotel.getHotelId(), imageUrls);
        }
        
        Map<String, Object> response = convertHotelToResponse(savedHotel);
        response.put("message", "Hotel created successfully");
        return response;
    }

    public Map<String, Object> updateHotel(Long id, Map<String, Object> hotelData) {
        Hotel hotel = hotelRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Hotel not found with ID: " + id));

        hotel.setName((String) hotelData.get("name"));
        hotel.setAddress((String) hotelData.get("address"));
        hotel.setCity((String) hotelData.get("city"));
        hotel.setCountry((String) hotelData.get("country"));
        hotel.setDescription((String) hotelData.get("description"));

        Object ratingObj = hotelData.get("starRating");
        if (ratingObj instanceof Number) {
            hotel.setStarRating(BigDecimal.valueOf(((Number) ratingObj).doubleValue()));
        } else if (ratingObj instanceof String) {
            try {
                hotel.setStarRating(BigDecimal.valueOf(Double.parseDouble((String) ratingObj)));
            } catch (NumberFormatException e) {
                log.warn("Invalid star rating format: {}", ratingObj);
            }
        }

        Hotel updatedHotel = hotelRepository.save(hotel);
        
        // Handle images if provided
        Object imagesObj = hotelData.get("images");
        if (imagesObj instanceof List<?>) {
            @SuppressWarnings("unchecked")
            List<String> imageUrls = (List<String>) imagesObj;
            processHotelImages(id, imageUrls);
        }
        
        Map<String, Object> response = convertHotelToResponse(updatedHotel);
        response.put("message", "Hotel updated successfully");
        return response;
    }

    public void deleteHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Hotel not found with ID: " + id));
        // Soft delete to preserve referential integrity and match repository filters
        hotel.setDeleted(true);
        hotel.setDeletedAt(ZonedDateTime.now());
        hotelRepository.save(hotel);
    }

    public Map<String, Object> updateHotelAmenities(Long hotelId, List<Long> amenityIds) {
        Hotel hotel = hotelRepository.findById(hotelId).orElseThrow(() -> new EntityNotFoundException("Hotel not found with ID: " + hotelId));

        if (amenityIds == null) amenityIds = Collections.emptyList();

        // Validate amenity IDs exist and active
        List<Amenity> amenities = amenityIds.isEmpty() ? Collections.emptyList() : amenityRepository.findActiveAmenitiesByIds(amenityIds);
        Set<Long> validIds = amenities.stream().map(Amenity::getAmenityId).collect(Collectors.toSet());

        // Replace existing mappings
        hotelAmenityRepository.deleteByHotelId(hotelId);
        if (!validIds.isEmpty()) {
            List<HotelAmenity> mappings = validIds.stream()
                .map(aid -> new HotelAmenity(hotelId, aid, hotel, null))
                .collect(Collectors.toList());
            hotelAmenityRepository.saveAll(mappings);
        }

        Map<String, Object> response = convertHotelToDetailedResponse(hotel);
        response.put("message", "Hotel amenities updated successfully");
        return response;
    }

    /**
     * Process hotel images by replacing existing active images with new ones
     * @param hotelId The hotel ID
     * @param imageUrls List of image URLs/publicIds from frontend
     */
    private void processHotelImages(Long hotelId, List<String> imageUrls) {
        if (imageUrls == null || imageUrls.isEmpty()) {
            // If no images provided, deactivate all existing images
            List<HotelImage> existingImages = hotelImageRepository.findByHotelIdAndIsActiveTrue(hotelId);
            existingImages.forEach(img -> img.setIsActive(false));
            if (!existingImages.isEmpty()) {
                hotelImageRepository.saveAll(existingImages);
            }
            return;
        }

        // Deactivate all existing images first
        List<HotelImage> existingImages = hotelImageRepository.findByHotelIdAndIsActiveTrue(hotelId);
        existingImages.forEach(img -> img.setIsActive(false));
        if (!existingImages.isEmpty()) {
            hotelImageRepository.saveAll(existingImages);
        }

        // Create new active images
        List<HotelImage> newImages = new ArrayList<>();
        for (int i = 0; i < imageUrls.size(); i++) {
            String imageUrl = imageUrls.get(i);
            if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                HotelImage hotelImage = new HotelImage();
                // Set the hotel reference instead of hotelId
                Hotel hotel = new Hotel();
                hotel.setHotelId(hotelId);
                hotelImage.setHotel(hotel);
                hotelImage.setImageUrl(imageUrl.trim());
                hotelImage.setIsActive(true);
                hotelImage.setDisplayOrder(i + 1);
                newImages.add(hotelImage);
            }
        }

        if (!newImages.isEmpty()) {
            hotelImageRepository.saveAll(newImages);
        }
    }

    // === Helper mapping methods ===
    private Map<String, Object> convertHotelToResponse(Hotel hotel) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", hotel.getHotelId());
        response.put("name", hotel.getName() != null ? hotel.getName() : "");
        response.put("address", hotel.getAddress() != null ? hotel.getAddress() : "");
        response.put("city", hotel.getCity() != null ? hotel.getCity() : "");
        response.put("country", hotel.getCountry() != null ? hotel.getCountry() : "");
        response.put("starRating", hotel.getStarRating() != null ? hotel.getStarRating().doubleValue() : 0.0);
        response.put("description", hotel.getDescription() != null ? hotel.getDescription() : "");

        Long availableRooms = roomRepository.countAvailableRoomsByHotelId(hotel.getHotelId());
        response.put("availableRooms", availableRooms != null ? availableRooms : 0);

        BigDecimal minPrice = roomRepository.findMinPriceByHotelId(hotel.getHotelId());
        response.put("minPrice", minPrice != null ? minPrice.doubleValue() : 0.0);

        // Add amenities list
        List<Amenity> amenities = hotelAmenityRepository.findAmenitiesByHotelId(hotel.getHotelId());
        if (amenities != null && !amenities.isEmpty()) {
            List<Map<String, Object>> amenityList = amenities.stream().map(this::convertAmenityToResponse).collect(Collectors.toList());
            response.put("amenities", amenityList);
        } else {
            response.put("amenities", Collections.emptyList());
        }

        // Add images field - return simple URLs for frontend MediaSelector compatibility
        List<HotelImage> hotelImages = hotelImageRepository.findByHotelIdAndIsActiveTrue(hotel.getHotelId());
        List<String> imageUrls = hotelImages != null ? 
            hotelImages.stream()
                .map(HotelImage::getImageUrl)
                .collect(Collectors.toList()) : new ArrayList<>();
        response.put("images", imageUrls);

        return response;
    }

    private Map<String, Object> convertHotelToDetailedResponse(Hotel hotel) {
        return convertHotelToResponse(hotel);
    }

    private Map<String, Object> convertRoomToResponse(Room room) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", room.getId());
        response.put("roomNumber", room.getRoomNumber());
        response.put("description", room.getDescription() != null ? room.getDescription() : "");
        response.put("price", room.getPrice() != null ? room.getPrice().doubleValue() : 0.0);
        response.put("maxOccupancy", room.getMaxOccupancy() != null ? room.getMaxOccupancy() : 0);
        response.put("bedType", room.getBedType() != null ? room.getBedType() : "");
        response.put("roomSize", room.getRoomSize() != null ? room.getRoomSize() : 0);
        response.put("isAvailable", room.getIsAvailable() != null ? room.getIsAvailable() : false);

        if (room.getRoomType() != null) {
            Map<String, Object> rt = new HashMap<>();
            rt.put("id", room.getRoomType().getRoomTypeId());
            rt.put("name", room.getRoomType().getName());
            rt.put("description", room.getRoomType().getDescription());
            response.put("roomType", rt);
        }

        return response;
    }

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
