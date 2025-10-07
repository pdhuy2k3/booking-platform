package com.pdh.flight.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service for mapping city names to IATA codes and providing city search functionality
 */
@Service
@Slf4j
public class CityMappingService {
    
    // City to IATA codes mapping
    private final Map<String, List<String>> cityToIataMap;
    private final Map<String, String> iataToCityMap;
    private final Map<String, String> iataToCountryMap;
    
    public CityMappingService() {
        this.cityToIataMap = initializeCityToIataMapping();
        this.iataToCityMap = initializeIataToCityMapping();
        this.iataToCountryMap = initializeIataToCountryMapping();
    }
    
    /**
     * Get IATA codes for a given city name with fuzzy matching
     * @param cityName the city name to search for
     * @return list of IATA codes for the city
     */
    public List<String> getIataCodesForCity(String cityName) {
        if (cityName == null || cityName.trim().isEmpty()) {
            return Collections.emptyList();
        }
        
        String normalizedCity = normalizeCityName(cityName);
        log.debug("Searching IATA codes for city: {} (normalized: {})", cityName, normalizedCity);
        
        // Direct match
        List<String> directMatch = cityToIataMap.get(normalizedCity.toLowerCase());
        if (directMatch != null && !directMatch.isEmpty()) {
            log.debug("Found direct match for city: {}", normalizedCity);
            return directMatch;
        }
        
        // Fuzzy match
        List<String> fuzzyMatches = findFuzzyMatches(normalizedCity);
        if (!fuzzyMatches.isEmpty()) {
            log.debug("Found fuzzy matches for city: {}", normalizedCity);
            return fuzzyMatches;
        }
        
        log.debug("No IATA codes found for city: {}", cityName);
        return Collections.emptyList();
    }
    
    /**
     * Get city name for a given IATA code
     * @param iataCode the IATA code
     * @return city name or null if not found
     */
    public String getCityNameForIataCode(String iataCode) {
        if (iataCode == null || iataCode.trim().isEmpty()) {
            return null;
        }
        return iataToCityMap.get(iataCode.toUpperCase());
    }
    
    /**
     * Get country name for a given IATA code
     * @param iataCode the IATA code
     * @return country name or null if not found
     */
    public String getCountryForIataCode(String iataCode) {
        if (iataCode == null || iataCode.trim().isEmpty()) {
            return null;
        }
        return iataToCountryMap.get(iataCode.toUpperCase());
    }
    
    /**
     * Search for cities matching the given query
     * @param query the search query
     * @return list of city search results
     */
    public List<CitySearchResult> searchCities(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getPopularCities();
        }
        
        String normalizedQuery = normalizeCityName(query);
        List<CitySearchResult> results = new ArrayList<>();
        
        // Search in city names
        for (Map.Entry<String, List<String>> entry : cityToIataMap.entrySet()) {
            String cityName = entry.getKey();
            List<String> iataCodes = entry.getValue();
            
            if (cityName.toLowerCase().contains(normalizedQuery.toLowerCase())) {
                for (String iataCode : iataCodes) {
                    results.add(new CitySearchResult(
                        cityName,
                        iataCode,
                        getCountryForIataCode(iataCode),
                        calculateRelevanceScore(cityName, normalizedQuery)
                    ));
                }
            }
        }
        
        // Sort by relevance score (higher is better)
        results.sort((a, b) -> Double.compare(b.getRelevanceScore(), a.getRelevanceScore()));
        
