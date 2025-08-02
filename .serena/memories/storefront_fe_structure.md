
# Storefront-FE Structure

## Directory Layout
```
storefront-fe/
├── app/                      # Next.js App Router pages and API routes
├── components/               # Reusable React components
├── hooks/                    # Custom React hooks
├── lib/                      # Libraries and utilities (e.g., API client)
├── modules/                  # Feature-based modules
├── public/                   # Static assets
├── services/                 # API service layer for interacting with the BFF
├── styles/                   # Global styles
└── types/                    # TypeScript type definitions
```

## Key Files
- `app/api/`: Contains the (currently mock) API routes. This will be replaced with direct calls to the BFF.
- `services/`: This is where the logic for making API calls to the `storefront-bff` will reside.
- `types/`: This directory will contain the TypeScript interfaces generated from the backend DTOs.
- `lib/constants.ts`: Defines API endpoints and other constants.
- `package.json`: Lists project dependencies and scripts.
- `next.config.mjs`: Next.js configuration.
- `tsconfig.json`: TypeScript configuration.
