# Detailed Folder Structure Plan for storefront-fe

## Complete Directory Tree Structure

```
storefront-fe/
├── .env.local                          # Environment variables (Stripe keys, API URLs)
├── .env.example                        # Environment template
├── .gitignore                          # Git ignore patterns
├── .eslintrc.json                      # ESLint configuration
├── components.json                     # shadcn/ui configuration
├── next.config.ts                      # Next.js configuration
├── package.json                        # Dependencies and scripts
├── postcss.config.mjs                  # PostCSS configuration
├── tailwind.config.ts                  # Tailwind CSS configuration
├── tsconfig.json                       # TypeScript configuration
├── enhanced-frontend-architecture.md   # Architecture documentation
├── folder-structure-plan.md           # This document
├── README.md                          # Project documentation
│
├── public/                            # Static assets
│   ├── images/                        # Image assets
│   │   ├── airlines/                  # Airline logos
│   │   │   ├── vietnam-airlines.png
│   │   │   ├── jetstar.png
│   │   │   └── vietjet.png
│   │   ├── hotels/                    # Hotel images
│   │   │   ├── placeholder.jpg
│   │   │   └── featured/
│   │   ├── destinations/              # Destination images
│   │   │   ├── hanoi.jpg
│   │   │   ├── ho-chi-minh.jpg
│   │   │   └── da-nang.jpg
│   │   ├── icons/                     # Custom icons
│   │   │   ├── plane.svg
│   │   │   ├── hotel.svg
│   │   │   └── package.svg
│   │   ├── hero/                      # Hero section images
│   │   │   ├── travel-hero.jpg
│   │   │   └── booking-hero.jpg
│   │   └── brand/                     # Brand assets
│   │       ├── logo.svg
│   │       ├── logo-dark.svg
│   │       └── favicon.ico
│   ├── icons/                         # PWA and favicon icons
│   │   ├── icon-192x192.png
│   │   ├── icon-512x512.png
│   │   └── apple-touch-icon.png
│   ├── manifest.json                  # PWA manifest
│   └── robots.txt                     # SEO robots file
│
├── src/                               # Source code directory
│   ├── app/                           # Next.js 15 App Router
│   │   │   ├── profile/
│   │   │   │   ├── page.tsx           # User profile page
│   │   │   │   ├── edit/
│   │   │   │   │   └── page.tsx       # Edit profile page
│   │   │   │   └── loading.tsx        # Profile loading state
│   │   │   └── layout.tsx             # Auth layout wrapper
│   │   │
│   │   ├── (booking)/                 # Booking flow route group
│   │   │   ├── search/
│   │   │   │   ├── page.tsx           # Main search page
│   │   │   │   ├── results/
│   │   │   │   │   ├── page.tsx       # Search results page
│   │   │   │   │   └── loading.tsx    # Results loading state
│   │   │   │   └── loading.tsx        # Search loading state
│   │   │   │
│   │   │   ├── flights/
│   │   │   │   ├── page.tsx           # Flight listing page
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx       # Flight details page
│   │   │   │   │   └── loading.tsx    # Flight details loading
│   │   │   │   ├── select/
│   │   │   │   │   ├── page.tsx       # Flight selection page
│   │   │   │   │   └── loading.tsx    # Selection loading state
│   │   │   │   └── loading.tsx        # Flight listing loading
│   │   │   │
│   │   │   ├── hotels/
│   │   │   │   ├── page.tsx           # Hotel listing page
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx       # Hotel details page
│   │   │   │   │   ├── gallery/
│   │   │   │   │   │   └── page.tsx   # Hotel image gallery
│   │   │   │   │   └── loading.tsx    # Hotel details loading
│   │   │   │   ├── select/
│   │   │   │   │   ├── page.tsx       # Hotel selection page
│   │   │   │   │   └── loading.tsx    # Selection loading state
│   │   │   │   └── loading.tsx        # Hotel listing loading
│   │   │   │
│   │   │   ├── packages/
│   │   │   │   ├── page.tsx           # Package listing page
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx       # Package details page
│   │   │   │   │   └── loading.tsx    # Package details loading
│   │   │   │   ├── select/
│   │   │   │   │   ├── page.tsx       # Package selection page
│   │   │   │   │   └── loading.tsx    # Selection loading state
│   │   │   │   └── loading.tsx        # Package listing loading
│   │   │   │
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx           # Checkout page with Stripe
│   │   │   │   ├── confirmation/
│   │   │   │   │   ├── page.tsx       # Booking confirmation
│   │   │   │   │   └── [bookingId]/
│   │   │   │   │       └── page.tsx   # Specific booking confirmation
│   │   │   │   ├── payment-failed/
│   │   │   │   │   └── page.tsx       # Payment failure page
│   │   │   │   └── loading.tsx        # Checkout loading state
│   │   │   │
│   │   │   └── layout.tsx             # Booking flow layout
│   │   │
│   │   ├── (dashboard)/               # User dashboard route group
│   │   │   ├── bookings/
│   │   │   │   ├── page.tsx           # Booking history page
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── page.tsx       # Individual booking details
│   │   │   │   │   ├── cancel/
│   │   │   │   │   │   └── page.tsx   # Booking cancellation
│   │   │   │   │   ├── modify/
│   │   │   │   │   │   └── page.tsx   # Booking modification
│   │   │   │   │   └── loading.tsx    # Booking details loading
│   │   │   │   └── loading.tsx        # Booking history loading
│   │   │   │
│   │   │   ├── preferences/
│   │   │   │   ├── page.tsx           # User preferences
│   │   │   │   └── loading.tsx        # Preferences loading
│   │   │   │
│   │   │   ├── payment-methods/
│   │   │   │   ├── page.tsx           # Saved payment methods
│   │   │   │   ├── add/
│   │   │   │   │   └── page.tsx       # Add payment method
│   │   │   │   └── loading.tsx        # Payment methods loading
│   │   │   │
│   │   │   └── layout.tsx             # Dashboard layout with sidebar
│   │   │
│   │   ├── (marketing)/               # Marketing pages route group
│   │   │   ├── about/
│   │   │   │   └── page.tsx           # About page
│   │   │   ├── contact/
│   │   │   │   └── page.tsx           # Contact page
│   │   │   ├── help/
│   │   │   │   ├── page.tsx           # Help center
│   │   │   │   ├── faq/
│   │   │   │   │   └── page.tsx       # FAQ page
│   │   │   │   └── booking-guide/
│   │   │   │       └── page.tsx       # Booking guide
│   │   │   ├── terms/
│   │   │   │   └── page.tsx           # Terms of service
│   │   │   ├── privacy/
│   │   │   │   └── page.tsx           # Privacy policy
│   │   │   └── layout.tsx             # Marketing layout
│   │   │
│   │   ├── globals.css                # Global styles with Tailwind
│   │   ├── layout.tsx                 # Root layout component
│   │   ├── page.tsx                   # Homepage
│   │   ├── loading.tsx                # Global loading component
│   │   ├── error.tsx                  # Global error component
│   │   ├── not-found.tsx              # 404 page
│   │   └── sitemap.ts                 # Dynamic sitemap generation
│   │
│   ├── components/                    # Reusable components
│   │   ├── ui/                        # shadcn/ui components
│   │   │   ├── accordion.tsx          # Accordion component
│   │   │   ├── alert.tsx              # Alert component
│   │   │   ├── alert-dialog.tsx       # Alert dialog component
│   │   │   ├── avatar.tsx             # Avatar component
│   │   │   ├── badge.tsx              # Badge component
│   │   │   ├── breadcrumb.tsx         # Breadcrumb component
│   │   │   ├── button.tsx             # Button component
│   │   │   ├── calendar.tsx           # Calendar component
│   │   │   ├── card.tsx               # Card component
│   │   │   ├── carousel.tsx           # Carousel component
│   │   │   ├── checkbox.tsx           # Checkbox component
│   │   │   ├── collapsible.tsx        # Collapsible component
│   │   │   ├── command.tsx            # Command component
│   │   │   ├── context-menu.tsx       # Context menu component
│   │   │   ├── dialog.tsx             # Dialog component
│   │   │   ├── drawer.tsx             # Drawer component
│   │   │   ├── dropdown-menu.tsx      # Dropdown menu component
│   │   │   ├── form.tsx               # Form component
│   │   │   ├── hover-card.tsx         # Hover card component
│   │   │   ├── input.tsx              # Input component
│   │   │   ├── input-otp.tsx          # OTP input component
│   │   │   ├── label.tsx              # Label component
│   │   │   ├── menubar.tsx            # Menubar component
│   │   │   ├── navigation-menu.tsx    # Navigation menu component
│   │   │   ├── pagination.tsx         # Pagination component
│   │   │   ├── popover.tsx            # Popover component
│   │   │   ├── progress.tsx           # Progress component
│   │   │   ├── radio-group.tsx        # Radio group component
│   │   │   ├── resizable.tsx          # Resizable component
│   │   │   ├── scroll-area.tsx        # Scroll area component
│   │   │   ├── select.tsx             # Select component
│   │   │   ├── separator.tsx          # Separator component
│   │   │   ├── sheet.tsx              # Sheet component
│   │   │   ├── sidebar.tsx            # Sidebar component
│   │   │   ├── skeleton.tsx           # Skeleton component
│   │   │   ├── slider.tsx             # Slider component
│   │   │   ├── sonner.tsx             # Sonner toast component
│   │   │   ├── switch.tsx             # Switch component
│   │   │   ├── table.tsx              # Table component
│   │   │   ├── tabs.tsx               # Tabs component
│   │   │   ├── textarea.tsx           # Textarea component
│   │   │   ├── toggle.tsx             # Toggle component
│   │   │   ├── toggle-group.tsx       # Toggle group component
│   │   │   └── tooltip.tsx            # Tooltip component
│   │   │
│   │   ├── layout/                    # Layout components
│   │   │   ├── header/
│   │   │   │   ├── index.tsx          # Main header component
│   │   │   │   ├── navigation.tsx     # Desktop navigation
│   │   │   │   ├── mobile-nav.tsx     # Mobile navigation
│   │   │   │   ├── user-menu.tsx      # User dropdown menu
│   │   │   │   └── search-bar.tsx     # Header search bar
│   │   │   ├── footer/
│   │   │   │   ├── index.tsx          # Main footer component
│   │   │   │   ├── links.tsx          # Footer links
│   │   │   │   ├── newsletter.tsx     # Newsletter signup
│   │   │   │   └── social.tsx         # Social media links
│   │   │   ├── sidebar/
│   │   │   │   ├── index.tsx          # Main sidebar component
│   │   │   │   ├── dashboard-nav.tsx  # Dashboard navigation
│   │   │   │   ├── filter-panel.tsx   # Search filter sidebar
│   │   │   │   └── mobile-sidebar.tsx # Mobile sidebar
│   │   │   └── breadcrumb/
│   │   │       ├── index.tsx          # Breadcrumb component
│   │   │       └── booking-progress.tsx # Booking step indicator
│   │   │
│   │   ├── forms/                     # Form components
│   │   │   ├── search/
│   │   │   │   ├── flight-search-form.tsx      # Flight search form
│   │   │   │   ├── hotel-search-form.tsx       # Hotel search form
│   │   │   │   ├── package-search-form.tsx     # Package search form
│   │   │   │   ├── advanced-filters.tsx        # Advanced filter form
│   │   │   │   └── search-suggestions.tsx      # Search autocomplete
│   │   │   ├── booking/
│   │   │   │   ├── passenger-details-form.tsx  # Passenger information
│   │   │   │   ├── contact-details-form.tsx    # Contact information
│   │   │   │   ├── special-requests-form.tsx   # Special requests
│   │   │   │   └── booking-summary.tsx         # Booking summary
│   │   │   ├── payment/
│   │   │   │   ├── stripe-payment-form.tsx     # Stripe payment integration
│   │   │   │   ├── payment-element.tsx         # Stripe payment element
│   │   │   │   ├── billing-address-form.tsx    # Billing address
│   │   │   │   └── payment-methods.tsx         # Saved payment methods
│   │   │   ├── profile/
│   │   │   │   ├── profile-form.tsx            # Profile edit form
│   │   │   │   ├── password-form.tsx           # Password change form
│   │   │   │   ├── preferences-form.tsx        # User preferences
│   │   │   │   └── notification-settings.tsx  # Notification preferences
│   │   │   └── auth/
│   │   │       ├── login-form.tsx              # Login form
│   │   │       ├── register-form.tsx           # Registration form
│   │   │       ├── forgot-password-form.tsx    # Password reset form
│   │   │       └── otp-verification-form.tsx   # OTP verification
│   │   │
│   │   ├── booking/                   # Booking-specific components
│   │   │   ├── cards/
│   │   │   │   ├── flight-card.tsx             # Flight result card
│   │   │   │   ├── hotel-card.tsx              # Hotel result card
│   │   │   │   ├── package-card.tsx            # Package result card
│   │   │   │   ├── booking-card.tsx            # Booking history card
│   │   │   │   └── featured-card.tsx           # Featured deals card
│   │   │   ├── details/
│   │   │   │   ├── flight-details.tsx          # Flight details view
│   │   │   │   ├── hotel-details.tsx           # Hotel details view
│   │   │   │   ├── package-details.tsx         # Package details view
│   │   │   │   ├── booking-details.tsx         # Booking details view
│   │   │   │   └── itinerary.tsx               # Trip itinerary
│   │   │   ├── selection/
│   │   │   │   ├── flight-selector.tsx         # Flight selection interface
│   │   │   │   ├── hotel-selector.tsx          # Hotel selection interface
│   │   │   │   ├── room-selector.tsx           # Hotel room selection
│   │   │   │   ├── seat-selector.tsx           # Flight seat selection
│   │   │   │   └── addon-selector.tsx          # Additional services
│   │   │   ├── status/
│   │   │   │   ├── booking-status.tsx          # Booking status indicator
│   │   │   │   ├── payment-status.tsx          # Payment status
│   │   │   │   ├── confirmation-status.tsx     # Confirmation status
│   │   │   │   └── cancellation-status.tsx     # Cancellation status
│   │   │   └── summary/
│   │   │       ├── booking-summary.tsx         # Booking summary component
│   │   │       ├── price-breakdown.tsx         # Price breakdown
│   │   │       ├── trip-summary.tsx            # Trip summary
│   │   │       └── passenger-summary.tsx       # Passenger summary
│   │   │
│   │   ├── search/                    # Search & filtering components
│   │   │   ├── filters/
│   │   │   │   ├── price-filter.tsx            # Price range filter
│   │   │   │   ├── airline-filter.tsx          # Airline filter
│   │   │   │   ├── hotel-amenity-filter.tsx    # Hotel amenity filter
│   │   │   │   ├── duration-filter.tsx         # Flight duration filter
│   │   │   │   ├── rating-filter.tsx           # Hotel rating filter
│   │   │   │   └── location-filter.tsx         # Location filter
│   │   │   ├── results/
│   │   │   │   ├── search-results.tsx          # Search results container
│   │   │   │   ├── results-grid.tsx            # Results grid layout
│   │   │   │   ├── results-list.tsx            # Results list layout
│   │   │   │   ├── no-results.tsx              # No results found
│   │   │   │   └── results-loading.tsx         # Results loading state
│   │   │   ├── sorting/
│   │   │   │   ├── sort-options.tsx            # Sort dropdown
│   │   │   │   ├── sort-buttons.tsx            # Sort button group
│   │   │   │   └── view-toggle.tsx             # Grid/List view toggle
│   │   │   └── pagination/
│   │   │       ├── pagination.tsx              # Results pagination
│   │   │       ├── load-more.tsx               # Load more button
│   │   │       └── results-per-page.tsx        # Results per page selector
│   │   │
│   │   ├── common/                    # Common/shared components
│   │   │   ├── loading/
│   │   │   │   ├── loading-spinner.tsx         # Loading spinner
│   │   │   │   ├── skeleton-loader.tsx         # Skeleton loading
│   │   │   │   ├── page-loading.tsx            # Full page loading
│   │   │   │   └── button-loading.tsx          # Button loading state
│   │   │   ├── error/
│   │   │   │   ├── error-boundary.tsx          # Error boundary component
│   │   │   │   ├── error-fallback.tsx          # Error fallback UI
│   │   │   │   ├── api-error.tsx               # API error display
│   │   │   │   └── not-found.tsx               # Not found component
│   │   │   ├── modals/
│   │   │   │   ├── confirmation-modal.tsx      # Confirmation dialog
│   │   │   │   ├── booking-modal.tsx           # Booking details modal
│   │   │   │   ├── image-gallery-modal.tsx     # Image gallery modal
│   │   │   │   └── filter-modal.tsx            # Mobile filter modal
│   │   │   ├── feedback/
│   │   │   │   ├── toast-notifications.tsx     # Toast notifications
│   │   │   │   ├── success-message.tsx         # Success message
│   │   │   │   ├── error-message.tsx           # Error message
│   │   │   │   └── info-banner.tsx             # Information banner
│   │   │   └── navigation/
│   │   │       ├── back-button.tsx             # Back navigation button
│   │   │       ├── step-indicator.tsx          # Multi-step indicator
│   │   │       ├── progress-bar.tsx            # Progress bar
│   │   │       └── tab-navigation.tsx          # Tab navigation
│   │   │
│   │   └── blocks/                    # shadcn/ui blocks (complex components)
│   │       ├── calendar/
│   │       │   ├── booking-calendar.tsx        # Advanced booking calendar
│   │       │   ├── date-range-picker.tsx       # Date range selection
│   │       │   └── availability-calendar.tsx   # Availability display
│   │       ├── dashboard/
│   │       │   ├── dashboard-layout.tsx        # Dashboard layout block
│   │       │   ├── stats-cards.tsx             # Statistics cards
│   │       │   └── recent-bookings.tsx         # Recent bookings widget
│   │       ├── sidebar/
│   │       │   ├── navigation-sidebar.tsx      # Navigation sidebar block
│   │       │   └── filter-sidebar.tsx          # Filter sidebar block
│   │       └── login/
│   │           ├── login-block.tsx             # Complete login interface
│   │           └── auth-layout.tsx             # Authentication layout
│   │
│   ├── hooks/                         # Custom React hooks
│   │   ├── api/
│   │   │   ├── use-flights.ts                  # Flight API hooks
│   │   │   ├── use-hotels.ts                   # Hotel API hooks
│   │   │   ├── use-bookings.ts                 # Booking API hooks
│   │   │   ├── use-payments.ts                 # Payment API hooks
│   │   │   └── use-auth.ts                     # Authentication hooks
│   │   ├── booking/
│   │   │   ├── use-booking-flow.ts             # Booking flow management
│   │   │   ├── use-search.ts                   # Search functionality
│   │   │   ├── use-filters.ts                  # Filter management
│   │   │   └── use-selection.ts                # Selection management
│   │   ├── payment/
│   │   │   ├── use-stripe.ts                   # Stripe integration
│   │   │   ├── use-payment.ts                  # Payment processing
│   │   │   └── use-payment-methods.ts          # Payment methods
│   │   ├── ui/
│   │   │   ├── use-mobile.ts                   # Mobile detection
│   │   │   ├── use-theme.ts                    # Theme management
│   │   │   ├── use-toast.ts                    # Toast notifications
│   │   │   └── use-modal.ts                    # Modal management
│   │   └── utils/
│   │       ├── use-local-storage.ts            # Local storage hook
│   │       ├── use-debounce.ts                 # Debounce hook
│   │       ├── use-intersection-observer.ts    # Intersection observer
│   │       └── use-media-query.ts              # Media query hook
│   │
│   ├── lib/                           # Utilities and configurations
│   │   ├── api/
│   │   │   ├── client.ts                       # API client configuration
│   │   │   ├── endpoints.ts                    # API endpoint constants
│   │   │   ├── interceptors.ts                 # Request/response interceptors
│   │   │   └── types.ts                        # API-specific types
│   │   ├── auth/
│   │   │   ├── client.ts                       # Auth client (Keycloak)
│   │   │   ├── config.ts                       # Auth configuration
│   │   │   ├── middleware.ts                   # Auth middleware
│   │   │   └── utils.ts                        # Auth utilities
│   │   ├── stripe/
│   │   │   ├── client.ts                       # Stripe client setup
│   │   │   ├── config.ts                       # Stripe configuration
│   │   │   ├── utils.ts                        # Stripe utilities
│   │   │   └── types.ts                        # Stripe-specific types
│   │   ├── utils/
│   │   │   ├── cn.ts                           # Class name utility (clsx + twMerge)
│   │   │   ├── format.ts                       # Formatting utilities
│   │   │   ├── validation.ts                   # Validation schemas (Zod)
│   │   │   ├── date.ts                         # Date utilities
│   │   │   ├── currency.ts                     # Currency formatting
│   │   │   ├── url.ts                          # URL utilities
│   │   │   └── constants.ts                    # App constants
│   │   ├── config/
│   │   │   ├── env.ts                          # Environment variables
│   │   │   ├── database.ts                     # Database configuration
│   │   │   └── features.ts                     # Feature flags
│   │   └── fonts/
│   │       ├── index.ts                        # Font configurations
│   │       └── geist.ts                        # Geist font setup
│   │
│   ├── services/                      # API service layer
│   │   ├── flight-service.ts                   # Flight API service
│   │   ├── hotel-service.ts                    # Hotel API service
│   │   ├── package-service.ts                  # Package API service
│   │   ├── booking-service.ts                  # Booking API service
│   │   ├── payment-service.ts                  # Payment API service
│   │   ├── customer-service.ts                 # Customer API service
│   │   ├── location-service.ts                 # Location API service
│   │   ├── notification-service.ts             # Notification service
│   │   └── analytics-service.ts                # Analytics service
│   │
│   ├── stores/                        # Zustand state management
│   │   ├── booking-store.ts                    # Booking state management
│   │   ├── search-store.ts                     # Search state management
│   │   ├── auth-store.ts                       # Authentication state
│   │   ├── ui-store.ts                         # UI state management
│   │   ├── payment-store.ts                    # Payment state
│   │   ├── filter-store.ts                     # Filter state
│   │   └── user-store.ts                       # User profile state
│   │
│   ├── types/                         # TypeScript type definitions
│   │   ├── api/
│   │   │   ├── flight.ts                       # Flight API types
│   │   │   ├── hotel.ts                        # Hotel API types
│   │   │   ├── booking.ts                      # Booking API types
│   │   │   ├── payment.ts                      # Payment API types
│   │   │   ├── customer.ts                     # Customer API types
│   │   │   ├── location.ts                     # Location API types
│   │   │   └── common.ts                       # Common API types
│   │   ├── ui/
│   │   │   ├── components.ts                   # Component prop types
│   │   │   ├── forms.ts                        # Form types
│   │   │   ├── navigation.ts                   # Navigation types
│   │   │   └── layout.ts                       # Layout types
│   │   ├── business/
│   │   │   ├── booking.ts                      # Business booking types
│   │   │   ├── search.ts                       # Search types
│   │   │   ├── user.ts                         # User types
│   │   │   └── travel.ts                       # Travel-specific types
│   │   ├── auth.ts                             # Authentication types
│   │   ├── stripe.ts                           # Stripe types
│   │   ├── env.ts                              # Environment types
│   │   └── global.ts                           # Global type definitions
│   │
│   └── styles/                        # Additional styles
│       ├── components/
│       │   ├── booking.css                     # Booking-specific styles
│       │   ├── search.css                      # Search-specific styles
│       │   ├── payment.css                     # Payment-specific styles
│       │   └── dashboard.css                   # Dashboard-specific styles
│       ├── utilities/
│       │   ├── animations.css                  # Custom animations
│       │   ├── responsive.css                  # Responsive utilities
│       │   └── print.css                       # Print styles
│       └── themes/
│           ├── light.css                       # Light theme variables
│           └── dark.css                        # Dark theme variables
│
├── docs/                              # Documentation
│   ├── api/                           # API documentation
│   │   ├── endpoints.md               # API endpoints documentation
│   │   └── authentication.md          # Authentication guide
│   ├── components/                    # Component documentation
│   │   ├── ui-components.md           # UI components guide
│   │   └── business-components.md     # Business components guide
│   ├── deployment/                    # Deployment documentation
│   │   ├── docker.md                  # Docker deployment
│   │   └── production.md              # Production deployment
│   └── development/
│       ├── setup.md                   # Development setup
│       ├── conventions.md             # Coding conventions
│       └── testing.md                 # Testing guide
│
├── tests/                             # Test files
│   ├── __mocks__/                     # Mock files
│   │   ├── stripe.ts                  # Stripe mocks
│   │   └── api.ts                     # API mocks
│   ├── components/                    # Component tests
│   │   ├── ui/                        # UI component tests
│   │   ├── forms/                     # Form component tests
│   │   └── booking/                   # Booking component tests
│   ├── hooks/                         # Hook tests
│   │   ├── api/                       # API hook tests
│   │   └── ui/                        # UI hook tests
│   ├── services/                      # Service tests
│   │   ├── flight-service.test.ts     # Flight service tests
│   │   └── booking-service.test.ts    # Booking service tests
│   ├── stores/                        # Store tests
│   │   ├── booking-store.test.ts      # Booking store tests
│   │   └── search-store.test.ts       # Search store tests
│   ├── utils/                         # Utility tests
│   │   ├── format.test.ts             # Format utility tests
│   │   └── validation.test.ts         # Validation tests
│   └── setup.ts                       # Test setup configuration
│
└── scripts/                           # Build and utility scripts
    ├── build/
    │   ├── analyze-bundle.js           # Bundle analysis script
    │   └── generate-sitemap.js         # Sitemap generation
    ├── dev/
    │   ├── setup-env.js                # Environment setup
    │   └── mock-api.js                 # Mock API server
    └── deploy/
        ├── docker-build.sh             # Docker build script
        └── production-deploy.sh        # Production deployment
```