        // Limit results
        return results.stream().limit(20).collect(Collectors.toList());
    }
    
    /**
     * Check if a string is likely an IATA code
     * @param input the input string
     * @return true if it looks like an IATA code
     */
    public boolean isIataCode(String input) {
        if (input == null || input.trim().isEmpty()) {
            return false;
        }
        String trimmed = input.trim().toUpperCase();
        return trimmed.length() == 3 && trimmed.matches("[A-Z]{3}");
    }
    
    /**
     * Normalize city name for consistent matching
     * @param cityName the city name to normalize
     * @return normalized city name
     */
    public String normalizeCityName(String cityName) {
        if (cityName == null) {
            return "";
        }
        
        return cityName.trim()
                .toLowerCase()
                .replaceAll("[àáạảãâầấậẩẫăằắặẳẵ]", "a")
                .replaceAll("[èéẹẻẽêềếệểễ]", "e")
                .replaceAll("[ìíịỉĩ]", "i")
                .replaceAll("[òóọỏõôồốộổỗơờớợởỡ]", "o")
                .replaceAll("[ùúụủũưừứựửữ]", "u")
                .replaceAll("[ỳýỵỷỹ]", "y")
                .replaceAll("[đ]", "d")
                .replaceAll("[^a-z0-9\\s]", "")
                .replaceAll("\\s+", " ")
                .trim();
    }
    
    /**
     * Find fuzzy matches for a city name
     * @param normalizedCity the normalized city name
     * @return list of IATA codes for fuzzy matches
     */
    private List<String> findFuzzyMatches(String normalizedCity) {
        List<String> matches = new ArrayList<>();
        
        for (String cityName : cityToIataMap.keySet()) {
            if (isFuzzyMatch(normalizedCity, cityName)) {
                matches.addAll(cityToIataMap.get(cityName));
            }
        }
        
        return matches;
    }
    
    /**
     * Check if two city names are fuzzy matches
     * @param query the search query
     * @param cityName the city name to check
     * @return true if they are fuzzy matches
     */
    private boolean isFuzzyMatch(String query, String cityName) {
        // Simple fuzzy matching - can be enhanced with more sophisticated algorithms
        if (cityName.contains(query) || query.contains(cityName)) {
            return true;
        }
        
        // Check for common abbreviations
        Map<String, String> abbreviations = Map.of(
            "ho chi minh", "hcm",
            "hcm", "ho chi minh",
            "thanh pho ho chi minh", "hcm",
            "tp ho chi minh", "hcm", 
            "hanoi", "hn",
            "hn", "hanoi",
            "ha noi", "hanoi",
            "da nang", "dn",
            "dn", "da nang"
        );
        
        String abbreviation = abbreviations.get(query);
        if (abbreviation != null && cityName.contains(abbreviation)) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Calculate relevance score for search results
     * @param cityName the city name
     * @param query the search query
     * @return relevance score
     */
    private double calculateRelevanceScore(String cityName, String query) {
        if (cityName.equalsIgnoreCase(query)) {
            return 1.0; // Exact match
        }
        
        if (cityName.toLowerCase().startsWith(query.toLowerCase())) {
            return 0.9; // Starts with query
        }
        
        if (cityName.toLowerCase().contains(query.toLowerCase())) {
            return 0.7; // Contains query
        }
        
        return 0.5; // Fuzzy match
    }
    
    /**
     * Get popular cities for initial display
     * @return list of popular cities
     */
    public List<CitySearchResult> getPopularCities() {
        return List.of(
            new CitySearchResult("Ho Chi Minh City", "SGN", "Vietnam", 1.0),
            new CitySearchResult("Hanoi", "HAN", "Vietnam", 1.0),
            new CitySearchResult("Da Nang", "DAD", "Vietnam", 1.0),
            new CitySearchResult("Nha Trang", "CXR", "Vietnam", 1.0),
            new CitySearchResult("Can Tho", "VCA", "Vietnam", 1.0),
            new CitySearchResult("Hai Phong", "HPH", "Vietnam", 1.0),
            new CitySearchResult("Hue", "HUI", "Vietnam", 1.0),
            new CitySearchResult("Vinh", "VII", "Vietnam", 1.0)
        );
    }
    
    /**
     * Initialize city to IATA codes mapping
     */
    private Map<String, List<String>> initializeCityToIataMapping() {
        Map<String, List<String>> mapping = new HashMap<>();
        
        // Vietnam cities - English names
        mapping.put("ho chi minh city", List.of("SGN"));
        mapping.put("hcm", List.of("SGN"));
        mapping.put("saigon", List.of("SGN"));
        mapping.put("hanoi", List.of("HAN"));
        mapping.put("da nang", List.of("DAD"));
        mapping.put("nha trang", List.of("CXR"));
        mapping.put("can tho", List.of("VCA"));
        mapping.put("hai phong", List.of("HPH"));
        mapping.put("hue", List.of("HUI"));
        mapping.put("vinh", List.of("VII"));
        mapping.put("phu quoc", List.of("PQC"));
        mapping.put("da lat", List.of("DLI"));
        mapping.put("quang ninh", List.of("VDO"));
        mapping.put("buon ma thuot", List.of("BMV"));
        
        // Vietnam cities - Vietnamese names with special characters
        mapping.put("thành phố hồ chí minh", List.of("SGN"));
        mapping.put("tp hồ chí minh", List.of("SGN"));
        mapping.put("tp.hcm", List.of("SGN"));
      
        mapping.put("hồ chí minh", List.of("SGN"));
        mapping.put("sài gòn", List.of("SGN"));
        mapping.put("hà nội", List.of("HAN"));
        mapping.put("hải phòng", List.of("HPH"));
        mapping.put("đà nẵng", List.of("DAD"));
        mapping.put("nha trang", List.of("CXR"));
        mapping.put("cần thơ", List.of("VCA"));
        mapping.put("huế", List.of("HUI"));
        mapping.put("vinh", List.of("VII"));
        mapping.put("phú quốc", List.of("PQC"));
        mapping.put("đà lạt", List.of("DLI"));
        mapping.put("quảng ninh", List.of("VDO"));
        mapping.put("buôn ma thuột", List.of("BMV"));
        
        // International cities (examples)
        mapping.put("bangkok", List.of("BKK"));
        mapping.put("singapore", List.of("SIN"));
        mapping.put("kuala lumpur", List.of("KUL"));
        mapping.put("jakarta", List.of("CGK"));
        mapping.put("manila", List.of("MNL"));
        mapping.put("seoul", List.of("ICN"));
        mapping.put("tokyo", List.of("NRT", "HND"));
        mapping.put("hong kong", List.of("HKG"));
        mapping.put("taipei", List.of("TPE"));
        mapping.put("shanghai", List.of("PVG", "SHA"));
        mapping.put("beijing", List.of("PEK"));
        mapping.put("guangzhou", List.of("CAN"));
        mapping.put("shenzhen", List.of("SZX"));
        
        return mapping;
    }
    
    /**
     * Initialize IATA to city mapping
     */
    private Map<String, String> initializeIataToCityMapping() {
        Map<String, String> mapping = new HashMap<>();
        
        // Vietnam airports
        mapping.put("SGN", "Ho Chi Minh City");
        mapping.put("HAN", "Hanoi");
        mapping.put("DAD", "Da Nang");
        mapping.put("CXR", "Nha Trang");
        mapping.put("VCA", "Can Tho");
        mapping.put("HPH", "Hai Phong");
        mapping.put("HUI", "Hue");
        mapping.put("VII", "Vinh");
        mapping.put("PQC", "Phu Quoc");
        mapping.put("DLI", "Da Lat");
        mapping.put("VDO", "Quang Ninh");
        mapping.put("BMV", "Buon Ma Thuot");
        
        // International airports
        mapping.put("BKK", "Bangkok");
        mapping.put("SIN", "Singapore");
        mapping.put("KUL", "Kuala Lumpur");
        mapping.put("CGK", "Jakarta");
        mapping.put("MNL", "Manila");
        mapping.put("ICN", "Seoul");
        mapping.put("NRT", "Tokyo");
        mapping.put("HND", "Tokyo");
        mapping.put("HKG", "Hong Kong");
        mapping.put("TPE", "Taipei");
        mapping.put("PVG", "Shanghai");
        mapping.put("SHA", "Shanghai");
        mapping.put("PEK", "Beijing");
        mapping.put("CAN", "Guangzhou");
        mapping.put("SZX", "Shenzhen");
        
        return mapping;
    }
    
    /**
     * Initialize IATA to country mapping
     */
    private Map<String, String> initializeIataToCountryMapping() {
        Map<String, String> mapping = new HashMap<>();
        
        // Vietnam airports
        mapping.put("SGN", "Vietnam");
        mapping.put("HAN", "Vietnam");
        mapping.put("DAD", "Vietnam");
        mapping.put("CXR", "Vietnam");
        mapping.put("VCA", "Vietnam");
        mapping.put("HPH", "Vietnam");
        mapping.put("HUI", "Vietnam");
        mapping.put("VII", "Vietnam");
        mapping.put("PQC", "Vietnam");
        mapping.put("DLI", "Vietnam");
        mapping.put("VDO", "Vietnam");
        mapping.put("BMV", "Vietnam");
        
        // International airports
        mapping.put("BKK", "Thailand");
        mapping.put("SIN", "Singapore");
        mapping.put("KUL", "Malaysia");
        mapping.put("CGK", "Indonesia");
        mapping.put("MNL", "Philippines");
        mapping.put("ICN", "South Korea");
        mapping.put("NRT", "Japan");
        mapping.put("HND", "Japan");
        mapping.put("HKG", "Hong Kong");
        mapping.put("TPE", "Taiwan");
        mapping.put("PVG", "China");
        mapping.put("SHA", "China");
        mapping.put("PEK", "China");
        mapping.put("CAN", "China");
        mapping.put("SZX", "China");
        
        return mapping;
    }
    
    /**
     * City search result DTO
     */
    public static class CitySearchResult {
        private final String cityName;
        private final String iataCode;
        private final String country;
        private final double relevanceScore;
        
        public CitySearchResult(String cityName, String iataCode, String country, double relevanceScore) {
            this.cityName = cityName;
            this.iataCode = iataCode;
            this.country = country;
            this.relevanceScore = relevanceScore;
        }
        
        public String getCityName() { return cityName; }
        public String getIataCode() { return iataCode; }
        public String getCountry() { return country; }
        public double getRelevanceScore() { return relevanceScore; }
    }
}
