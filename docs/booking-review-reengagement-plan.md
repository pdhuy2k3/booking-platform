# Booking Review Re-engagement & Search State Plan

## Objective
Improve the booking review experience so customers can quickly:
- Jump back to search results with their previous filters (destination, dates, pax counts).
- Extend a booking (e.g. add a flight after selecting a hotel, start a round trip).
- Initiate an AI-assisted query prefilled with relevant context.

## Pain Points
1. **No preserved search state**  
   - Components like `booking-review`, `flight-search-tab.tsx`, `hotel-search-tab.tsx`, and the underlying context do not store the user’s last search filters in query params.
   - Navigating back to search requires re‑entering destination, dates, and guest counts.

2. **Review modal lacks re-engagement actions**  
   - After choosing a flight/hotel, users see the review but cannot easily add complementary bookings (flight + hotel combos, round trips, bookings for a friend).
   - There is no quick CTA to re-search using existing itineraries or to invoke AI with context.

3. **AI chat lacks deep links from booking context**  
   - `chat-interface.tsx` and `ai-response-renderer.tsx` render conversations, but there is no simple way to push a “new request” using booking data.
   - Hooks like `useAiChat.ts` expect manual prompt crafting; we need a helper that seeds the context automatically.
   - AI responses currently flow over HTTP; Cloudflare cuts the connection at 100 seconds, so long orchestrations fail even when the backend finishes.

## Target UX
1. **Persist search filters**  
   - Every time a user searches flights or hotels (`search-interface.tsx`, `flight-search-tab.tsx`, `hotel-search-tab.tsx`), capture the criteria (destination, dates, passenger counts, class, etc.) in a deterministic object and push to URL query params (e.g., `/search/flights?origin=SGN&destination=HAN&date=2024-07-01&adults=2`).
   - Store the same object in `booking-context.tsx` so the booking review can recall it.

2. **Enhanced Booking Review modal**  
   - Show “Book another flight”, “Book another hotel”, “Round trip” buttons.
   - When clicked, open a small chooser:
     - Option to reuse existing itinerary dates (e.g., use hotel check-in/check-out).
     - Option to modify dates before navigating (optional).
   - Provide two actions: “Search with these filters” (navigates to the appropriate search tab with prepopulated query params) and “Ask AI for suggestions” (opens chat interface with seeded prompt).

3. **AI quick prompt**  
   - Build a helper (e.g., `buildAiPromptFromBooking(booking)`) that constructs a concise prompt summarizing destination, dates, party size, and desired action (e.g., “Find a return flight from HAN to SGN on July 10 for 2 adults”).
   - Extend `useAiChat.ts` with a function `startNewConversation(initialPrompt)` that posts the prompt immediately and surfaces results in `chat-interface.tsx`.
   - Rather than POSTing via HTTP, have `startNewConversation` open a WebSocket connection to the BFF and stream tokens in real time.
   - Use a Next.js context provider (or existing AI chat provider) to trigger that request when the user chooses “Continue with AI” from the review.

## Implementation Plan
### 1. Persist Search Filters
- **Files**:  
  - `storefront-fe/components/search-interface.tsx`  
  - `storefront-fe/components/search/flight-search-tab.tsx`  
  - `storefront-fe/components/search/hotel-search-tab.tsx`  
  - `storefront-fe/app/page.tsx` (home page triggers initial search)
- **Steps**:  
  1. Create a utility to serialize/deserialize search filters to query params.
  2. On search form submit, call `router.push` with the serialized params and store them in a context slice (existing booking context or new `SearchContext`).
  3. When search tabs mount, read router query params and seed default form values.
  4. Update booking context to store `lastFlightSearch` and `lastHotelSearch` snapshots.

### 2. Augment Booking Review
- **Files**:  
  - `storefront-fe/components/booking-review.tsx` (or equivalent modal component)
  - `storefront-fe/contexts/booking-context.tsx`
- **Steps**:  
  1. Pull `lastFlightSearch` / `lastHotelSearch` from context; derive recommended filters when the user has a partial itinerary.
  2. Add buttons for “Book another flight”, “Book another hotel”, “Round trip”, “Book for a friend”.
  3. Each button opens a small selector or directly triggers navigation:
     - Reuse current details (destination, dates) but adjust directionality if needed.
     - When confirmed, navigate to `/search/flights?...` or `/search/hotels?...` using query params or open AI chat.
  4. After the user selects new search results, merge back into the existing booking data (combo logic already added).

### 3. AI Quick Prompt
- **Files**:  
  - `storefront-fe/components/chat-interface.tsx`  
  - `storefront-fe/components/ai-response-renderer.tsx`  
  - `storefront-fe/modules/ai/hooks/useAiChat.ts`  
  - `storefront-fe/modules/ai/service/ai-chat.ts`
- **Steps**:  
  1. Extend `useAiChat` with `startWithPrompt(prompt, metadata?)` that opens the authenticated WebSocket (`/api/ai/ws`) via the BFF.
  2. Update `ai-chat.ts` to wrap WebSocket creation, manage connection lifecycle (connect, message handlers, reconnect), and expose a hook-friendly API (`sendPrompt`, `abort`, `status`).
  3. Expose a context/provider that allows any component (booking review) to trigger `startWithPrompt`.
  4. Build helper `buildAiPromptFromBooking(bookingContext, actionType)` to craft natural language prompts.
  5. From the review modal, wire “Ask AI” buttons to trigger the provider and stream partial responses into `chat-interface.tsx`.

### 4. WebSocket UX & Resilience
- Surface loading/streaming state in the chat UI; render incremental tokens as they arrive.
- Send lightweight heartbeats from the client when idle so the tunnel stays warm; handle keepalive frames from the server.
- Add error banners when the socket closes unexpectedly and offer a retry button that replays the last prompt.
- Log `requestId` and socket events for debugging (tie into the plan from `WEBSOCKET_SECURITY.md`).

### 5. Navigation & State Management
- Use Next.js router for navigation; ensure search pages have `useEffect` to hydrate forms when query params change.
- For combos or round trips, update the booking context to expect multiple itineraries (some of this is already handled by the new combo flow).
- Consider storing `searchIntent` in context so if a user cancels mid-search we can restore the prior state.

## Testing & Validation
1. Unit tests for serialization helpers (query param builder).
2. Cypress/Playwright flows:
   - Search for a hotel → booking review → “Book another flight” → redirected to flights with expected params.
   - Confirm AI prompt invocation opens chat with seeded context, streams tokens over WebSocket, and survives >100s interactions.
3. QA scenarios:
   - Ensure query params do not leak sensitive data.
   - Validate behaviour with partial combos (only hotel, only flight).
   - Confirm search forms correctly read defaults from URL and context.
   - Simulate network toggles to verify the WebSocket reconnect path.

## Rollout Considerations
- Initial release can focus on preserving search state and direct navigation. AI quick prompt can be toggled via feature flag if needed.
- Document new query params for analytics (helps understand reuse patterns).
- Update support docs to mention “Book another flight/hotel” functionality and AI helpers.
