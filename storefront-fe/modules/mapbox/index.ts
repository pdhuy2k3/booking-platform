/**
 * Mapbox Module
 * Server-side search using MAPBOX_ACCESS_TOKEN from env.mjs
 */

// Export client service (for client components)
export { mapboxService } from './services/mapboxClientService';

// Export server service (for API routes and server components)
export { MapboxSearchService } from './services/mapboxSearchService';

// Export hooks
export { useMapboxSearch } from './hooks/useMapboxSearch';
export type { UseMapboxSearchOptions, UseMapboxSearchReturn } from './hooks/useMapboxSearch';

// Export components
export { MapboxSearchModal } from './components/MapboxSearchModal';
export type { MapboxSearchModalProps } from './components/MapboxSearchModal';

// Export types
export type {
  MapboxFeature,
  MapboxSuggestion,
  MapboxSuggestResponse,
  MapboxRetrieveResponse,
  MapboxSearchConfig,
  MapboxSearchParams,
  MapboxRetrieveParams,
  MapboxDestinationResult,
  MapboxSearchResponse,
  PopularDestination,
} from './types';

export { VIETNAM_POPULAR_DESTINATIONS } from './types';

// Default export for convenience
export { mapboxService as default } from './services/mapboxClientService';
