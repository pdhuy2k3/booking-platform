/**
 * Client-side Mapbox Service
 * Direct client-side service using NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
 */

import { MapboxSearchService } from './mapboxSearchService';
import type {
  MapboxDestinationResult,
  MapboxSearchResponse,
} from '../types';

type CoordinatePair = [number, number];

const isFiniteNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const computeControlPoint = (origin: CoordinatePair, destination: CoordinatePair): CoordinatePair => {
  const [originLng, originLat] = origin;
  const [destinationLng, destinationLat] = destination;
  const midLng = (originLng + destinationLng) / 2;
  const midLat = (originLat + destinationLat) / 2;
  const deltaLng = destinationLng - originLng;
  const deltaLat = destinationLat - originLat;
  const distance = Math.sqrt(deltaLng * deltaLng + deltaLat * deltaLat) || 1;
  const offsetMagnitude = distance * 0.35;
  const offsetLng = (-deltaLat / distance) * offsetMagnitude;
  const offsetLat = (deltaLng / distance) * offsetMagnitude;
  return [midLng + offsetLng, midLat + offsetLat];
};

const generateArc = (origin: CoordinatePair, destination: CoordinatePair, steps = 420): CoordinatePair[] => {
  if (!isFiniteNumber(origin[0]) || !isFiniteNumber(origin[1]) || !isFiniteNumber(destination[0]) || !isFiniteNumber(destination[1])) {
    return [];
  }

  const controlPoint = computeControlPoint(origin, destination);
  const coordinates: CoordinatePair[] = [];

  for (let index = 0; index <= steps; index += 1) {
    const t = index / steps;
    const oneMinusT = 1 - t;
    const lng = oneMinusT * oneMinusT * origin[0] + 2 * oneMinusT * t * controlPoint[0] + t * t * destination[0];
    const lat = oneMinusT * oneMinusT * origin[1] + 2 * oneMinusT * t * controlPoint[1] + t * t * destination[1];
    coordinates.push([lng, lat]);
  }

  return coordinates;
};

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

  generateFlightPath(
    origin: { latitude: number; longitude: number },
    destination: { latitude: number; longitude: number },
    steps = 420
  ): CoordinatePair[] {
    const originPair: CoordinatePair = [origin.longitude, origin.latitude];
    const destinationPair: CoordinatePair = [destination.longitude, destination.latitude];
    return generateArc(originPair, destinationPair, steps);
  }
}

// Export singleton instance
export const mapboxService = new MapboxClientService();
export default mapboxService;