## Detailed Folder Explanations

### 1. Next.js 15 App Router Structure (`src/app/`)

#### Route Groups
- **(auth)**: Authentication-related pages with shared layout
- **(booking)**: Booking flow pages with booking-specific layout
- **(dashboard)**: User dashboard pages with sidebar layout
- **(marketing)**: Marketing and informational pages

#### Key Features
- **Parallel Routes**: Support for loading states and error boundaries
- **Route Handlers**: API routes for webhooks and server-side logic
- **Layout Hierarchy**: Nested layouts for different page groups
- **Dynamic Routes**: Parameterized routes for bookings, flights, hotels

### 2. Component Architecture (`src/components/`)

#### UI Components (`ui/`)
- **shadcn/ui Components**: All 46 shadcn/ui components
- **Consistent Styling**: Unified design system implementation
- **Accessibility**: ARIA-compliant components
- **Customization**: BookingSmart brand integration

#### Layout Components (`layout/`)
- **Header**: Navigation, user menu, search bar
- **Footer**: Links, newsletter, social media
- **Sidebar**: Dashboard navigation, filters
- **Breadcrumb**: Navigation and progress indication

#### Form Components (`forms/`)
- **Search Forms**: Flight, hotel, package search
- **Booking Forms**: Passenger details, contact information
- **Payment Forms**: Stripe integration, billing address
- **Profile Forms**: User profile, preferences, settings
- **Auth Forms**: Login, registration, password reset

