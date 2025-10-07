/**
 * Client-side Mapbox Service
 * Direct client-side service using NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
 */

import { MapboxSearchService } from './mapboxSearchService';
import type {
  MapboxDestinationResult,
  MapboxSearchResponse,
} from '../types';

class MapboxClientService {
  private searchService: MapboxSearchService;

  constructor() {
    this.searchService = new MapboxSearchService();
  }

  async searchDestinations(
    query?: string,
    limit: number = 10
  ): Promise<MapboxSearchResponse<MapboxDestinationResult>> {
    try {
      if (!query) {
        // Return popular destinations if no query
        return await this.getPopularDestinations();
      }

      return await this.searchService.searchDestinations(query, limit);
    } catch (error) {
      console.error('Error searching destinations:', error);
      return {
        results: [],
        totalCount: 0,
        query,
        metadata: {
          source: 'client_direct',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async getPopularDestinations(): Promise<MapboxSearchResponse<MapboxDestinationResult>> {
    try {
      return await this.searchService.getPopularDestinations();
    } catch (error) {
      console.error('Error getting popular destinations:', error);
      return {
        results: [],
        totalCount: 0,
        metadata: {
          source: 'client_direct',
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      };
    }
  }

  async getDestinationById(mapboxId: string): Promise<MapboxDestinationResult | null> {
    try {
      return await this.searchService.getDestinationById(mapboxId);
    } catch (error) {
      console.error('Error retrieving destination:', error);
      return null;
    }
  }
}

// Export singleton instance
export const mapboxService = new MapboxClientService();
export default mapboxService;

