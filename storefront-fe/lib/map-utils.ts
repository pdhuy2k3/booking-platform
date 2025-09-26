import type { MapLocation } from '@/components/mapbox-map';
import type { DestinationSearchResult } from '@/types/common';
import type { FlightSearchResult } from '@/modules/flight/type';
import type { HotelSearchResult } from '@/modules/hotel/type';

// Common city coordinates for mapping
const CITY_COORDINATES: Record<string, [number, number]> = {
  // Vietnam cities
  'ho chi minh city': [106.6297, 10.8231],
  'hanoi': [105.8342, 21.0278],
  'da nang': [108.2068, 16.0471],
  'nha trang': [109.1967, 12.2388],
  'hue': [107.5909, 16.4637],
  'da lat': [108.4583, 11.9404],
  'hoi an': [108.3380, 15.8801],
  'can tho': [105.7469, 10.0452],
  'vung tau': [107.1362, 10.4114],
  'phu quoc': [103.9840, 10.2899],
  
  // International cities
  'paris': [2.3522, 48.8566],
  'london': [-0.1278, 51.5074],
  'new york': [-74.0060, 40.7128],
  'tokyo': [139.6503, 35.6762],
  'seoul': [126.9780, 37.5665],
  'singapore': [103.8198, 1.3521],
  'bangkok': [100.5018, 13.7563],
  'kuala lumpur': [101.6869, 3.1390],
  'sydney': [151.2093, -33.8688],
  'melbourne': [144.9631, -37.8136],
  'hong kong': [114.1694, 22.3193],
  'jakarta': [106.8650, -6.2088],
  'manila': [120.9842, 14.5995],
  'taipei': [121.5654, 25.0330],
  'beijing': [116.4074, 39.9042],
  'shanghai': [121.4737, 31.2304],
  'osaka': [135.5023, 34.6937],
  'mumbai': [72.8777, 19.0760],
  'delhi': [77.1025, 28.7041],
  'dubai': [55.2708, 25.2048],
  'doha': [51.5310, 25.2854],
  'abu dhabi': [54.3773, 24.2992],
  'riyadh': [46.6753, 24.7136],
  'cairo': [31.2357, 30.0444],
  'istanbul': [28.9784, 41.0082],
  'moscow': [37.6176, 55.7558],
  'amsterdam': [4.9041, 52.3676],
  'berlin': [13.4050, 52.5200],
  'rome': [12.4964, 41.9028],
  'madrid': [-3.7038, 40.4168],
  'zurich': [8.5417, 47.3769],
  'vienna': [16.3738, 48.2082],
  'prague': [14.4378, 50.0755],
  'budapest': [19.0402, 47.4979],
  'warsaw': [21.0122, 52.2297],
  'stockholm': [18.0686, 59.3293],
  'oslo': [10.7522, 59.9139],
  'helsinki': [24.9384, 60.1699],
  'copenhagen': [12.5683, 55.6761],
  'brussels': [4.3517, 50.8503],
  'lisbon': [-9.1393, 38.7223],
  'athens': [23.7275, 37.9838],
  'bucharest': [26.1025, 44.4268]
};

// Airport codes to city mapping
const AIRPORT_TO_CITY: Record<string, string> = {
  // Vietnam airports
  'SGN': 'ho chi minh city',
  'HAN': 'hanoi',
  'DAD': 'da nang',
  'CXR': 'nha trang',
  'HUI': 'hue',
  'DLI': 'da lat',
  'VCA': 'can tho',
  'VTG': 'vung tau',
  'PQC': 'phu quoc',
  
  // International airports
  'CDG': 'paris',
  'ORY': 'paris',
  'LHR': 'london',
  'LGW': 'london',
  'STN': 'london',
  'JFK': 'new york',
  'LGA': 'new york',
  'EWR': 'new york',
  'NRT': 'tokyo',
  'HND': 'tokyo',
  'ICN': 'seoul',
  'GMP': 'seoul',
  'SIN': 'singapore',
  'BKK': 'bangkok',
  'DMK': 'bangkok',
  'KUL': 'kuala lumpur',
  'SYD': 'sydney',
  'MEL': 'melbourne',
  'HKG': 'hong kong',
  'CGK': 'jakarta',
  'MNL': 'manila',
  'TPE': 'taipei',
  'TSA': 'taipei',
  'PEK': 'beijing',
  'PVG': 'shanghai',
  'SHA': 'shanghai',
  'KIX': 'osaka',
  'ITM': 'osaka',
  'BOM': 'mumbai',
  'DEL': 'delhi',
  'DXB': 'dubai',
  'DOH': 'doha',
  'AUH': 'abu dhabi'
};

function getCityCoordinates(cityName: string): [number, number] | null {
  const normalizedCity = cityName.toLowerCase().trim();
  return CITY_COORDINATES[normalizedCity] || null;
}

function getAirportCoordinates(airportCode: string): [number, number] | null {
  const cityName = AIRPORT_TO_CITY[airportCode.toUpperCase()];
  if (cityName) {
    return getCityCoordinates(cityName);
  }
  return null;
}

/**
 * Convert destination search results to map locations
 */
export function destinationsToMapLocations(destinations: DestinationSearchResult[]): MapLocation[] {
  return destinations
    .filter(dest => dest.latitude != null && dest.longitude != null)
    .map(dest => ({
      id: dest.iataCode || `dest_${dest.latitude}_${dest.longitude}`,
      name: dest.name,
      latitude: dest.latitude!,
      longitude: dest.longitude!,
      type: 'destination' as const,
      description: [dest.description, dest.country].filter(Boolean).join(', ')
    }));
}

/**
 * Convert hotel search results to map locations
 * Uses city-based coordinates for hotel locations
 */