#### Booking Components (`booking/`)
- **Cards**: Result display components
- **Details**: Detailed view components
- **Selection**: Interactive selection interfaces
- **Status**: Status indication components
- **Summary**: Summary and breakdown components

#### Search Components (`search/`)
- **Filters**: Price, airline, amenity filters
- **Results**: Search result display and management
- **Sorting**: Sort options and view toggles
- **Pagination**: Result navigation components

#### Common Components (`common/`)
- **Loading**: Various loading state components
- **Error**: Error handling and display
- **Modals**: Dialog and modal components
- **Feedback**: Notifications and messages
- **Navigation**: Navigation utilities

#### Blocks (`blocks/`)
- **Calendar**: Advanced calendar components
- **Dashboard**: Dashboard layout blocks
- **Sidebar**: Sidebar layout blocks
- **Login**: Authentication layout blocks

### 3. Business Logic Layer

#### Hooks (`src/hooks/`)
- **API Hooks**: Data fetching and mutation hooks
- **Booking Hooks**: Booking flow management
- **Payment Hooks**: Stripe and payment processing
- **UI Hooks**: UI state and interaction management
- **Utility Hooks**: Common utility hooks

#### Services (`src/services/`)
- **API Services**: Backend integration layer
- **Error Handling**: Consistent error management
- **Type Safety**: Full TypeScript integration
- **Caching**: Response caching strategies

