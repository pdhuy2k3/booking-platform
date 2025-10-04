/**
 * Client-side Mapbox Service
 * Wrapper that calls the server-side API route
 */

import type {
  MapboxDestinationResult,
  MapboxSearchResponse,
} from '../types';

class MapboxClientService {
  private baseUrl = '/api/mapbox/search';

  async searchDestinations(
    query?: string,
    limit: number = 10
  ): Promise<MapboxSearchResponse<MapboxDestinationResult>> {
    try {
      const params = new URLSearchParams({
        action: 'search',
        limit: limit.toString(),
      });

      if (query) {
        params.append('q', query);
      }

      const response = await fetch(`${this.baseUrl}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Search request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching destinations:', error);
      return {
        results: [],
        totalCount: 0,
        query,
        metadata: {
          source: 'client_api',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async getPopularDestinations(): Promise<MapboxSearchResponse<MapboxDestinationResult>> {
    try {
      const params = new URLSearchParams({
        action: 'popular',
      });

      const response = await fetch(`${this.baseUrl}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Popular request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting popular destinations:', error);
      return {
        results: [],
        totalCount: 0,
        metadata: {
          source: 'client_api',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async getDestinationById(mapboxId: string): Promise<MapboxDestinationResult | null> {
    try {
      const params = new URLSearchParams({
        action: 'retrieve',
        mapbox_id: mapboxId,
      });

      const response = await fetch(`${this.baseUrl}?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Retrieve request failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error retrieving destination:', error);
      return null;
    }
  }
}

// Export singleton instance
export const mapboxService = new MapboxClientService();
export default mapboxService;

