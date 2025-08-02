# Enhanced Frontend Architecture with shadcn/ui Integration

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Component Inventory](#component-inventory)
3. [Block Analysis](#block-analysis)
4. [Component-to-Feature Mapping](#component-to-feature-mapping)
5. [Brand Customization](#brand-customization)
6. [Responsive Design Strategy](#responsive-design-strategy)
7. [Performance Optimization](#performance-optimization)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Integration Patterns](#integration-patterns)
10. [Code Examples](#code-examples)

## Executive Summary

This enhanced architecture plan integrates shadcn/ui v4 components and blocks into our travel booking platform, providing a comprehensive component mapping strategy that accelerates development while maintaining design consistency and accessibility standards.

### Key Benefits
- **46 pre-built components** covering all UI needs
- **55 complex blocks** for rapid prototyping
- **Brand-consistent design system** with BookingSmart colors
- **Mobile-first responsive patterns**
- **Performance-optimized loading states**
- **Seamless integration** with existing Stripe payment and Zustand state management

## Component Inventory

### Available shadcn/ui Components (46 total)

#### Form & Input Components
- `button` - Primary actions, CTAs, form submissions
- `input` - Text inputs, search fields, form data entry
- `select` - Dropdowns for airports, hotels, passenger counts
- `checkbox` - Terms acceptance, amenity filters
- `radio-group` - Trip type selection (one-way, round-trip)
- `textarea` - Special requests, comments
- `form` - Structured form handling with validation
- `label` - Accessible form labels
- `slider` - Price range filters
- `switch` - Settings toggles
- `toggle` - View mode switches
- `toggle-group` - Multiple selection options

#### Layout & Navigation Components
- `card` - Flight/hotel display containers, form wrappers
- `tabs` - Multi-step booking process, content organization
- `accordion` - Collapsible filter sections, FAQ
- `collapsible` - Expandable flight details
- `navigation-menu` - Main site navigation with dropdowns
- `breadcrumb` - Booking flow progress indication
- `sidebar` - Filter panels, admin navigation
- `sheet` - Mobile menu drawer, quick actions
- `drawer` - Mobile-friendly overlays

#### Data Display Components
- `table` - Booking history, search results
- `badge` - Status indicators, price tags, airline codes
- `avatar` - Airline logos, user profiles
- `progress` - Booking completion, loading progress
- `skeleton` - Loading placeholders
- `chart` - Analytics, price trends
- `carousel` - Hotel image galleries

#### Feedback & Overlay Components
- `alert` - System messages, booking confirmations
- `alert-dialog` - Cancellation confirmations
- `dialog` - Modal forms, detailed views
- `popover` - Additional information, quick actions
- `tooltip` - Help text, feature explanations
- `hover-card` - Preview information
- `sonner` - Toast notifications
- `context-menu` - Right-click actions
- `dropdown-menu` - User menus, action lists

#### Specialized Components
- `calendar` - Date selection for travel dates
- `command` - Search with keyboard navigation
- `pagination` - Search results navigation
- `scroll-area` - Long content areas
- `separator` - Visual content division
- `resizable` - Adjustable layout panels
- `menubar` - Application menu bar
- `aspect-ratio` - Consistent image ratios
- `input-otp` - Verification codes

## Block Analysis

### Available Blocks (55 total)

#### Calendar Blocks (32 blocks)
Perfect for travel date selection with various complexity levels:

- **calendar-12**: Multi-language date range picker with localization
  - Use case: International travel booking with language switching
  - Features: Localized strings, date range selection, dropdown controls

- **calendar-20**: Advanced booking calendar with availability
  - Use case: Hotel availability calendar, flight schedule display
  - Features: Complex date logic, availability indicators

- **calendar-26**: Complex scheduling interface
  - Use case: Multi-city trip planning, complex itineraries
  - Features: Advanced date manipulation, multiple date ranges

#### Dashboard Blocks (1 block)
- **dashboard-01**: Complete admin interface
  - Use case: Admin panel for managing bookings, analytics
  - Features: Sidebar navigation, data tables, charts, user management

#### Sidebar Blocks (16 blocks)
Navigation patterns for different use cases:

- **sidebar-01**: Documentation-style navigation with search
  - Use case: Help center, booking management navigation
  - Features: Hierarchical navigation, search functionality

#### Login Blocks (5 blocks)
Authentication interfaces:
- **login-01** to **login-05**: Different authentication layouts
  - Use case: User authentication, registration flows
  - Features: Various form layouts, social login options

#### Products Block (1 block)
- **products-01**: E-commerce product listing patterns
  - Use case: Flight/hotel listing pages, package displays
  - Features: Product grids, filtering, sorting

## Component-to-Feature Mapping

### 1. Search Forms

#### Flight Search Form
```typescript
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const FlightSearchForm = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Find Your Perfect Flight</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="From" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hcm">Ho Chi Minh City (SGN)</SelectItem>
              <SelectItem value="hn">Hanoi (HAN)</SelectItem>
            </SelectContent>
          </Select>
          
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="To" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bkk">Bangkok (BKK)</SelectItem>
              <SelectItem value="sin">Singapore (SIN)</SelectItem>
            </SelectContent>
          </Select>
          
          <Calendar
            mode="range"
            selected={dateRange}
            onSelect={setDateRange}
            className="rounded-md border"
          />
          
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Passengers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Adult</SelectItem>
              <SelectItem value="2">2 Adults</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full mt-4" size="lg">
          Search Flights
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 2. Product Cards

#### Flight Results Card
```typescript
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

const FlightCard = ({ flight }: { flight: Flight }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={flight.airline.logo} alt={flight.airline.name} />
              <AvatarFallback>{flight.airline.code}</AvatarFallback>
            </Avatar>
            <div>
              <Badge variant="outline">{flight.flightNumber}</Badge>
              <div className="text-sm text-muted-foreground">
                {flight.departureTime} - {flight.arrivalTime}
              </div>
              <Progress value={flight.durationPercentage} className="w-32 mt-2" />
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {flight.price.toLocaleString('vi-VN')} VND
            </div>
            <Button>Select Flight</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 3. Navigation Components

#### Main Navigation Header
```typescript
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger } from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

const MainNavigation = () => {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <div className="text-xl font-bold text-primary">BookingSmart</div>
            
            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Flights</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 md:w-[400px]">
                      <NavigationMenuLink href="/flights/domestic">
                        Domestic Flights
                      </NavigationMenuLink>
                      <NavigationMenuLink href="/flights/international">
                        International Flights
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuTrigger>Hotels</NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-6 md:w-[400px]">
                      <NavigationMenuLink href="/hotels">
                        Find Hotels
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          
          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <div className="grid gap-4 py-4">
                <Button variant="ghost" className="justify-start">
                  Flights
                </Button>
                <Button variant="ghost" className="justify-start">
                  Hotels
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
```

### 4. Booking Flow Components

#### Multi-Step Booking Process
```typescript
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"

const BookingFlow = () => {
  const [currentStep, setCurrentStep] = useState("search")

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Progress Breadcrumb */}
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/search">Search</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/select">Select</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Payment</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Step Navigation */}
      <Tabs value={currentStep} onValueChange={setCurrentStep} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="select">Select</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-8">
          <FlightSearchForm />
        </TabsContent>

        <TabsContent value="select" className="mt-8">
          <FlightSelectionGrid />
        </TabsContent>

        <TabsContent value="details" className="mt-8">
          <PassengerDetailsForm />
        </TabsContent>

        <TabsContent value="payment" className="mt-8">
          <StripePaymentForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

#### Passenger Details Form
```typescript
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { useForm } from "react-hook-form"

const PassengerDetailsForm = () => {
  const form = useForm()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Passenger Information</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to the terms and conditions
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
```

### 5. Payment Integration with Stripe

#### Enhanced Payment Form
```typescript
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Lock, Shield, CreditCard, Loader2 } from "lucide-react"
import { Elements } from '@stripe/react-stripe-js'

const StripePaymentForm = ({ clientSecret, bookingDetails }) => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-green-600" />
          Secure Payment
        </CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Protected by Stripe SSL encryption</span>
          </div>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <PaymentElement />
        </Elements>

        <Separator />

        {/* Booking Summary */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Flight Total:</span>
            <span>{bookingDetails.flightPrice}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Taxes & Fees:</span>
            <span>{bookingDetails.taxes}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total:</span>
            <span>{bookingDetails.totalAmount}</span>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Pay {bookingDetails.totalAmount}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
```

## Brand Customization

### BookingSmart Color Scheme Integration

#### Tailwind Configuration
```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // BookingSmart Brand Colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(217, 91%, 60%)", // #4070AA BookingSmart Blue
          foreground: "hsl(0, 0%, 98%)",
          50: "hsl(210, 67%, 98%)",   // #F9FCFD
          100: "hsl(210, 44%, 96%)",  // Very light blue
          200: "hsl(210, 44%, 87%)",  // #DBE5EF Light Blue
          500: "hsl(217, 91%, 60%)",  // #4070AA Primary
          600: "hsl(217, 91%, 50%)",  // Darker primary
          900: "hsl(217, 92%, 20%)",  // #102034 Dark Blue
        },
        secondary: {
          DEFAULT: "hsl(210, 44%, 87%)", // #DBE5EF
          foreground: "hsl(217, 92%, 20%)", // #102034
        },
        accent: {
          DEFAULT: "hsl(210, 67%, 98%)", // #F9FCFD
          foreground: "hsl(217, 92%, 20%)",
        },
        muted: {
          DEFAULT: "hsl(210, 44%, 96%)",
          foreground: "hsl(215, 16%, 47%)",
        },
        // Travel-specific colors
        success: {
          DEFAULT: "hsl(142, 76%, 36%)", // Green for confirmed bookings
          foreground: "hsl(0, 0%, 98%)",
        },
        warning: {
          DEFAULT: "hsl(38, 92%, 50%)", // Orange for pending
          foreground: "hsl(0, 0%, 98%)",
        },
        destructive: {
          DEFAULT: "hsl(0, 84%, 60%)", // Red for cancelled
          foreground: "hsl(0, 0%, 98%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-in-out",
        "slide-up": "slide-up 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

#### CSS Variables for Brand Colors
```css
/* src/app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* BookingSmart Brand Colors */
    --background: 0 0% 100%;
    --foreground: 217 92% 20%; /* #102034 */

    --primary: 217 91% 60%; /* #4070AA */
    --primary-foreground: 0 0% 98%;

    --secondary: 210 44% 87%; /* #DBE5EF */
    --secondary-foreground: 217 92% 20%;

    --accent: 210 67% 98%; /* #F9FCFD */
    --accent-foreground: 217 92% 20%;

    --muted: 210 44% 96%;
    --muted-foreground: 215 16% 47%;

    --border: 210 44% 89.8%;
    --input: 210 44% 89.8%;
    --ring: 217 91% 60%;

    --radius: 0.5rem;
  }

  .dark {
    --background: 217 92% 8%; /* Dark version of #102034 */
    --foreground: 0 0% 98%;

    --primary: 217 91% 70%; /* Lighter primary for dark mode */
    --primary-foreground: 217 92% 8%;

    --secondary: 217 92% 15%;
    --secondary-foreground: 0 0% 98%;

    --accent: 217 92% 12%;
    --accent-foreground: 0 0% 98%;

    --muted: 217 92% 12%;
    --muted-foreground: 215 16% 65%;

    --border: 217 92% 15%;
    --input: 217 92% 15%;
    --ring: 217 91% 70%;
  }
}

@layer components {
  /* BookingSmart specific component styles */
  .booking-card {
    @apply bg-card text-card-foreground rounded-xl border shadow-sm hover:shadow-md transition-shadow;
  }

  .booking-card-featured {
    @apply booking-card border-primary/50 bg-primary/5;
  }

  .price-display {
    @apply text-2xl font-bold text-primary;
  }

  .status-badge-confirmed {
    @apply bg-success text-success-foreground;
  }

  .status-badge-pending {
    @apply bg-warning text-warning-foreground;
  }

  .status-badge-cancelled {
    @apply bg-destructive text-destructive-foreground;
  }
}
```

## Responsive Design Strategy

### Mobile-First Implementation Patterns

#### Responsive Search Form
```typescript
import { useIsMobile } from "@/hooks/use-mobile"

const ResponsiveSearchForm = () => {
  const isMobile = useIsMobile()

  return (
    <Card className="w-full">
      <CardContent className="p-4 md:p-6">
        {/* Mobile: Stack vertically, Desktop: Grid layout */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <Label>From</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Origin" />
              </SelectTrigger>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>To</Label>
            <Select>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Destination" />
              </SelectTrigger>
            </Select>
          </div>

          {/* Mobile: Full width calendar */}
          <div className="space-y-2 md:col-span-2 lg:col-span-1">
            <Label>Dates</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange ? formatDateRange(dateRange) : "Select dates"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={isMobile ? 1 : 2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Mobile: Full width button */}
        <Button className="w-full mt-6" size="lg">
          <Search className="mr-2 h-4 w-4" />
          Search Flights
        </Button>
      </CardContent>
    </Card>
  )
}
```

## Performance Optimization

### Component Lazy Loading
```typescript
import { lazy, Suspense } from 'react'
import { Skeleton } from "@/components/ui/skeleton"

// Lazy load heavy components
const BookingCalendar = lazy(() => import('@/components/booking/booking-calendar'))
const PaymentForm = lazy(() => import('@/components/forms/payment-form'))
const DataTable = lazy(() => import('@/components/ui/data-table'))

// Usage with Suspense and skeleton loading
const BookingPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
        <BookingCalendar />
      </Suspense>

      <Suspense fallback={<PaymentFormSkeleton />}>
        <PaymentForm />
      </Suspense>
    </div>
  )
}
```

### Skeleton Loading Patterns
```typescript
// Consistent loading states for different components
const FlightCardSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-8 w-[100px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
      </div>
    </CardContent>
  </Card>
)

const SearchResultsSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <FlightCardSkeleton key={i} />
    ))}
  </div>
)
```

## Implementation Roadmap

### Phase 1: Foundation Setup (Week 1-2)

#### 1.1 Install shadcn/ui Dependencies
```bash
cd storefront-fe
npm install @radix-ui/react-accordion @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/react-toast class-variance-authority clsx lucide-react tailwind-merge tailwindcss-animate
```

#### 1.2 Configure components.json
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "blue",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks"
  },
  "iconLibrary": "lucide"
}
```

#### 1.3 Install Core Components
```bash
npx shadcn@latest add button card input select calendar badge avatar table tabs dialog sheet sidebar breadcrumb form checkbox radio-group textarea slider switch toggle accordion collapsible navigation-menu popover tooltip hover-card alert alert-dialog dropdown-menu context-menu sonner progress skeleton carousel separator resizable menubar aspect-ratio pagination scroll-area command input-otp
```

### Phase 2: Core Components (Week 3-4)

#### 2.1 Search Forms Implementation
- Flight search with calendar integration
- Hotel search with location autocomplete
- Package search combining both
- Advanced filtering with accordion panels

#### 2.2 Navigation Setup
- Header navigation with dropdown menus
- Mobile navigation with sheet component
- Breadcrumb implementation for booking flow
- Sidebar for admin and filter panels

### Phase 3: Booking Flow (Week 5-6)

#### 3.1 Results Display
- Flight cards with comparison features
- Hotel cards with image carousels
- Filtering and sorting interfaces
- Pagination for large result sets

#### 3.2 Selection Process
- Multi-step booking flow with tabs
- Passenger details forms with validation
- Seat selection interfaces
- Booking summary components

### Phase 4: Payment & Dashboard (Week 7-8)

#### 4.1 Payment Integration
- Stripe payment forms with shadcn/ui styling
- Payment confirmation flows
- Error handling interfaces
- Security indicators and badges

#### 4.2 User Dashboard
- Booking history with data tables
- Profile management forms
- Booking management interfaces
- Status tracking components

### Phase 5: Advanced Features (Week 9-10)

#### 5.1 Calendar Blocks Integration
- Advanced date selection with calendar-12
- Availability calendars for hotels
- Multi-destination trip planning
- Localization support

#### 5.2 Dashboard Blocks
- Admin dashboard with dashboard-01
- Analytics and reporting interfaces
- User management systems
- Performance monitoring

## Integration Patterns

### Zustand State Management Integration
```typescript
// Enhanced booking store with UI state
interface BookingState {
  // Data state
  searchCriteria: SearchCriteria | null
  searchResults: SearchResults | null
  selectedFlight: Flight | null

  // UI state for shadcn/ui components
  isSearchFormOpen: boolean
  selectedFilters: FilterState
  currentStep: BookingStep
  calendarState: {
    selectedDates: DateRange | undefined
    isCalendarOpen: boolean
  }

  // Actions
  setSearchFormOpen: (open: boolean) => void
  updateFilters: (filters: FilterState) => void
  updateCalendarState: (state: Partial<CalendarState>) => void
  nextStep: () => void
  previousStep: () => void
}

// Usage in components
const useBookingStore = create<BookingState>((set, get) => ({
  // Initial state
  isSearchFormOpen: false,
  selectedFilters: {},
  currentStep: 'search',
  calendarState: {
    selectedDates: undefined,
    isCalendarOpen: false,
  },

  // Actions
  setSearchFormOpen: (open) => set({ isSearchFormOpen: open }),
  updateFilters: (filters) => set({ selectedFilters: filters }),
  updateCalendarState: (state) => set((prev) => ({
    calendarState: { ...prev.calendarState, ...state }
  })),
  nextStep: () => {
    const steps = ['search', 'select', 'details', 'payment']
    const currentIndex = steps.indexOf(get().currentStep)
    if (currentIndex < steps.length - 1) {
      set({ currentStep: steps[currentIndex + 1] })
    }
  },
}))
```

### API Integration with Error Handling
```typescript
// Service layer with shadcn/ui error handling
import { toast } from "sonner"

export class FlightService {
  static async searchFlights(criteria: SearchCriteria): Promise<FlightResult[]> {
    try {
      const response = await apiClient.get('/api/flights/search', { params: criteria })
      toast.success('Flights loaded successfully')
      return response.data
    } catch (error) {
      toast.error('Failed to search flights. Please try again.')
      throw error
    }
  }

  static async bookFlight(bookingData: BookingRequest): Promise<BookingResponse> {
    try {
      const response = await apiClient.post('/api/bookings', bookingData)
      toast.success('Booking confirmed successfully!')
      return response.data
    } catch (error) {
      toast.error('Booking failed. Please check your details and try again.')
      throw error
    }
  }
}
```

## Code Examples

### Complete Flight Search Component
```typescript
'use client'

import { useState } from 'react'
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Search } from "lucide-react"
import { DateRange } from "react-day-picker"
import { format } from "date-fns"
import { useBookingStore } from "@/stores/booking-store"

export const FlightSearchForm = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [passengers, setPassengers] = useState("1")

  const { searchFlights, isLoading } = useBookingStore()

  const handleSearch = async () => {
    if (!origin || !destination || !dateRange?.from) {
      toast.error('Please fill in all required fields')
      return
    }

    await searchFlights({
      origin,
      destination,
      departureDate: dateRange.from,
      returnDate: dateRange.to,
      passengers: parseInt(passengers),
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Find Your Perfect Flight</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Origin Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">From</label>
            <Select value={origin} onValueChange={setOrigin}>
              <SelectTrigger>
                <SelectValue placeholder="Select origin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SGN">Ho Chi Minh City (SGN)</SelectItem>
                <SelectItem value="HAN">Hanoi (HAN)</SelectItem>
                <SelectItem value="DAD">Da Nang (DAD)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Destination Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <Select value={destination} onValueChange={setDestination}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BKK">Bangkok (BKK)</SelectItem>
                <SelectItem value="SIN">Singapore (SIN)</SelectItem>
                <SelectItem value="KUL">Kuala Lumpur (KUL)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Dates</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd")} -{" "}
                        {format(dateRange.to, "LLL dd")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd")
                    )
                  ) : (
                    "Select dates"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Passenger Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Passengers</label>
            <Select value={passengers} onValueChange={setPassengers}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Adult</SelectItem>
                <SelectItem value="2">2 Adults</SelectItem>
                <SelectItem value="3">3 Adults</SelectItem>
                <SelectItem value="4">4 Adults</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Button */}
        <Button
          className="w-full mt-6"
          size="lg"
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Search Flights
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
```

---

This comprehensive documentation provides a complete roadmap for implementing the enhanced frontend architecture with shadcn/ui integration. The plan ensures consistency with the existing BookingSmart brand while leveraging modern UI components for an exceptional user experience across all devices.