#### Stores (`src/stores/`)
- **Zustand Stores**: State management with Zustand
- **Persistent State**: Local storage integration
- **Type Safety**: Fully typed state management
- **Modular Design**: Separate stores for different concerns

### 4. Type System (`src/types/`)

#### API Types (`api/`)
- **Backend Integration**: Types matching backend DTOs
- **Request/Response**: API request and response types
- **Error Types**: Standardized error handling

#### UI Types (`ui/`)
- **Component Props**: Component interface definitions
- **Form Types**: Form data and validation types
- **Layout Types**: Layout component types

#### Business Types (`business/`)
- **Domain Models**: Business logic types
- **Workflow Types**: Booking and search workflow types
- **User Types**: User and profile types

### 5. Utility Layer (`src/lib/`)

#### API Configuration (`api/`)
- **Client Setup**: Axios configuration with interceptors
- **Endpoint Management**: Centralized endpoint definitions
- **Authentication**: Request authentication handling

#### Authentication (`auth/`)
- **Keycloak Integration**: Authentication client setup
- **Middleware**: Route protection and auth checks
- **Utilities**: Auth helper functions

#### Stripe Integration (`stripe/`)
- **Client Setup**: Stripe.js configuration
- **Payment Processing**: Payment flow utilities
- **Error Handling**: Stripe-specific error management

