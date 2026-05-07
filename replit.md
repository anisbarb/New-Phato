# Phato — Live Corridor Ride-Share App

React + Vite ride-hailing app for Assam corridors (Hailakandi–Silchar), backed by a shared Express API + PostgreSQL.

## Run & Operate

- Workflows manage all services — do NOT run `pnpm dev` at workspace root
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.x
- Frontend: React 19 + Vite 6, Tailwind CSS v4, framer-motion
- API: Express 5 + WebSocket (ws) for real-time ride tracking
- DB: PostgreSQL + Drizzle ORM (`lib/db/`)
- Maps: Leaflet + react-leaflet

## Where things live

- `artifacts/ride/` — Phato Ride-Share frontend (`@workspace/ride`, port 5000)
- `artifacts/api-server/` — Shared Express backend (`@workspace/api-server`, port 8080)
- `lib/db/src/schema/` — Drizzle DB schema

## Folder structure inside `artifacts/ride/src/`

```
app/           App.tsx — root with splash + role routing
components/    SearchBar, Sidebar, BottomSheet, ChatTray, PickupCard, SeatCounter, SplashScreen
hooks/         useGeolocation, useRealtimeDrivers, useLocationBroadcast, useDriverBroadcast,
               usePickupRequest, useIncomingPickups, useChat, useSimulatedVehicles, useSimulatedPassengers
maps/          MapView, VehicleMarkers, RoutePolyline, mapIcons
screens/       PassengerScreen, DriverScreen
services/      transport.ts — BroadcastChannel constants, localStorage helpers, role management
types/         index.ts — all shared types
utils/         geo.ts, geometry.ts, corridor.ts, matching.ts, routing.ts, mock.ts
index.css      Global styles — pure B&W design system + map marker CSS
main.tsx       React entry point
```

## Architecture decisions

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

- `L.control()` factory not callable in TypeScript — use `L.Control.extend()` + `new`
- WebSocket endpoint is at `/api/ws/location` — handled in `artifacts/api-server/src/index.ts`
- Port conflicts: if port 8080 conflicts, kill stale PID via `/proc/[pid]/fd`
- `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` are unused (Supabase removed)
- All user prefs stored in localStorage: `phato_user_role`, `phato_passenger_id`, `phato_driver_id`

## User preferences

_Populate as you learn them._
