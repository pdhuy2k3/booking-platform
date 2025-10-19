package com.pdh.booking.client.dto;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

/**
 * Minimal projection of the hotel storefront detail payload.
 */
@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class HotelDetailsClientResponse {

    private String hotelId;
    private String name;
    private String address;
    private String city;
    private String country;
    private Double latitude;
    private Double longitude;
    @JsonProperty("rating")
    private Integer starRating;
    private Double pricePerNight;
    private String currency;
    private List<String> amenities;
    private List<RoomType> roomTypes;

    @JsonIgnoreProperties(ignoreUnknown = true)
    @Data
    public static class RoomType {
        private Long id;
        private String name;
        private String description;
        private Integer capacityAdults;
        private Double basePrice;
        private List<String> features;
        private Boolean available;
        private String availabilityMessage;
        private List<DailyAvailability> dailyAvailability;
        private String image;
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    @Data
    public static class DailyAvailability {
        private String date;
        private Integer totalInventory;
        private Integer totalReserved;
        private Integer remaining;
    }
}