#### Utilities (`utils/`)
- **Formatting**: Date, currency, text formatting
- **Validation**: Zod schema definitions
- **Constants**: Application constants
- **Helper Functions**: Common utility functions

## File Naming Conventions

### Components
- **PascalCase**: `FlightSearchForm.tsx`, `BookingCard.tsx`
- **Index Files**: `index.tsx` for main component exports
- **Descriptive Names**: Clear, descriptive component names
- **Feature Prefixes**: `flight-`, `hotel-`, `booking-` prefixes where appropriate

### Hooks
- **camelCase**: `useFlights.ts`, `useBookingFlow.ts`
- **use Prefix**: All custom hooks start with `use`
- **Descriptive Names**: Clear indication of hook purpose
- **Feature Grouping**: Organized by feature area

### Services
- **kebab-case**: `flight-service.ts`, `booking-service.ts`
- **Service Suffix**: All services end with `-service`
- **Class Names**: PascalCase class names (e.g., `FlightService`)
- **Method Names**: camelCase method names

### Types
- **PascalCase**: Interface and type names
- **Descriptive Names**: Clear type definitions
- **Feature Grouping**: Organized by domain area
- **Suffix Conventions**: `Request`, `Response`, `Data`, `Props`

### Stores
- **kebab-case**: `booking-store.ts`, `search-store.ts`
- **Store Suffix**: All stores end with `-store`
- **Hook Names**: `useBookingStore`, `useSearchStore`
- **State Interfaces**: `BookingState`, `SearchState`

