# Phato — Live Corridor Ride-Share App

React + Vite ride-hailing app for Assam corridors (Hailakandi–Silchar), backed by a shared Express API + PostgreSQL.

## Run & Operate

- Workflows manage all services — do NOT run `pnpm dev` at workspace root
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.x
- Frontend: React 19 + Vite 6, Tailwind CSS v4, framer-motion
- Map: **MapLibre GL JS v5** with 3D terrain (replaced Leaflet)
- API: Express 5 + WebSocket (ws) for real-time ride tracking
- DB: PostgreSQL + Drizzle ORM (`lib/db/`)

## Where things live

- `artifacts/ride/` — Phato Ride-Share frontend (`@workspace/ride`, port 5000)
- `artifacts/api-server/` — Shared Express backend (`@workspace/api-server`, port 8080)
- `lib/db/src/schema/` — Drizzle DB schema

## Folder structure inside `artifacts/ride/src/`

```
lib/           All shared types + utilities
  types.ts     All shared TypeScript types
  transport.ts BroadcastChannel constants, localStorage helpers, role management
  corridor.ts  NH306 / Badarpur / Sonai corridor polylines + PLACES list
  geo.ts       Geolocation, haversine, stepToward
  geometry.ts  Bearing, bearingDiff, pointToPolylineDist
  matching.ts  Vehicle/passenger corridor-matching logic
  mock.ts      Deterministic vehicle + passenger generators
  routing.ts   OSRM fetchRoute, formatDistance, formatDuration
hooks/
  useGeolocation.ts        GPS watch position
  useSimulatedVehicles.ts  Tick-based simulated autos
  useSimulatedPassengers.ts Simulated waiting passengers
  useChat.ts               Chat message state
  usePickupRequest.ts      Passenger→driver pickup flow
  useIncomingPickups.ts    Driver incoming pickup handler
  useDriverBroadcast.ts    BroadcastChannel driver location
  useLocationBroadcast.ts  WebSocket driver location broadcast
  useRealtimeDrivers.ts    WebSocket passenger listener
components/
  Map.tsx         MapLibre GL JS map (3D terrain, vehicle/pax markers, route line)
  SearchBar.tsx   Floating search bar with autocomplete
  Sidebar.tsx     Right-side slide-in menu
  Sheet.tsx       Generic bottom sheet (spring animation)
  ChatTray.tsx    Full-height chat panel
  PickupCard.tsx  Driver incoming pickup accept/decline card
  SeatCounter.tsx +/- seat counter
  Splash.tsx      Black-screen splash with animated dots
pages/
  Passenger.tsx  Main passenger screen
  Driver.tsx     Main driver screen
App.tsx          Root: splash → passenger/driver routing
main.tsx         React entry point
index.css        Pure B&W design system (no Leaflet CSS)
```

## Architecture decisions

- **Map**: MapLibre GL JS v5 with `https://tiles.openfreemap.org/styles/bright` style + `demotiles.maplibre.org` terrain DEM, pitch=45 for 3D
- Phato uses WebSocket (`/api/ws/location`) for real-time driver location broadcasting
- BroadcastChannel `phato_v1` for local tab communication (pickup requests, chat)
- `phato_online_drivers` localStorage key stores active driver positions
- Simulated passengers/vehicles client-side (no persistent ride data in DB)
- Role stored in `phato_user_role` localStorage — "passenger" (default) or "driver"
- `BASE_PATH` env var controls Vite base URL

## Product

- **Splash**: Black screen, white "Phato" + animated dots for 2.2s → auto-opens PassengerScreen
- **Passenger mode**: Map-first layout, floating search bar + hamburger (right), sidebar from right. Search destinations, tap auto markers to see info + request pickup, chat after acceptance.
- **Driver mode**: Online/offline toggle, seat counter, incoming pickup cards, chat. Switch via sidebar → Become a Driver.
- **Sidebar** (slides from right): Map, Trip History, Saved Places, Notifications, Settings, Help, About Phato, Become a Driver / Back to Passenger
- **Transport**: Corridor matching along NH306/Badarpur Spur/Sonai Spur. OSRM routing for route display. Heading + corridor distance filtering for matches.

## Design system

- Pure black (#000) and white (#fff) — no color accents
- DM Sans font throughout
- 16px base, 700 for headings, 600 for labels, 500 for body
- Rounded corners: 14–24px for sheets/cards, 12px for buttons
- Shadows: soft `rgba(0,0,0,0.10)` overlays

## Gotchas

- Component named `MapGL` (not `Map`) to avoid native JS `Map` collision inside `Map.tsx`
- MapLibre v5: `antialias` moved to `canvasContextAttributes: { antialias: true }`
- Native `Map<K,V>` instances in `Map.tsx` must use `new globalThis.Map()` to avoid confusion with the component
- WebSocket endpoint is at `/api/ws/location` — handled in `artifacts/api-server/src/index.ts`
- Port conflicts: if port 8080 conflicts, kill stale PID via `/proc/[pid]/fd`
- All user prefs stored in localStorage: `phato_user_role`, `phato_passenger_id`, `phato_driver_id`

## User preferences

_Populate as you learn them._
