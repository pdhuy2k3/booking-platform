/**
 * Mapbox Search Service
 * Server-side service using MAPBOX_ACCESS_TOKEN from env.mjs
 */

import type {
  MapboxSearchParams,
  MapboxRetrieveParams,
  MapboxSuggestResponse,
  MapboxRetrieveResponse,
  MapboxDestinationResult,
  MapboxSearchResponse,
  MapboxFeature,
  MapboxSuggestion,
  PopularDestination,
} from '../types';
import { VIETNAM_POPULAR_DESTINATIONS } from '../types';

const MAPBOX_SEARCH_BASE_URL = 'https://api.mapbox.com/search/searchbox/v1';
const DEFAULT_LANGUAGE = 'vi';
const DEFAULT_COUNTRY = 'VN';
const DEFAULT_LIMIT = 10;

/**
 * Get Mapbox access token from server-side environment
 * This should only be called on the server
 */
const getAccessToken = (): string => {
  // This will be imported from env.mjs on server-side
  if (typeof window !== 'undefined') {
    throw new Error('getAccessToken should only be called on the server');
  }

  // Will be imported dynamically in API routes
  return process.env.MAPBOX_ACCESS_TOKEN || '';
};

const buildQueryString = (params: Record<string, string | number | undefined>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

const generateSessionToken = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const mapSuggestionToDestination = (
  suggestion: MapboxSuggestion,
  relevanceScore?: number
): MapboxDestinationResult => {
  return {
    id: suggestion.mapbox_id,
    name: suggestion.name,
    type: suggestion.feature_type,
    country: suggestion.context?.country?.name || 'Unknown',
    category: suggestion.feature_type,
    description: suggestion.place_formatted || suggestion.full_address,
    latitude: 0,
    longitude: 0,
    fullAddress: suggestion.full_address,
    placeFormatted: suggestion.place_formatted,
    context: suggestion.context,
    maki: suggestion.maki,
    poiCategories: suggestion.poi_category,
    relevanceScore,
  };
};

const mapFeatureToDestination = (
  feature: MapboxFeature,
  relevanceScore?: number
): MapboxDestinationResult => {
  const [longitude, latitude] = feature.geometry.coordinates;

  return {
    id: feature.properties.mapbox_id,
    name: feature.properties.name,
    type: feature.properties.feature_type,
    country: feature.properties.country || 'Unknown',
    category: feature.properties.feature_type,
    description: feature.properties.place_formatted || feature.properties.full_address,
    latitude,
    longitude,
    fullAddress: feature.properties.full_address,
    placeFormatted: feature.properties.place_formatted,
    context: feature.properties.context,
    maki: feature.properties.maki,
    poiCategories: feature.properties.poi_category,
    relevanceScore,
  };
};

const calculateRelevanceScore = (resultName: string, query: string): number => {
  const lowerResultName = resultName.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (lowerResultName === lowerQuery) return 1.0;
  if (lowerResultName.startsWith(lowerQuery)) return 0.9;
  if (lowerResultName.includes(lowerQuery)) return 0.7;
  return 0.5;
};

/**
 * Server-side Mapbox Search Service
 * Must be called from API routes or server components
 */
export class MapboxSearchService {
  private accessToken: string;
  private currentSessionToken: string;
  private language: string;
  private country: string;
  private limit: number;

  constructor(accessToken?: string) {
    this.accessToken = accessToken || getAccessToken();
    this.currentSessionToken = generateSessionToken();
    this.language = DEFAULT_LANGUAGE;
    this.country = DEFAULT_COUNTRY;
    this.limit = DEFAULT_LIMIT;
  }

  public getSessionToken(): string {
    return this.currentSessionToken;
  }

  public refreshSessionToken(): string {
    this.currentSessionToken = generateSessionToken();
    return this.currentSessionToken;
  }

  async suggest(query: string, options?: Partial<MapboxSearchParams>): Promise<MapboxSuggestResponse> {
    if (!this.accessToken) {
      throw new Error('Mapbox access token is required');
    }

    const params: MapboxSearchParams = {
      q: query,
      access_token: this.accessToken,
      language: options?.language || this.language,
      limit: options?.limit || this.limit,
      country: options?.country || this.country,
      session_token: options?.session_token || this.currentSessionToken,
      ...options,
    };

    const queryString = buildQueryString(params as any);
    const url = `${MAPBOX_SEARCH_BASE_URL}/suggest?${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Mapbox suggest request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async retrieve(params: MapboxRetrieveParams): Promise<MapboxRetrieveResponse> {
    if (!this.accessToken) {
      throw new Error('Mapbox access token is required');
    }

    const queryParams = {
      access_token: this.accessToken,
      session_token: params.session_token || this.currentSessionToken,
    };

    const queryString = buildQueryString(queryParams);
    const url = `${MAPBOX_SEARCH_BASE_URL}/retrieve/${params.mapbox_id}?${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Mapbox retrieve request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async searchDestinations(
    query?: string,
    limit: number = DEFAULT_LIMIT
  ): Promise<MapboxSearchResponse<MapboxDestinationResult>> {
    const sanitizedQuery = query?.trim();

    if (!sanitizedQuery) {
      return this.getPopularDestinations();
    }

    try {
      const suggestResponse = await this.suggest(sanitizedQuery, { limit });

      const destinations = suggestResponse.suggestions.map((suggestion: MapboxSuggestion) => {
        const relevanceScore = calculateRelevanceScore(suggestion.name, sanitizedQuery);
        return mapSuggestionToDestination(suggestion, relevanceScore);
      });

      return {
        results: destinations,
        totalCount: destinations.length,
        query: sanitizedQuery,
        limit,
        page: 1,
        hasMore: destinations.length >= limit,
        metadata: {
          source: 'mapbox_search_api',
          sessionToken: this.currentSessionToken,
          attribution: suggestResponse.attribution,
        },
      };
    } catch (error) {
      console.error('Error searching destinations via Mapbox:', error);
      return {
        results: [],
        totalCount: 0,
        query: sanitizedQuery,
        metadata: {
          source: 'mapbox_search_api',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async getDestinationById(mapboxId: string): Promise<MapboxDestinationResult | null> {
    try {
      const retrieveResponse = await this.retrieve({ mapbox_id: mapboxId });

      if (retrieveResponse.features.length === 0) {
        return null;
      }

      return mapFeatureToDestination(retrieveResponse.features[0]);
    } catch (error) {
      console.error('Error retrieving destination by ID:', error);
      return null;
    }
  }

  async getPopularDestinations(): Promise<MapboxSearchResponse<MapboxDestinationResult>> {
    const destinations: MapboxDestinationResult[] = VIETNAM_POPULAR_DESTINATIONS.map((dest: PopularDestination) => ({
      id: dest.id,
      name: dest.name,
      type: dest.type,
      country: dest.country,
      category: 'popular',
      description: dest.description,
      latitude: dest.latitude,
      longitude: dest.longitude,
      relevanceScore: 1.0,
    }));

    return {
      results: destinations,
      totalCount: destinations.length,
      metadata: {
        source: 'static_popular_destinations',
      },
    };
  }

  async forwardGeocode(
    address: string,
    options?: Partial<MapboxSearchParams>
  ): Promise<MapboxSearchResponse<MapboxDestinationResult>> {
    return this.searchDestinations(address, options?.limit);
  }
}

export default MapboxSearchService;