## Travel-Specific Feature Organization

### Flight Features
```
components/booking/cards/flight-card.tsx
components/forms/search/flight-search-form.tsx
services/flight-service.ts
types/api/flight.ts
hooks/api/use-flights.ts
```

### Hotel Features
```
components/booking/cards/hotel-card.tsx
components/forms/search/hotel-search-form.tsx
services/hotel-service.ts
types/api/hotel.ts
hooks/api/use-hotels.ts
```

### Package Features
```
components/booking/cards/package-card.tsx
components/forms/search/package-search-form.tsx
services/package-service.ts
types/api/package.ts
hooks/api/use-packages.ts
```

### Booking Flow Features
```
components/booking/summary/booking-summary.tsx
components/forms/booking/passenger-details-form.tsx
stores/booking-store.ts
hooks/booking/use-booking-flow.ts
```

## Integration Points

### Stripe Payment Integration
```
lib/stripe/client.ts              # Stripe client setup
components/forms/payment/         # Payment form components
hooks/payment/use-stripe.ts       # Stripe hooks
services/payment-service.ts       # Payment API service
types/stripe.ts                   # Stripe type definitions
```

### Zustand State Management
```
stores/                           # All Zustand stores
hooks/*/use-*.ts                  # Store integration hooks
components/                       # Component store usage
types/business/                   # State type definitions
```

