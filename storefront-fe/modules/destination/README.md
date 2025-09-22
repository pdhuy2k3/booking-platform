# Destination Module

This module provides destination search functionality backed by the [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api). It powers the storefront hotel and flight experiences with real-time city lookups and curated popular destinations.

## Features

- **Global Geocoding Coverage**: Uses Open-Meteo's worldwide geocoding data set for accurate city and location search
- **Real-time Search**: Debounced search with configurable delay
- **Popular Destinations**: Pre-defined list of popular Vietnamese destinations for quick access
- **Fallback Support**: Falls back to backend API if the external service fails
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Relevance Scoring**: Intelligent relevance scoring for search results

## API Integration

### Base URL
```
https://geocoding-api.open-meteo.com/v1
```

### Endpoints Used
- `GET /search` - Search for locations by name or by numeric identifier (`ids`)

## Usage

### Basic Service Usage

```typescript
import { destinationService } from '@/modules/destination';

// Search destinations using Open-Meteo geocoding
const searchResults = await destinationService.searchDestinations('hanoi', 10);

// Get popular destinations
const popularDestinations = await destinationService.getPopularDestinations();

// Get destination by code
const destination = await destinationService.getDestinationByCode('2950159');
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
        <div key={dest.iataCode ?? dest.name}>{dest.name}</div>
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
The module returns the shared `DestinationSearchResult` type defined in `types/common`:

```typescript
export type DestinationSearchResult = {
  name: string;
  type: string;
  country: string;
  category: string;
  iataCode?: string;
  relevanceScore?: number;
  description?: string;
  latitude?: number;
  longitude?: number;
}
```

## Popular Destinations

The module includes a pre-defined list of popular Vietnamese destinations:

- Ho Chi Minh City
- Hanoi
- Da Nang
- Nha Trang
- Hue
- Da Lat
- Hoi An
- Phu Quoc
- Vung Tau
- Can Tho

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
  geocodingBaseUrl: 'https://geocoding-api.open-meteo.com/v1',
  defaultLimit: 20,
  defaultDebounceMs: 300,
  // ...
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
