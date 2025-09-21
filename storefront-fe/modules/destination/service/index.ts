import type { DestinationSearchResult, SearchResponse } from "../../../types/common";

// Vietnamese Administrative Units API types
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

// API Configuration
const ADMINISTRATIVE_API_BASE = 'https://tinhthanhpho.com/api/v1';

// Popular Vietnamese destinations for hotel search
const POPULAR_DESTINATIONS = [
  { name: 'Hà Nội', code: '01', type: 'Thành phố' },
  { name: 'Thành phố Hồ Chí Minh', code: '79', type: 'Thành phố' },
  { name: 'Đà Nẵng', code: '48', type: 'Thành phố' },
  { name: 'Hải Phòng', code: '31', type: 'Thành phố' },
  { name: 'Cần Thơ', code: '92', type: 'Thành phố' },
  { name: 'Nha Trang', code: '56', type: 'Thành phố' },
  { name: 'Huế', code: '46', type: 'Thành phố' },
  { name: 'Hội An', code: '48', type: 'Thành phố' },
  { name: 'Phú Quốc', code: '91', type: 'Huyện' },
  { name: 'Đà Lạt', code: '68', type: 'Thành phố' },
  { name: 'Vũng Tàu', code: '77', type: 'Thành phố' },
  { name: 'Quy Nhon', code: '56', type: 'Thành phố' }
];

export const destinationService = {
  /**
   * Search addresses using Vietnamese Administrative Units API
   * @param keyword Search keyword (e.g., "hanoi", "ho chi minh")
   * @param limit Number of results to return
   * @param page Page number
   * @returns Promise<AdministrativeApiResponse<Province>>
   */
  async searchAddress(keyword: string, limit: number = 20, page: number = 1): Promise<AdministrativeApiResponse<Province>> {
    const params = new URLSearchParams();
    params.append('keyword', keyword);
    params.append('limit', limit.toString());
    params.append('page', page.toString());

    const response = await fetch(`${ADMINISTRATIVE_API_BASE}/search-address?${params}`, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response:', data); // Debug log
    return data;
  },

  /**
   * Search destinations for hotel search (converts API response to DestinationSearchResult format)
   * @param keyword Search keyword
   * @param limit Number of results to return
   * @returns Promise<SearchResponse<DestinationSearchResult>>
   */
  async searchDestinations(keyword?: string, limit: number = 20): Promise<SearchResponse<DestinationSearchResult>> {
    try {
      // If no keyword provided, return popular destinations
      if (!keyword || keyword.trim() === '') {
        return this.getPopularDestinations();
      }

      // Use the simplified search-address endpoint
      const response = await this.searchAddress(keyword, limit);
      
      console.log('Search response:', response); // Debug log
      
      if (response.success && response.data && response.data.length > 0) {
        const destinations: DestinationSearchResult[] = response.data.map(province => ({
          name: province.name,
          type: province.type,
          country: 'Vietnam',
          category: province.type,
          iataCode: province.code,
          relevanceScore: this.calculateRelevanceScore(province.name, keyword)
        }));

        return {
          results: destinations,
          totalCount: response.metadata?.total || destinations.length,
          query: keyword,
          page: response.metadata?.page || 1,
          limit: response.metadata?.limit || limit,
          hasMore: response.metadata ? (response.metadata.page * response.metadata.limit < response.metadata.total) : false,
          metadata: { 
            source: 'vietnamese_administrative_api_search_address',
            total: response.metadata?.total || destinations.length,
            page: response.metadata?.page || 1,
            limit: response.metadata?.limit || limit
          }
        };
      }

      // Return empty result if no matches found
      return {
        results: [],
        totalCount: 0,
        query: keyword,
        metadata: { 
          source: 'vietnamese_administrative_api_search_address', 
          message: 'No destinations found',
          total: 0,
          page: 1,
          limit: limit
        }
      };

    } catch (error) {
      console.error('Error searching destinations:', error);
      return {
        results: [],
        totalCount: 0,
        query: keyword || '',
        metadata: { 
          source: 'vietnamese_administrative_api_search_address', 
          error: 'Error searching destinations' 
        }
      };
    }
  },

  /**
   * Get popular destinations for hotel search
   * @returns Promise<SearchResponse<DestinationSearchResult>>
   */
  async getPopularDestinations(): Promise<SearchResponse<DestinationSearchResult>> {
    try {
      const destinations: DestinationSearchResult[] = POPULAR_DESTINATIONS.map(dest => ({
        name: dest.name,
        type: dest.type,
        country: 'Vietnam',
        category: dest.type,
        iataCode: dest.code,
        relevanceScore: 1.0
      }));

      return {
        results: destinations,
        totalCount: destinations.length,
        query: '',
        metadata: { source: 'popular_destinations' }
      };
    } catch (error) {
      console.error('Error loading popular destinations:', error);
      return {
        results: [],
        totalCount: 0,
        query: '',
        metadata: { source: 'popular_destinations', error: 'Error loading popular destinations' }
      };
    }
  },

  /**
   * Calculate relevance score for search results
   * @param name Destination name
   * @param keyword Search keyword
   * @returns number Relevance score (0-1)
   */
  calculateRelevanceScore(name: string, keyword: string): number {
    if (!keyword) return 1.0;

    const nameLower = name.toLowerCase();
    const keywordLower = keyword.toLowerCase();

    // Exact match gets highest score
    if (nameLower === keywordLower) return 1.0;
    
    // Starts with keyword gets high score
    if (nameLower.startsWith(keywordLower)) return 0.9;
    
    // Contains keyword gets medium score
    if (nameLower.includes(keywordLower)) return 0.7;
    
    // Partial match gets lower score
    const nameWords = nameLower.split(' ');
    const keywordWords = keywordLower.split(' ');
    
    for (const kw of keywordWords) {
      for (const nw of nameWords) {
        if (nw.startsWith(kw) || kw.startsWith(nw)) {
          return 0.5;
        }
      }
    }

    return 0.1;
  },

  /**
   * Get destination by code
   * @param code Destination code
   * @returns Promise<DestinationSearchResult | null>
   */
  async getDestinationByCode(code: string): Promise<DestinationSearchResult | null> {
    try {
      const response = await this.searchAddress(code, 1);
      
      if (response.success && response.data.length > 0) {
        const province = response.data[0];
        return {
          name: province.name,
          type: province.type,
          country: 'Vietnam',
          category: province.type,
          iataCode: province.code,
          relevanceScore: 1.0
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting destination by code:', error);
      return null;
    }
  }
};

export default destinationService;
