package com.pdh.common.constants;

/**
 * Constants for image management across all services
 */
public class ImageConstants {

    /**
     * Entity types that can have images
     */
    public static class EntityType {
        public static final String HOTEL = "HOTEL";
        public static final String ROOM = "ROOM";
        public static final String ROOM_TYPE = "ROOM_TYPE";
        public static final String AIRLINE = "AIRLINE";
        public static final String FLIGHT = "FLIGHT";
        public static final String AIRPORT = "AIRPORT";
        public static final String USER = "USER";
        public static final String AMENITY = "AMENITY";
    }

    /**
     * Common image types across entities
     */
    public static class ImageType {
        // Universal types
        public static final String PRIMARY = "PRIMARY";
        public static final String GALLERY = "GALLERY";
        public static final String LOGO = "LOGO";
        public static final String THUMBNAIL = "THUMBNAIL";
        
        // Hotel/Room specific
        public static final String EXTERIOR = "EXTERIOR";
        public static final String INTERIOR = "INTERIOR";
        public static final String BATHROOM = "BATHROOM";
        public static final String AMENITY = "AMENITY";
        public static final String VIEW = "VIEW";
        public static final String BED = "BED";
        public static final String WORKSPACE = "WORKSPACE";
        public static final String BALCONY = "BALCONY";
        public static final String DINING = "DINING";
        public static final String LOBBY = "LOBBY";
        public static final String POOL = "POOL";
        public static final String GYM = "GYM";
        public static final String SPA = "SPA";
        
        // Room Type specific
        public static final String HERO = "HERO";
        public static final String LAYOUT = "LAYOUT";
        public static final String FEATURE = "FEATURE";
        
        // Flight/Airline specific
        public static final String AIRCRAFT = "AIRCRAFT";
        public static final String LIVERY = "LIVERY";
        public static final String CABIN = "CABIN";
        public static final String BUSINESS_CLASS = "BUSINESS_CLASS";
        public static final String ECONOMY_CLASS = "ECONOMY_CLASS";
        public static final String FIRST_CLASS = "FIRST_CLASS";
        public static final String SERVICE = "SERVICE";
        public static final String LOUNGE = "LOUNGE";
        public static final String MEAL = "MEAL";
        public static final String ENTERTAINMENT = "ENTERTAINMENT";
        
        // Airport specific
        public static final String TERMINAL = "TERMINAL";
        public static final String GATE = "GATE";
        public static final String RUNWAY = "RUNWAY";
        
        // Generic
        public static final String OTHER = "OTHER";
    }

    /**
     * Default display orders for different image types
     */
    public static class DisplayOrder {
        public static final int PRIMARY = 0;
        public static final int LOGO = 1;
        public static final int HERO = 2;
        public static final int GALLERY_START = 10;
        public static final int AMENITY_START = 100;
        public static final int OTHER_START = 1000;
    }
}
