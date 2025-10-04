/**
 * API Route: /api/mapbox/search
 * Server-side endpoint for Mapbox search using MAPBOX_ACCESS_TOKEN
 */

import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env.mjs';
import { MapboxSearchService } from '@/modules/mapbox/services/mapboxSearchService';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');
    const action = searchParams.get('action') || 'search';

    // Initialize service with server-side token
    const service = new MapboxSearchService(env.MAPBOX_ACCESS_TOKEN);

    switch (action) {
      case 'search':
        if (!query) {
          // Return popular destinations if no query
          const popular = await service.getPopularDestinations();
          return NextResponse.json(popular);
        }
        const results = await service.searchDestinations(query, limit);
        return NextResponse.json(results);

      case 'popular':
        const popular = await service.getPopularDestinations();
        return NextResponse.json(popular);

      case 'retrieve':
        const mapboxId = searchParams.get('mapbox_id');
        if (!mapboxId) {
          return NextResponse.json(
            { error: 'mapbox_id is required for retrieve action' },
            { status: 400 }
          );
        }
        const destination = await service.getDestinationById(mapboxId);
        return NextResponse.json(destination);

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: search, popular, or retrieve' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Mapbox API route error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        results: [],
        totalCount: 0
      },
      { status: 500 }
    );
  }
}

