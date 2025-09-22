package com.pdh.hotel.util;

import java.util.List;
import java.util.Map;

/**
 * Static storefront data for the hotel service while backend services are wired up.
 */
public final class HotelStaticData {

    private HotelStaticData() {
    }

    public static final List<Map<String, Object>> POPULAR_ORIGINS = List.of(
        Map.of("name", "Ho Chi Minh City", "code", "SGN", "type", "Thành phố", "country", "Vietnam"),
        Map.of("name", "Hanoi", "code", "HAN", "type", "Thành phố", "country", "Vietnam"),
        Map.of("name", "Da Nang", "code", "DAD", "type", "Thành phố", "country", "Vietnam"),
        Map.of("name", "Nha Trang", "code", "CXR", "type", "Thành phố", "country", "Vietnam"),
        Map.of("name", "Phu Quoc", "code", "PQC", "type", "Đảo", "country", "Vietnam")
    );

    public static final List<Map<String, Object>> POPULAR_DESTINATIONS = List.of(
        Map.of("name", "Ho Chi Minh City", "code", "SGN", "country", "Vietnam", "type", "Thành phố"),
        Map.of("name", "Hanoi", "code", "HAN", "country", "Vietnam", "type", "Thành phố"),
        Map.of("name", "Da Nang", "code", "DAD", "country", "Vietnam", "type", "Thành phố"),
        Map.of("name", "Nha Trang", "code", "CXR", "country", "Vietnam", "type", "Thành phố"),
        Map.of("name", "Phu Quoc", "code", "PQC", "country", "Vietnam", "type", "Đảo"),
        Map.of("name", "Da Lat", "code", "DLI", "country", "Vietnam", "type", "Thành phố"),
        Map.of("name", "Hue", "code", "HUI", "country", "Vietnam", "type", "Thành phố"),
        Map.of("name", "Hoi An", "code", "HOI", "country", "Vietnam", "type", "Thành phố"),
        Map.of("name", "Phan Thiet", "code", "PH1", "country", "Vietnam", "type", "Thành phố")
    );
}