### shadcn/ui Components
```
components/ui/                    # All shadcn/ui components
components/blocks/                # Complex shadcn/ui blocks
tailwind.config.ts               # Tailwind configuration
src/app/globals.css              # Global styles and CSS variables
```

## Development Workflow Alignment

### Phase 1: Foundation Setup (Week 1-2)
- Install shadcn/ui components in `components/ui/`
- Setup basic layout components in `components/layout/`
- Configure Tailwind and global styles

### Phase 2: Core Components (Week 3-4)
- Implement search forms in `components/forms/search/`
- Create navigation components in `components/layout/header/`
- Setup basic API services in `services/`

### Phase 3: Booking Flow (Week 5-6)
- Build booking cards in `components/booking/cards/`
- Implement booking forms in `components/forms/booking/`
- Create booking flow hooks in `hooks/booking/`

### Phase 4: Payment & Dashboard (Week 7-8)
- Integrate Stripe components in `components/forms/payment/`
- Build dashboard components in `components/blocks/dashboard/`
- Implement user management features

### Phase 5: Advanced Features (Week 9-10)
- Add calendar blocks in `components/blocks/calendar/`
- Implement advanced filtering in `components/search/filters/`
- Complete testing and documentation

This folder structure provides a scalable, maintainable foundation for the travel booking platform while following Next.js 15 best practices and supporting the enhanced architecture with shadcn/ui integration.