export function hotelsToMapLocations(hotels: HotelSearchResult[]): MapLocation[] {
  return hotels
    .map(hotel => {
      // Try to get coordinates from hotel location data
      const coordinates = getCityCoordinates(hotel.city) || 
                         getCityCoordinates(hotel.address);
      
      if (!coordinates) {
        console.warn(`No coordinates found for hotel: ${hotel.name} in ${hotel.city}`);
        return null;
      }

      return {
        id: hotel.hotelId,
        name: hotel.name,
        latitude: coordinates[1],
        longitude: coordinates[0],
        type: 'hotel' as const,
        description: `${hotel.address}, ${hotel.city}`,
        price: `${hotel.currency} ${hotel.pricePerNight.toLocaleString()}/night`,
        image: hotel.primaryImage || hotel.images?.[0]
      };
    })
    .filter((location): location is NonNullable<typeof location> => location !== null);
}

/**
 * Convert flight search results to map locations (departure and arrival airports)
 * Uses airport codes to find coordinates
 */
export function flightsToMapLocations(flights: FlightSearchResult[]): MapLocation[] {
  const locations: MapLocation[] = [];
  const addedAirports = new Set<string>();

  flights.forEach(flight => {
    // Add origin airport
    if (!addedAirports.has(flight.origin)) {
      const originCoords = getAirportCoordinates(flight.origin);
      if (originCoords) {
        locations.push({
          id: `airport_${flight.origin}`,
          name: flight.origin,
          latitude: originCoords[1],
          longitude: originCoords[0],
          type: 'airport' as const,
          description: `Departure from ${flight.origin}`
        });
      } else {
        console.warn(`No coordinates found for airport: ${flight.origin}`);
      }
      addedAirports.add(flight.origin);
    }

    // Add destination airport
    if (!addedAirports.has(flight.destination)) {
      const destCoords = getAirportCoordinates(flight.destination);
      if (destCoords) {
        locations.push({
          id: `airport_${flight.destination}`,
          name: flight.destination,
          latitude: destCoords[1],
          longitude: destCoords[0],
          type: 'airport' as const,
          description: `Arrival at ${flight.destination}`
        });
      } else {
        console.warn(`No coordinates found for airport: ${flight.destination}`);
      }
      addedAirports.add(flight.destination);
    }
  });

  return locations;
}

/**
 * Create a custom map location from coordinates
 */
export function createCustomLocation(
  longitude: number,
  latitude: number,
  name?: string,
  description?: string
): MapLocation {
  return {
    id: `custom_${longitude}_${latitude}`,
    name: name || `Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
    latitude,
    longitude,
    type: 'custom',
    description
  };
}

/**
 * Get Vietnam's popular destinations as map locations
 */
export function getPopularVietnamLocations(): MapLocation[] {
  return [
    {
      id: 'hcm_city',
      name: 'Ho Chi Minh City',
      latitude: 10.8231,
      longitude: 106.6297,
      type: 'destination',
      description: 'Largest city in Vietnam'
    },
    {
      id: 'hanoi',
      name: 'Hanoi',
      latitude: 21.0278,
      longitude: 105.8342,
      type: 'destination',
      description: 'Capital of Vietnam'
    },
    {
      id: 'da_nang',
      name: 'Da Nang',
      latitude: 16.0471,
      longitude: 108.2068,
      type: 'destination',
      description: 'Central coast city'
    },
    {
      id: 'nha_trang',
      name: 'Nha Trang',
      latitude: 12.2388,
      longitude: 109.1967,
      type: 'destination',
      description: 'Coastal resort city'
    },
    {
      id: 'hue',
      name: 'Hue',
      latitude: 16.4637,
      longitude: 107.5909,
      type: 'destination',
      description: 'Former imperial capital'
    },
    {
      id: 'da_lat',
      name: 'Da Lat',
      latitude: 11.9404,
      longitude: 108.4583,
      type: 'destination',
      description: 'Mountain resort city'
    },
    {
      id: 'hoi_an',
      name: 'Hoi An',
      latitude: 15.8801,
      longitude: 108.3380,
      type: 'destination',
      description: 'Ancient town UNESCO site'
    },
    {
      id: 'phu_quoc',
      name: 'Phu Quoc',
      latitude: 10.2899,
      longitude: 103.9840,
      type: 'destination',
      description: 'Island paradise'
    }
  ];
}

/**
 * Get bounds for a list of locations
 */
export function getLocationsBounds(locations: MapLocation[]): {
  sw: [number, number];
  ne: [number, number];
} | null {
  if (locations.length === 0) return null;

  let minLng = locations[0].longitude;
  let maxLng = locations[0].longitude;
  let minLat = locations[0].latitude;
  let maxLat = locations[0].latitude;

  locations.forEach(location => {
    minLng = Math.min(minLng, location.longitude);
    maxLng = Math.max(maxLng, location.longitude);
    minLat = Math.min(minLat, location.latitude);
    maxLat = Math.max(maxLat, location.latitude);
  });

  return {
    sw: [minLng, minLat],
    ne: [maxLng, maxLat]
  };
}

/**
 * Calculate distance between two locations in kilometers
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Find nearest location to given coordinates
 */
export function findNearestLocation(
  targetLat: number,
  targetLng: number,
  locations: MapLocation[]
): MapLocation | null {
  if (locations.length === 0) return null;

  let nearest = locations[0];
  let minDistance = calculateDistance(targetLat, targetLng, nearest.latitude, nearest.longitude);

  locations.forEach(location => {
    const distance = calculateDistance(targetLat, targetLng, location.latitude, location.longitude);
    if (distance < minDistance) {
      minDistance = distance;
      nearest = location;
    }
  });

  return nearest;
}