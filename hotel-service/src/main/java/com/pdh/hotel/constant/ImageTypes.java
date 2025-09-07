package com.pdh.hotel.constant;

/**
 * Constants for image types used in hotel service
 */
public final class ImageTypes {
    
    private ImageTypes() {
        // Utility class - prevent instantiation
    }

    // Entity Types
    public static final String ENTITY_TYPE_HOTEL = "HOTEL";
    public static final String ENTITY_TYPE_ROOM = "ROOM";
    public static final String ENTITY_TYPE_ROOM_TYPE = "ROOM_TYPE";
    public static final String ENTITY_TYPE_AMENITY = "AMENITY";

    // Hotel Image Types
    public static final String HOTEL_EXTERIOR = "EXTERIOR";
    public static final String HOTEL_LOBBY = "LOBBY";
    public static final String HOTEL_RESTAURANT = "RESTAURANT";
    public static final String HOTEL_POOL = "POOL";
    public static final String HOTEL_GYM = "GYM";
    public static final String HOTEL_SPA = "SPA";
    public static final String HOTEL_CONFERENCE = "CONFERENCE";
    public static final String HOTEL_OTHER = "OTHER";

    // Room Image Types
    public static final String ROOM_BEDROOM = "BEDROOM";
    public static final String ROOM_BATHROOM = "BATHROOM";
    public static final String ROOM_VIEW = "VIEW";
    public static final String ROOM_BALCONY = "BALCONY";
    public static final String ROOM_AMENITY = "AMENITY";
    public static final String ROOM_OTHER = "OTHER";

    // Room Type Image Types
    public static final String ROOM_TYPE_SAMPLE = "SAMPLE";
    public static final String ROOM_TYPE_LAYOUT = "LAYOUT";
    public static final String ROOM_TYPE_OTHER = "OTHER";

    // Amenity Image Types
    public static final String AMENITY_ICON = "ICON";
    public static final String AMENITY_PHOTO = "PHOTO";
    public static final String AMENITY_OTHER = "OTHER";

    // Common Image Types
    public static final String PRIMARY = "PRIMARY";
    public static final String GALLERY = "GALLERY";
}
