# Mapbox Module - Client-Side Implementation

This module provides client-side Mapbox search functionality using the public Mapbox API.

## Setup

### Environment Variables

Make sure you have the following environment variable set in your `.env.local` file:

```bash
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_public_token_here
```

**Important:** Use a **public token** (starts with `pk.`) for client-side usage, not a secret token.

### Configuration

The environment variable is configured in `env.mjs`:

```javascript
client: {
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: z.string().min(1),
  // ...
},
runtimeEnv: {
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  // ...
},
```

## Usage

### Using the Service Directly

```typescript
import { mapboxService } from '@/modules/mapbox';

// Search destinations
const results = await mapboxService.searchDestinations('Ha Noi', 10);

// Get popular destinations
const popular = await mapboxService.getPopularDestinations();

// Get destination by Mapbox ID
const destination = await mapboxService.getDestinationById('mapbox_id');
```

### Using the Hook

```typescript
import { useMapboxSearch } from '@/modules/mapbox';

const {
  destinations,
  loading,
  error,
  searchDestinations,
  getPopularDestinations,
} = useMapboxSearch({
  debounceMs: 300,
  limit: 10,
});

// Search destinations
await searchDestinations('Da Nang');
```

### Using the Modal Component

```typescript
import { MapboxSearchModal } from '@/modules/mapbox';

<MapboxSearchModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  onSelect={(destination) => {
    console.log('Selected:', destination);
    setIsOpen(false);
  }}
  title="Select Destination"
  placeholder="Search for cities, airports..."
/>
```

## Architecture Changes

### Before (Server-Side)
- API Route: `/api/mapbox/search`
- Used server-side `MAPBOX_ACCESS_TOKEN`
- Client called internal API route

### After (Client-Side)
- Direct client-side Mapbox API calls
- Uses public `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- No internal API route needed
- Better performance (fewer hops)

## Security

- Uses public Mapbox token (safe for client-side exposure)
- Token is restricted by domain in Mapbox dashboard
- No server-side secrets exposed to client

## Performance Benefits

1. **Reduced Latency**: Direct API calls instead of proxying through your server
2. **Reduced Server Load**: No server processing needed for search requests
3. **Better Caching**: Browser can cache Mapbox responses directly
4. **Simpler Architecture**: Fewer moving parts and potential failure points