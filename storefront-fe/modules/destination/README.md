# Destination Module

This module provides comprehensive destination search functionality using the Vietnamese Administrative Units API from [tinhthanhpho.com](https://tinhthanhpho.com/api-docs).

## Features

- **Vietnamese Administrative Units Integration**: Uses the official Vietnamese administrative units API for accurate city/province data
- **Real-time Search**: Debounced search with configurable delay
- **Popular Destinations**: Pre-defined list of popular Vietnamese destinations
- **Fallback Support**: Falls back to backend API if the external service fails
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Relevance Scoring**: Intelligent relevance scoring for search results

## API Integration

### Base URL
```
https://tinhthanhpho.com/api/v1
```

### Endpoints Used
- `GET /search-address` - Search addresses/provinces/cities (simplified single endpoint)

### Rate Limits
- **Public API**: 100 requests/minute
- **Authenticated API**: Based on API key settings

## Usage

### Basic Service Usage

```typescript
import { destinationService } from '@/modules/destination';

// Search destinations using the simplified search-address endpoint
const searchResults = await destinationService.searchDestinations('hanoi', 10);

// Get popular destinations
const popularDestinations = await destinationService.getPopularDestinations();

// Get destination by code
const destination = await destinationService.getDestinationByCode('01');

// Direct search using the search-address endpoint
const addressResults = await destinationService.searchAddress('ho chi minh', 20, 1);
```

### Using the Hook

```typescript
import { useDestinationSearch } from '@/modules/destination';

function MyComponent() {
  const {
    destinations,
    loading,
    error,
    searchDestinations,
    clearSearch,
    getPopularDestinations
  } = useDestinationSearch({
    debounceMs: 300,
    minQueryLength: 1,
    limit: 20
  });

  return (
    <div>
      <input 
        onChange={(e) => searchDestinations(e.target.value)}
        placeholder="Search destinations..."
      />
      {loading && <div>Loading...</div>}
      {destinations.map(dest => (
        <div key={dest.id}>{dest.name}</div>
      ))}
    </div>
  );
}
```

### Using the Modal Component

```typescript
import { DestinationSearchModal } from '@/modules/destination';

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);

  const handleDestinationSelect = (destination) => {
    setSelectedDestination(destination);
    setIsModalOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        Select Destination
      </button>
      
      <DestinationSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={handleDestinationSelect}
        title="Choose Destination"
        placeholder="Search city or hotel..."
      />
    </>
  );
}
```

## Data Structure

### DestinationSearchResult
```typescript
interface DestinationSearchResult {
  id: string;           // Administrative code
  name: string;         // City/province name
  type: string;         // Type (Thành phố, Tỉnh, etc.)
  country: string;      // Always "Vietnam"
  code: string;         // Administrative code
  relevanceScore: number; // 0-1 relevance score
}
```

### API Response Format
```typescript
interface AdministrativeApiResponse<T> {
  success: boolean;
  data: T[];
  metadata: {
    total: number;
    page: number;
    limit: number;
  };
}
```

## Popular Destinations

The module includes a pre-defined list of popular Vietnamese destinations:

- Hà Nội (01)
- Thành phố Hồ Chí Minh (79)
- Đà Nẵng (48)
- Hải Phòng (31)
- Cần Thơ (92)
- Nha Trang (56)
- Huế (46)
- Hội An (48)
- Phú Quốc (91)
- Đà Lạt (68)
- Vũng Tàu (77)
- Quy Nhon (56)

## Error Handling

The module includes comprehensive error handling:

- **Network Errors**: Automatic fallback to backend API
- **API Errors**: Graceful error messages
- **Rate Limiting**: Respects API rate limits
- **Invalid Responses**: Validates API response format

## Configuration

### Service Configuration
```typescript
const destinationService = {
  // Base API URL
  ADMINISTRATIVE_API_BASE: 'https://tinhthanhpho.com/api/v1',
  
  // Popular destinations list
  POPULAR_DESTINATIONS: [...],
  
  // Default search parameters
  defaultLimit: 20,
  defaultDebounceMs: 300
};
```

### Hook Configuration
```typescript
const options = {
  debounceMs: 300,        // Search debounce delay
  minQueryLength: 1,      // Minimum query length to trigger search
  limit: 20              // Maximum results to return
};
```

## Integration with Hotel Search

The destination module is integrated with the hotel search functionality:

1. **Hotel Service**: Uses destination service for better search accuracy
2. **Fallback Support**: Falls back to backend API if external service fails
3. **Consistent Interface**: Maintains compatibility with existing hotel search

## Future Enhancements

- [ ] Caching for better performance
- [ ] Offline support with local storage
- [ ] Advanced filtering options
- [ ] Map integration
- [ ] Multi-language support
- [ ] Analytics integration

## Dependencies

- React 18+
- TypeScript 4.5+
- Lucide React (for icons)

## License

This module is part of the BookingSmart project and follows the same license terms.
