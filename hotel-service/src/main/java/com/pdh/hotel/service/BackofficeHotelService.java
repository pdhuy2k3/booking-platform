package com.pdh.hotel.service;

import com.pdh.hotel.client.MediaServiceClient;
import com.pdh.hotel.constant.ImageTypes;
import com.pdh.hotel.dto.request.HotelRequestDto;
import com.pdh.hotel.model.Amenity;
import com.pdh.hotel.model.Hotel;
import com.pdh.hotel.model.HotelAmenity;
import com.pdh.hotel.model.Room;
import com.pdh.hotel.repository.AmenityRepository;
import com.pdh.hotel.repository.HotelAmenityRepository;
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
    private final MediaServiceClient mediaServiceClient;

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
        Map<String, Object> response = convertHotelToResponse(hotel);

        Pageable pageable = PageRequest.of(0, 50);
        Page<Room> roomPage = roomRepository.findAvailableRoomsByHotelId(id, pageable);
        List<Map<String, Object>> rooms = roomPage.getContent().stream()
            .map(this::convertRoomToResponse)
            .collect(Collectors.toList());

        response.put("rooms", rooms);
        return response;
    }

    public Map<String, Object> createHotel(HotelRequestDto hotelRequestDto) {
        Hotel hotel = new Hotel();
        hotel.setName(hotelRequestDto.getName());
        hotel.setAddress(hotelRequestDto.getAddress());
        hotel.setCity(hotelRequestDto.getCity());
        hotel.setCountry(hotelRequestDto.getCountry());
        hotel.setDescription(hotelRequestDto.getDescription());
        hotel.setStarRating(hotelRequestDto.getStarRating());
        hotel.setLatitude(hotelRequestDto.getLatitude());
        hotel.setLongitude(hotelRequestDto.getLongitude());
        hotel.setIsActive(true);

        Hotel savedHotel = hotelRepository.save(hotel);
        
        // Handle media association if provided
        if (hotelRequestDto.getMediaPublicIds() != null && !hotelRequestDto.getMediaPublicIds().isEmpty()) {
            try {
                mediaServiceClient.associateMediaWithEntity("HOTEL", savedHotel.getHotelId(), hotelRequestDto.getMediaPublicIds());
                log.info("Associated {} media items with hotel ID: {}", hotelRequestDto.getMediaPublicIds().size(), savedHotel.getHotelId());
            } catch (Exception e) {
                log.error("Error associating media with hotel {}: {}", savedHotel.getHotelId(), e.getMessage());
                // Don't fail the hotel creation if media association fails
            }
        }
        
        Map<String, Object> response = convertHotelToResponse(savedHotel);
        response.put("message", "Hotel created successfully");
        return response;
    }

    public Map<String, Object> updateHotel(Long id, HotelRequestDto hotelRequestDto) {
        Hotel hotel = hotelRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Hotel not found with ID: " + id));

        hotel.setName(hotelRequestDto.getName());
        hotel.setAddress(hotelRequestDto.getAddress());
        hotel.setCity(hotelRequestDto.getCity());
        hotel.setCountry(hotelRequestDto.getCountry());
        hotel.setDescription(hotelRequestDto.getDescription());
        hotel.setStarRating(hotelRequestDto.getStarRating());
        hotel.setLatitude(hotelRequestDto.getLatitude());
        hotel.setLongitude(hotelRequestDto.getLongitude());

        Hotel updatedHotel = hotelRepository.save(hotel);
        
        // Handle media association if provided
        if (hotelRequestDto.getMediaPublicIds() != null && !hotelRequestDto.getMediaPublicIds().isEmpty()) {
            try {
                // First, delete existing media associations
                mediaServiceClient.deleteMediaByEntity("HOTEL", id);
                
                // Then associate new media
                mediaServiceClient.associateMediaWithEntity("HOTEL", id, hotelRequestDto.getMediaPublicIds());
                log.info("Updated {} media items for hotel ID: {}", hotelRequestDto.getMediaPublicIds().size(), id);
            } catch (Exception e) {
                log.error("Error updating media for hotel {}: {}", id, e.getMessage());
                // Don't fail the hotel update if media association fails
            }
        }
        
        Map<String, Object> response = convertHotelToResponse(updatedHotel);
        response.put("message", "Hotel updated successfully");
        return response;
    }

    public void deleteHotel(Long id) {
        Hotel hotel = hotelRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Hotel not found with ID: " + id));
        // Soft delete to preserve referential integrity
        hotel.setIsActive(false);
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

        Map<String, Object> response = convertHotelToResponse(hotel);
        response.put("message", "Hotel amenities updated successfully");
        return response;
    }

    /**
     * Process hotel images by replacing existing active images with new ones
     * @param hotelId The hotel ID
     * @param imagePublicIds List of publicIds from frontend MediaSelector
     */
    private void processHotelImages(Long hotelId, List<String> imagePublicIds) {
        log.info("Processing {} images for hotel ID: {}", 
                imagePublicIds != null ? imagePublicIds.size() : 0, hotelId);
        
        // First, delete all existing images for this hotel
        try {
            mediaServiceClient.deleteMediaByEntity(ImageTypes.ENTITY_TYPE_HOTEL, hotelId);
            log.info("Deleted existing images for hotel ID: {}", hotelId);
        } catch (Exception e) {
            log.error("Error deleting existing images for hotel {}: {}", hotelId, e.getMessage());
        }
        
        if (imagePublicIds == null || imagePublicIds.isEmpty()) {
            log.info("No new images to process for hotel ID: {}", hotelId);
            return;
        }
        
        // Note: The new media service approach requires actual file uploads
        // This method is for compatibility with existing frontend that passes publicIds
        // In a real scenario, you would upload the actual files through MediaServiceClient
        
        log.warn("processHotelImages called with publicIds - this is legacy behavior.");
        log.warn("For new implementations, use MediaServiceClient.uploadMedia() with actual files.");
        log.info("Processed {} images for hotel ID: {}", imagePublicIds != null ? imagePublicIds.size() : 0, hotelId);
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
        response.put("isActive", hotel.getIsActive() != null ? hotel.getIsActive() : true);

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

        // Get images via MediaServiceClient - return publicIds for frontend MediaSelector compatibility
        List<Map<String, Object>> imageData = mediaServiceClient.getMediaByEntity(ImageTypes.ENTITY_TYPE_HOTEL, hotel.getHotelId());
        List<String> imagePublicIds = imageData.stream()
            .map(img -> (String) img.get("publicId"))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
        response.put("images", imagePublicIds);

        return response;
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
