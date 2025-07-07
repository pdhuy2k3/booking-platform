package com.pdh.hotel.controller;

import com.pdh.hotel.model.Hotel;
import com.pdh.hotel.model.Room;
import com.pdh.hotel.repository.HotelRepository;
import com.pdh.hotel.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
public class HotelController {
    
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;

    /**
     * Health check endpoint
     */
    @GetMapping("/backoffice/hotel/health")
    public ResponseEntity<Map<String, Object>> health() {
        log.info("Hotel service health check requested");
        
        Map<String, Object> healthStatus = Map.of(
                "status", "UP",
                "service", "hotel-service",
                "timestamp", LocalDateTime.now(),
                "messages", "Hotel service is running properly"
        );
        
        return ResponseEntity.ok(healthStatus);
    }

    /**
     * Tìm kiếm khách sạn
     */
    @GetMapping("/backoffice/hotel/search")
    public ResponseEntity<List<Hotel>> searchHotels(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Integer minRating) {
        
        log.info("Searching hotels with city: {}, keyword: {}, minRating: {}", city, keyword, minRating);
        
        List<Hotel> hotels;
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            hotels = hotelRepository.searchHotels(keyword);
        } else if (city != null && !city.trim().isEmpty()) {
            hotels = hotelRepository.findByCityIgnoreCaseAndIsActiveTrue(city);
        } else if (minRating != null) {
            hotels = hotelRepository.findByMinStarRating(minRating);
        } else {
            hotels = hotelRepository.findAll();
        }
        
        log.info("Found {} hotels", hotels.size());
        return ResponseEntity.ok(hotels);
    }

    /**
     * Lấy thông tin chi tiết khách sạn
     */
    @GetMapping("/backoffice/hotel/{hotelId}")
    public ResponseEntity<Hotel> getHotelDetails(@PathVariable Long hotelId) {
        log.info("Getting hotel details for ID: {}", hotelId);
        
        return hotelRepository.findById(hotelId)
                .map(hotel -> {
                    log.info("Found hotel: {}", hotel.getName());
                    return ResponseEntity.ok(hotel);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Lấy danh sách phòng của khách sạn
     */
    @GetMapping("/backoffice/hotel/{hotelId}/rooms")
    public ResponseEntity<List<Room>> getHotelRooms(
            @PathVariable Long hotelId,
            @RequestParam(required = false) Integer guests,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice) {
        
        log.info("Getting rooms for hotel ID: {} with guests: {}, price range: {}-{}", 
                hotelId, guests, minPrice, maxPrice);
        
        List<Room> rooms;
        
        if (guests != null) {
            rooms = roomRepository.findAvailableRoomsByHotelAndOccupancy(hotelId, guests);
        } else if (minPrice != null && maxPrice != null) {
            rooms = roomRepository.findAvailableRoomsByHotelAndPriceRange(hotelId, minPrice, maxPrice);
        } else {
            rooms = roomRepository.findByHotelIdAndIsAvailableTrue(hotelId);
        }
        
        log.info("Found {} available rooms", rooms.size());
        return ResponseEntity.ok(rooms);
    }

    /**
     * Lấy thông tin chi tiết phòng
     */
    @GetMapping("/backoffice/hotel/room/{roomId}")
    public ResponseEntity<Room> getRoomDetails(@PathVariable Long roomId) {
        log.info("Getting room details for ID: {}", roomId);
        
        return roomRepository.findById(roomId)
                .map(room -> {
                    log.info("Found room: {} in hotel: {}", room.getRoomNumber(), room.getHotel().getName());
                    return ResponseEntity.ok(room);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
