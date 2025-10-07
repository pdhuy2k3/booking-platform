/**
 * Mapbox Search Types
 * Based on Mapbox Search JS API v1
 */

export interface MapboxFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number];
  };
  properties: {
    mapbox_id: string;
    feature_type: 'country' | 'region' | 'postcode' | 'district' | 'place' | 'locality' | 'neighborhood' | 'street' | 'address' | 'poi';
    name: string;
    name_preferred?: string;
    place_formatted?: string;
    full_address?: string;
    address?: string;
    country?: string;
    country_code?: string;
    region?: string;
    region_code?: string;
    postcode?: string;
    locality?: string;
    neighborhood?: string;
    street?: string;
    maki?: string;
    poi_category?: string[];
    poi_category_ids?: string[];
    context?: {
      country?: {
        name: string;
        country_code: string;
        country_code_alpha_3: string;
      };
      region?: {
        name: string;
        region_code: string;
        region_code_full: string;
      };
      postcode?: {
        name: string;
      };
      place?: {
        name: string;
      };
      locality?: {
        name: string;
      };
      neighborhood?: {
        name: string;
      };
      street?: {
        name: string;
      };
    };
    coordinates?: {
      latitude: number;
      longitude: number;
      accuracy?: string;
      routable_points?: Array<{
        name: string;
        latitude: number;
        longitude: number;
      }>;
    };
    language?: string;
    external_ids?: Record<string, string>;
    metadata?: Record<string, any>;
  };
}

export interface MapboxSuggestion {
  name: string;
  mapbox_id: string;
  feature_type: MapboxFeature['properties']['feature_type'];
  address?: string;
  full_address?: string;
  place_formatted?: string;
  context?: MapboxFeature['properties']['context'];
  language?: string;
  maki?: string;
  poi_category?: string[];
  poi_category_ids?: string[];
  external_ids?: Record<string, string>;
  metadata?: Record<string, any>;
}

export interface MapboxSuggestResponse {
  suggestions: MapboxSuggestion[];
  attribution: string;
}

export interface MapboxRetrieveResponse {
  type: 'FeatureCollection';
  features: MapboxFeature[];
  attribution: string;
}

export interface MapboxSearchConfig {
  accessToken: string;
  language?: string;
  country?: string;
  proximity?: 'ip' | { longitude: number; latitude: number };
  bbox?: [number, number, number, number];
  limit?: number;
  types?: MapboxFeature['properties']['feature_type'][];
  sessionToken?: string;
}

export interface MapboxSearchParams {
  q: string;
  language?: string;
  limit?: number;
  proximity?: string;
  bbox?: string;
  country?: string;
  types?: string;
  session_token?: string;
  access_token?: string;
}

export interface MapboxRetrieveParams {
  mapbox_id: string;
  session_token?: string;
}

export interface MapboxDestinationResult {
  id: string;
  name: string;
  type: string;
  country: string;
  category: string;
  description?: string;
  latitude: number;
  longitude: number;
  fullAddress?: string;
  placeFormatted?: string;
  context?: MapboxFeature['properties']['context'];
  maki?: string;
  poiCategories?: string[];
  relevanceScore?: number;
}

export interface MapboxSearchResponse<T = MapboxDestinationResult> {
  results: T[];
  totalCount: number;
  query?: string;
  limit?: number;
  page?: number;
  hasMore?: boolean;
  metadata?: {
    source: string;
    sessionToken?: string;
    attribution?: string;
    [key: string]: any;
  };
}

export interface MapboxSearchBoxConfig {
  accessToken: string;
  language?: string;
  country?: string;
  limit?: number;
  types?: MapboxFeature['properties']['feature_type'][];
  placeholder?: string;
  theme?: {
    variables?: Record<string, string>;
    cssText?: string;
  };
  options?: {
    proximity?: 'ip' | { longitude: number; latitude: number };
    bbox?: [number, number, number, number];
    navigation?: boolean;
  };
}

export interface PopularDestination {
  id: string;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  region?: string;
  type: string;
  imageUrl?: string;
  description?: string;
}

export const VIETNAM_POPULAR_DESTINATIONS: PopularDestination[] = [
  {
    id: 'hcm-city',
    name: 'Ho Chi Minh City',
    country: 'Vietnam',
    latitude: 10.8231,
    longitude: 106.6297,
    region: 'Ho Chi Minh',
    type: 'city',
    description: 'Thành phố năng động nhất Việt Nam',
  },
  {
    id: 'hanoi',
    name: 'Hanoi',
    country: 'Vietnam',
    latitude: 21.0278,
    longitude: 105.8342,
    region: 'Ha Noi',
    type: 'city',
    description: 'Thủ đô ngàn năm văn hiến',
  },
  {
    id: 'da-nang',
    name: 'Da Nang',
    country: 'Vietnam',
    latitude: 16.0471,
    longitude: 108.2068,
    region: 'Da Nang',
    type: 'city',
    description: 'Thành phố đáng sống bậc nhất',
  },
  {
    id: 'nha-trang',
    name: 'Nha Trang',
    country: 'Vietnam',
    latitude: 12.2388,
    longitude: 109.1967,
    region: 'Khanh Hoa',
    type: 'city',
    description: 'Thiên đường biển đảo',
  },
  {
    id: 'hue',
    name: 'Hue',
    country: 'Vietnam',
    latitude: 16.4637,
    longitude: 107.5909,
    region: 'Thua Thien-Hue',
    type: 'city',
    description: 'Cố đô với di sản văn hóa thế giới',
  },
  {
    id: 'da-lat',
    name: 'Da Lat',
    country: 'Vietnam',
    latitude: 11.9404,
    longitude: 108.4583,
    region: 'Lam Dong',
    type: 'city',
    description: 'Thành phố ngàn hoa',
  },
  {
    id: 'hoi-an',
    name: 'Hoi An',
    country: 'Vietnam',
    latitude: 15.8801,
    longitude: 108.3380,
    region: 'Quang Nam',
    type: 'city',
    description: 'Phố cổ di sản thế giới',
  },
  {
    id: 'phu-quoc',
    name: 'Phu Quoc',
    country: 'Vietnam',
    latitude: 10.2899,
    longitude: 103.9840,
    region: 'Kien Giang',
    type: 'city',
    description: 'Đảo ngọc thiên đường',
  },
  {
    id: 'vung-tau',
    name: 'Vung Tau',
    country: 'Vietnam',
    latitude: 10.4114,
    longitude: 107.1362,
    region: 'Ba Ria-Vung Tau',
    type: 'city',
    description: 'Thành phố biển gần Sài Gòn',
  },
  {
    id: 'can-tho',
    name: 'Can Tho',
    country: 'Vietnam',
    latitude: 10.0452,
    longitude: 105.7469,
    region: 'Can Tho',
    type: 'city',
    description: 'Thủ phủ miền Tây sông nước',
  },
];

