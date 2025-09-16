// Export services
export { destinationService } from './service';
export { default as destinationServiceDefault } from './service';

// Export hooks
export { useDestinationSearch } from './hooks/useDestinationSearch';
export { default as useDestinationSearchDefault } from './hooks/useDestinationSearch';

// Export components
export { default as DestinationSearchModal } from './component/DestinationSearchModal';

// Export types
export type {
  Province,
  District,
  Ward,
  AdministrativeApiResponse,
  FullAddressResponse,
  DestinationSearchParams,
  PopularDestination,
  DestinationSearchResult,
  SearchResponse,
  ErrorResponse
} from './type';

// Export service types
export type {
  Province as ServiceProvince,
  District as ServiceDistrict,
  Ward as ServiceWard,
  AdministrativeApiResponse as ServiceAdministrativeApiResponse,
  FullAddressResponse as ServiceFullAddressResponse
} from './service';
