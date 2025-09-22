import type { DestinationSearchResult, SearchResponse } from "../../../types/common";

/**
 * Types returned by the Open-Meteo Geocoding API
 * https://open-meteo.com/en/docs/geocoding-api
 */
type OpenMeteoGeocodingResult = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  population?: number;
  timezone?: string;
  admin1?: string;
  admin2?: string;
  admin3?: string;
  admin4?: string;
  postcodes?: string[];
};

type OpenMeteoGeocodingResponse = {
  results?: OpenMeteoGeocodingResult[];
  generationtime_ms?: number;
  results_count?: number;
};

const GEOCODING_BASE_URL = "https://geocoding-api.open-meteo.com/v1";
const DEFAULT_SEARCH_LANGUAGE = "vn";

const POPULAR_DESTINATIONS: Array<{
  id?: number;
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  feature_code?: string;
}> = [
  { name: "Ho Chi Minh City", country: "Vietnam", latitude: 10.8231, longitude: 106.6297, admin1: "Ho Chi Minh", feature_code: "PPLA" },
  { name: "Hanoi", country: "Vietnam", latitude: 21.0278, longitude: 105.8342, admin1: "Ha Noi", feature_code: "PPLC" },
  { name: "Da Nang", country: "Vietnam", latitude: 16.0471, longitude: 108.2068, admin1: "Da Nang", feature_code: "PPLA" },
  { name: "Nha Trang", country: "Vietnam", latitude: 12.2388, longitude: 109.1967, admin1: "Khanh Hoa", feature_code: "PPLA" },
  { name: "Hue", country: "Vietnam", latitude: 16.4637, longitude: 107.5909, admin1: "Thua Thien-Hue", feature_code: "PPLA" },
  { name: "Da Lat", country: "Vietnam", latitude: 11.9404, longitude: 108.4583, admin1: "Lam Dong", feature_code: "PPLA" },
  { name: "Hoi An", country: "Vietnam", latitude: 15.8801, longitude: 108.3380, admin1: "Quang Nam", feature_code: "PPLA" },
  { name: "Phu Quoc", country: "Vietnam", latitude: 10.2899, longitude: 103.9840, admin1: "Kien Giang", feature_code: "PPLA" },
  { name: "Vung Tau", country: "Vietnam", latitude: 10.4114, longitude: 107.1362, admin1: "Ba Ria-Vung Tau", feature_code: "PPLA" },
  { name: "Can Tho", country: "Vietnam", latitude: 10.0452, longitude: 105.7469, admin1: "Can Tho", feature_code: "PPLA" },
];

const buildQueryString = (params: Record<string, string | number | undefined>) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

const mapOpenMeteoResultToDestination = (result: OpenMeteoGeocodingResult): DestinationSearchResult => {
  const adminPath = [result.admin1, result.admin2, result.admin3, result.admin4]
    .filter(Boolean)
    .join(", ");

  return {
    name: result.name,
    type: result.feature_code ?? "location",
    country: result.country ?? result.country_code ?? "Unknown",
    category: result.feature_code ?? "location",
    iataCode: result.id ? String(result.id) : undefined,
    description: adminPath || undefined,
    latitude: result.latitude,
    longitude: result.longitude,
    relevanceScore: undefined,
  };
};

export const destinationService = {
  async fetchGeocoding(params: Record<string, string | number | undefined>): Promise<OpenMeteoGeocodingResponse> {
    const query = buildQueryString({ language: DEFAULT_SEARCH_LANGUAGE, format: "json", ...params });
    const response = await fetch(`${GEOCODING_BASE_URL}/search?${query}`, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Open-Meteo geocoding request failed: ${response.status} ${response.statusText}`);
    }

    return (await response.json()) as OpenMeteoGeocodingResponse;
  },

  async searchDestinations(keyword?: string, limit: number = 20): Promise<SearchResponse<DestinationSearchResult>> {
    const sanitizedKeyword = keyword?.trim();

    if (!sanitizedKeyword) {
      return this.getPopularDestinations();
    }

    try {
      const geocodingResponse = await this.fetchGeocoding({ name: sanitizedKeyword, count: limit });
      const results = geocodingResponse.results ?? [];

      const destinations = results.map((result) => ({
        ...mapOpenMeteoResultToDestination(result),
        relevanceScore: this.calculateRelevanceScore(result.name, sanitizedKeyword),
      }));

      return {
        results: destinations,
        totalCount: results.length,
        query: sanitizedKeyword,
        limit,
        page: 1,
        hasMore: results.length >= limit,
        metadata: {
          source: "open_meteo_geocoding_api",
          generationtimeMs: geocodingResponse.generationtime_ms,
          resultsCount: geocodingResponse.results_count ?? results.length,
        },
      };
    } catch (error) {
      console.error("Error searching destinations via Open-Meteo:", error);
      return {
        results: [],
        totalCount: 0,
        query: sanitizedKeyword ?? "",
        metadata: {
          source: "open_meteo_geocoding_api",
          error: error instanceof Error ? error.message : "Unknown error",
        },
      };
    }
  },

  async getPopularDestinations(): Promise<SearchResponse<DestinationSearchResult>> {
    const destinations: DestinationSearchResult[] = POPULAR_DESTINATIONS.map((destination) => ({
      name: destination.name,
      type: destination.feature_code ?? "popular",
      country: destination.country,
      category: destination.feature_code ?? "popular",
      iataCode: destination.id ? String(destination.id) : undefined,
      latitude: destination.latitude,
      longitude: destination.longitude,
      description: destination.admin1,
      relevanceScore: 1.0,
    }));

    return {
      results: destinations,
      totalCount: destinations.length,
      query: "",
      metadata: { source: "popular_destinations" },
    };
  },

  calculateRelevanceScore(name: string, keyword: string): number {
    if (!keyword) {
      return 1.0;
    }

    const nameLower = name.toLowerCase();
    const keywordLower = keyword.toLowerCase();

    if (nameLower === keywordLower) {
      return 1.0;
    }

    if (nameLower.startsWith(keywordLower)) {
      return 0.9;
    }

    if (nameLower.includes(keywordLower)) {
      return 0.7;
    }

    const nameWords = nameLower.split(" ");
    const keywordWords = keywordLower.split(" ");

    for (const kw of keywordWords) {
      for (const nw of nameWords) {
        if (nw.startsWith(kw) || kw.startsWith(nw)) {
          return 0.5;
        }
      }
    }

    return 0.1;
  },

  async getDestinationByCode(code: string): Promise<DestinationSearchResult | null> {
    if (!code) {
      return null;
    }

    try {
      const geocodingResponse = await this.fetchGeocoding({ ids: code, count: 1 });
      const result = geocodingResponse.results?.[0];
      return result ? mapOpenMeteoResultToDestination(result) : null;
    } catch (error) {
      console.error("Error fetching destination by id from Open-Meteo:", error);
      return null;
    }
  },
};

export default destinationService;
