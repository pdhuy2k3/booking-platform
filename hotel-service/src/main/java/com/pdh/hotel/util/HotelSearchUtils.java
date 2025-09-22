package com.pdh.hotel.util;

import com.pdh.common.validation.SearchValidation;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Shared helper methods for hotel search handling.
 */
public final class HotelSearchUtils {

    private HotelSearchUtils() {
    }

    public static List<String> extractDestinationTerms(String destination) {
        if (!StringUtils.hasText(destination)) {
            return List.of();
        }

        String normalized = destination.trim().replaceAll("\\s+", " ");
        LinkedHashSet<String> terms = new LinkedHashSet<>();
        terms.add(normalized);

        for (String part : normalized.split(",")) {
            String trimmed = part.trim();
            if (StringUtils.hasText(trimmed)) {
                terms.add(trimmed);
            }
        }

        return new ArrayList<>(terms);
    }

    public static List<String> sanitizeAmenities(List<String> amenities) {
        if (CollectionUtils.isEmpty(amenities)) {
            return List.of();
        }

        return amenities.stream()
            .map(SearchValidation::sanitizeSearchQuery)
            .filter(StringUtils::hasText)
            .collect(Collectors.toList());
    }
}

