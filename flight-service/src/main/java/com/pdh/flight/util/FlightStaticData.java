package com.pdh.flight.util;

import java.util.List;
import java.util.Map;

/**
 * Static data used by flight storefront endpoints (temporary until backed by real services).
 */
public final class FlightStaticData {

    private FlightStaticData() {
    }

    public static final List<Map<String, Object>> POPULAR_DESTINATIONS = List.of(
        Map.of(
            "code", "SGN",
            "name", "Tan Son Nhat International Airport",
            "city", "Ho Chi Minh City",
            "country", "Vietnam",
            "image", "/destinations/hcmc.jpg",
            "averagePrice", 2_200_000,
            "currency", "VND"
        ),
        Map.of(
            "code", "DAD",
            "name", "Da Nang International Airport",
            "city", "Da Nang",
            "country", "Vietnam",
            "image", "/destinations/danang.jpg",
            "averagePrice", 1_800_000,
            "currency", "VND"
        ),
        Map.of(
            "code", "HAN",
            "name", "Noi Bai International Airport",
            "city", "Hanoi",
            "country", "Vietnam",
            "image", "/destinations/hanoi.jpg",
            "averagePrice", 2_500_000,
            "currency", "VND"
        )
    );
}

