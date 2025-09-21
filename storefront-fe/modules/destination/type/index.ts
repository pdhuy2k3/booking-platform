// Re-export common types
export type { 
  DestinationSearchResult, 
  SearchResponse, 
  ErrorResponse 
} from '../../../types/common';

// Vietnamese Administrative Units specific types
export interface Province {
  code: string;
  name: string;
  type: string;
}

export interface District {
  code: string;
  name: string;
  type: string;
  province_code: string;
}

export interface Ward {
  code: string;
  name: string;
  type: string;
  district_code: string;
  province_code: string;
}

export interface AdministrativeApiResponse<T> {
  success: boolean;
  data: T[];
  metadata: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface FullAddressResponse {
  success: boolean;
  data: {
    province: Province;
    district: District;
    ward: Ward;
  };
}

export interface DestinationSearchParams {
  keyword?: string;
  limit?: number;
  page?: number;
}

export interface PopularDestination {
  name: string;
  code: string;
  type: string;
  country: string;
}
