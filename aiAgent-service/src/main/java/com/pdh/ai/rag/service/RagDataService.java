package com.pdh.ai.rag.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.document.Document;
import org.springframework.ai.reader.JsonReader;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service for processing flight and hotel details and updating RAG data
 * Handles conversion of complete entity details to vector store documents
 */
@Slf4j
@Service
public class RagDataService {

    @Autowired
    private VectorStore vectorStore;

    /**
     * Process complete flight details and update RAG data
     *
     * @param flightDetails The complete flight details from storefront endpoint
     */
    public void processFlightDetails(Map<String, Object> flightDetails) {
        try {
            log.debug("Processing flight details: {}", flightDetails);
            
            // Convert the flight details to documents for the vector store
            List<Document> documents = convertFlightDetailsToDocuments(flightDetails);
           
            // Add documents to vector store
            if (!documents.isEmpty()) {
                vectorStore.add(documents);
                log.info("Added {} flight documents to vector store", documents.size());
            }
        } catch (Exception e) {
            log.error("Error processing flight details: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process flight details", e);
        }
    }

    /**
     * Process complete hotel details and update RAG data
     *
     * @param hotelDetails The complete hotel details from storefront endpoint
     */
    public void processHotelDetails(Map<String, Object> hotelDetails) {
        try {
            log.debug("Processing hotel details: {}", hotelDetails);
            
            // Convert the hotel details to documents for the vector store
            List<Document> documents = convertHotelDetailsToDocuments(hotelDetails);
            
            // Add documents to vector store
            if (!documents.isEmpty()) {
                vectorStore.add(documents);
                vectorStore.
                log.info("Added {} hotel documents to vector store", documents.size());
            }
        } catch (Exception e) {
            log.error("Error processing hotel details: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process hotel details", e);
        }
    }

    /**
     * Convert flight details to documents
     *
     * @param flightDetails The complete flight details
     * @return List of documents
     */
    private List<Document> convertFlightDetailsToDocuments(Map<String, Object> flightDetails) {
        List<Document> documents = new ArrayList<>();
        
        try {
            if (flightDetails == null || flightDetails.isEmpty()) {
                return documents;
            }
            
            // Create content for the document
            StringBuilder content = new StringBuilder();
            content.append("Flight Information: ");
            
            // Extract flight information
            Long flightId = Long.valueOf(getStringValue(flightDetails, "flightId"));
            String flightNumber = getStringValue(flightDetails, "flightNumber");
            String airline = getStringValue(flightDetails, "airline");
            String origin = getStringValue(flightDetails, "origin");
            String destination = getStringValue(flightDetails, "destination");
            String departureTime = getStringValue(flightDetails, "departureTime");
            String arrivalTime = getStringValue(flightDetails, "arrivalTime");
            String duration = getStringValue(flightDetails, "duration");
            String seatClass = getStringValue(flightDetails, "seatClass");
            String originLatitude = getStringValue(flightDetails, "originLatitude");
            String originLongitude = getStringValue(flightDetails, "originLongitude");
            String destinationLatitude = getStringValue(flightDetails, "destinationLatitude");
            String destinationLongitude = getStringValue(flightDetails, "destinationLongitude");
            
            // Add flight details to content
            appendIfNotNull(content, "Flight Number", flightNumber);
            appendIfNotNull(content, "Airline", airline);
            appendIfNotNull(content, "From", origin);
            appendIfNotNull(content, "To", destination);
            appendIfNotNull(content, "Departure", departureTime);
            appendIfNotNull(content, "Arrival", arrivalTime);
            appendIfNotNull(content, "Duration", duration);
            appendIfNotNull(content, "Class", seatClass);
            
            // Add geographic information
            if (originLatitude != null && originLongitude != null) {
                content.append("Origin Coordinates: (").append(originLatitude).append(", ").append(originLongitude).append("). ");
            }
            if (destinationLatitude != null && destinationLongitude != null) {
                content.append("Destination Coordinates: (").append(destinationLatitude).append(", ").append(destinationLongitude).append("). ");
            }
            
            // Add price information if available
            Object priceObj = flightDetails.get("price");
            if (priceObj != null) {
                content.append("Price: ").append(priceObj);
                Object currencyObj = flightDetails.get("currency");
                if (currencyObj != null) {
                    content.append(" ").append(currencyObj);
                }
                content.append(". ");
            }
            
            // Add available seats information if available
            Object availableSeatsObj = flightDetails.get("availableSeats");
            if (availableSeatsObj != null) {
                content.append("Available Seats: ").append(availableSeatsObj).append(". ");
            }
            
            // Add schedule ID if available
            String scheduleId = getStringValue(flightDetails, "scheduleId");
            appendIfNotNull(content, "Schedule ID", scheduleId);
            
            // Create metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("source_type", "flight");
            metadata.put("flight_id", flightId);
            metadata.put("flight_number", flightNumber);
            metadata.put("airline", airline);
            metadata.put("origin", origin);
            metadata.put("destination", destination);
            metadata.put("departure_time", departureTime);
            metadata.put("arrival_time", arrivalTime);
            metadata.put("duration", duration);
            metadata.put("seat_class", seatClass);
            
            if (priceObj != null) {
                metadata.put("price", priceObj);
            }
            
            if (availableSeatsObj != null) {
                metadata.put("available_seats", availableSeatsObj);
            }
            
            if (scheduleId != null) {
                metadata.put("schedule_id", scheduleId);
            }
            
            // Add geographic metadata
            if (originLatitude != null) {
                metadata.put("origin_latitude", originLatitude);
            }
            if (originLongitude != null) {
                metadata.put("origin_longitude", originLongitude);
            }
            if (destinationLatitude != null) {
                metadata.put("destination_latitude", destinationLatitude);
            }
            if (destinationLongitude != null) {
                metadata.put("destination_longitude", destinationLongitude);
            }
            
            // Create document
            Document document = new Document(content.toString(), metadata);
            documents.add(document);
        } catch (Exception e) {
            log.error("Error converting flight details to documents: {}", e.getMessage(), e);
        }
        
        return documents;
    }

