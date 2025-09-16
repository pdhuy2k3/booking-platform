# Types Structure

This directory contains the type definitions for the frontend application, organized in a modular way to promote reusability and maintainability.

## Directory Structure

```
types/
├── common/           # Shared types used across all modules
│   └── index.ts     # Common type definitions
├── index.ts         # Main export file
└── README.md        # This documentation
```

## Common Types

The `common/` directory contains types that are shared across multiple modules:

### Core Types
- `ID` - Generic identifier type (string)
- `Status` - Common status enumeration
- `Currency` - Supported currency types
- `DateRange` - Date range with start and end dates
- `Location` - Geographic location with coordinates
- `MediaItem` - Media file information

### API Response Types
- `SearchResponse<T>` - Standardized search response format
- `DestinationSearchResult` - Destination search result structure
- `ErrorResponse` - Standardized error response format
- `PaginatedResponse<T>` - Paginated data response format

### Validation Types
- `ValidationError` - Individual validation error
- `ValidationResult` - Complete validation result

### Search & Pagination Types
- `SearchParams` - Generic search parameters
- `PaginationParams` - Pagination configuration

## Usage

### Importing Common Types

```typescript
// Import specific types
import type { ID, SearchResponse, DestinationSearchResult } from '@/types/common'

// Import all common types
import type * as CommonTypes from '@/types/common'

// Import from main types index
import type { ID, SearchResponse } from '@/types'
```

### Module-Specific Types

Each module (flight, hotel, etc.) has its own types directory that:
1. Imports common types from `@/types/common`
2. Re-exports them for external use
3. Defines module-specific types

Example:
```typescript
// modules/flight/type/index.ts
import type { ID, SearchResponse } from '../../../types/common'

// Re-export common types
export type { ID, SearchResponse }

// Define flight-specific types
export type Flight = {
  id: ID
  airline: string
  // ... other flight-specific fields
}
```

## Benefits

1. **DRY Principle**: No duplication of common types
2. **Consistency**: Standardized response formats across all APIs
3. **Maintainability**: Single source of truth for common types
4. **Type Safety**: Full TypeScript support with proper imports
5. **Scalability**: Easy to add new common types as the app grows

## Adding New Common Types

1. Add the type definition to `types/common/index.ts`
2. Export it from the main `types/index.ts` file
3. Import and re-export in module-specific type files as needed

## Migration Notes

- All existing modules have been updated to use the common types
- The old duplicated type definitions have been removed
- Import paths have been updated to use the new structure
- No breaking changes to the public API of modules
