package com.pdh.flight.constant;

/**
 * Constants for image types used in flight service
 */
public final class ImageTypes {
    
    private ImageTypes() {
        // Utility class - prevent instantiation
    }

    // Entity Types
    public static final String ENTITY_TYPE_AIRLINE = "AIRLINE";
    public static final String ENTITY_TYPE_AIRPORT = "AIRPORT";
    public static final String ENTITY_TYPE_FLIGHT = "FLIGHT";
    public static final String ENTITY_TYPE_AIRCRAFT = "AIRCRAFT";

    // Airline Image Types
    public static final String AIRLINE_LOGO = "LOGO";
    public static final String AIRLINE_AIRCRAFT = "AIRCRAFT";
    public static final String AIRLINE_LIVERY = "LIVERY";
    public static final String AIRLINE_TERMINAL = "TERMINAL";
    public static final String AIRLINE_CREW = "CREW";
    public static final String AIRLINE_OTHER = "OTHER";

    // Airport Image Types
    public static final String AIRPORT_TERMINAL = "TERMINAL";
    public static final String AIRPORT_EXTERIOR = "EXTERIOR";
    public static final String AIRPORT_GATE = "GATE";
    public static final String AIRPORT_RUNWAY = "RUNWAY";
    public static final String AIRPORT_LOUNGE = "LOUNGE";
    public static final String AIRPORT_FACILITY = "FACILITY";
    public static final String AIRPORT_BAGGAGE_CLAIM = "BAGGAGE_CLAIM";
    public static final String AIRPORT_SECURITY = "SECURITY";
    public static final String AIRPORT_OTHER = "OTHER";

    // Flight Image Types
    public static final String FLIGHT_AIRCRAFT = "AIRCRAFT";
    public static final String FLIGHT_CABIN = "CABIN";
    public static final String FLIGHT_SEAT = "SEAT";
    public static final String FLIGHT_MEAL = "MEAL";
    public static final String FLIGHT_ENTERTAINMENT = "ENTERTAINMENT";
    public static final String FLIGHT_EXTERIOR = "EXTERIOR";
    public static final String FLIGHT_COCKPIT = "COCKPIT";
    public static final String FLIGHT_BUSINESS_CLASS = "BUSINESS_CLASS";
    public static final String FLIGHT_ECONOMY_CLASS = "ECONOMY_CLASS";
    public static final String FLIGHT_OTHER = "OTHER";

    // Aircraft Image Types
    public static final String AIRCRAFT_EXTERIOR = "EXTERIOR";
    public static final String AIRCRAFT_COCKPIT = "COCKPIT";
    public static final String AIRCRAFT_CABIN = "CABIN";
    public static final String AIRCRAFT_SEAT = "SEAT";
    public static final String AIRCRAFT_OTHER = "OTHER";

    // Common Image Types
    public static final String PRIMARY = "PRIMARY";
    public static final String GALLERY = "GALLERY";
}