    /**
     * Convert hotel details to documents
     *
     * @param hotelDetails The complete hotel details
     * @return List of documents
     */
    private List<Document> convertHotelDetailsToDocuments(Map<String, Object> hotelDetails) {
        List<Document> documents = new ArrayList<>();
        
        try {
            if (hotelDetails == null || hotelDetails.isEmpty()) {
                return documents;
            }
            
            // Create content for the document
            StringBuilder content = new StringBuilder();
            content.append("Hotel Information: ");
            
            // Extract hotel information
            String hotelId = getStringValue(hotelDetails, "hotelId");
            String name = getStringValue(hotelDetails, "name");
            String address = getStringValue(hotelDetails, "address");
            String city = getStringValue(hotelDetails, "city");
            String country = getStringValue(hotelDetails, "country");
            String description = getStringValue(hotelDetails, "description");
            String latitude = getStringValue(hotelDetails, "latitude");
            String longitude = getStringValue(hotelDetails, "longitude");
            
            // Add hotel details to content
            appendIfNotNull(content, "Name", name);
            appendIfNotNull(content, "Address", address);
            appendIfNotNull(content, "Location", city + ", " + country);
            appendIfNotNull(content, "Description", description);
            
            // Add geographic information
            if (latitude != null && longitude != null) {
                content.append("Coordinates: (").append(latitude).append(", ").append(longitude).append("). ");
            }
            
            // Add rating information if available
            Object ratingObj = hotelDetails.get("rating");
            if (ratingObj != null) {
                content.append("Rating: ").append(ratingObj).append(" stars. ");
            }
            
            // Add price information if available
            Object pricePerNightObj = hotelDetails.get("pricePerNight");
            if (pricePerNightObj != null) {
                content.append("Price: ").append(pricePerNightObj);
                Object currencyObj = hotelDetails.get("currency");
                if (currencyObj != null) {
                    content.append(" ").append(currencyObj);
                }
                content.append(" per night. ");
            }
            
            // Add room types information if available
            Object roomTypesObj = hotelDetails.get("roomTypes");
            if (roomTypesObj != null) {
                content.append("Room Types: ").append(roomTypesObj.toString()).append(". ");
            }
            
            // Add amenities information if available
            Object amenitiesObj = hotelDetails.get("amenities");
            if (amenitiesObj != null) {
                content.append("Amenities: ").append(amenitiesObj.toString()).append(". ");
            }
            
            // Add policies information if available
            Object policiesObj = hotelDetails.get("policies");
            if (policiesObj != null) {
                content.append("Policies: ").append(policiesObj.toString()).append(". ");
            }
            
            // Create metadata
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("source_type", "hotel");
            metadata.put("hotel_id", hotelId);
            metadata.put("name", name);
            metadata.put("address", address);
            metadata.put("city", city);
            metadata.put("country", country);
            
            if (ratingObj != null) {
                metadata.put("rating", ratingObj);
            }
            
            if (pricePerNightObj != null) {
                metadata.put("price_per_night", pricePerNightObj);
            }
            
            if (latitude != null) {
                metadata.put("latitude", latitude);
            }
            
            if (longitude != null) {
                metadata.put("longitude", longitude);
            }
            
            // Create document
            Document document = new Document(content.toString(), metadata);
            documents.add(document);
        } catch (Exception e) {
            log.error("Error converting hotel details to documents: {}", e.getMessage(), e);
        }
        
        return documents;
    }

    /**
     * Helper method to get string value from map
     *
     * @param map The map
     * @param key The key
     * @return The string value or null
     */
    private String getStringValue(Map<String, Object> map, String key) {
        Object value = map.get(key);
        return value != null ? value.toString() : null;
    }

    /**
     * Append a field to the content if it's not null
     *
     * @param content The content builder
     * @param fieldName The field name
     * @param fieldValue The field value
     */
    private void appendIfNotNull(StringBuilder content, String fieldName, String fieldValue) {
        if (fieldValue != null && !fieldValue.trim().isEmpty()) {
            content.append(fieldName).append(": ").append(fieldValue).append(". ");
        }
    }
}