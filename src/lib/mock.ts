import { PLACES, CORRIDOR_POINTS, CORRIDOR_TOWN_IDS } from "./corridor";
import { bearingDeg } from "./geometry";
import { haversineMeters } from "./geo";
import type { LatLng, Vehicle, PassengerRequest } from "./types";

const PREFIXES = ["AS-11", "AS-10", "AS-01", "AS-24", "AS-03", "AS-07"];

function pseudoRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

function vehicleLabel(rand: () => number): string {
  const prefix = PREFIXES[Math.floor(rand() * PREFIXES.length)];
  const num = String(1000 + Math.floor(rand() * 8999));
  return `Auto ${prefix} ${num}`;
}

function corridorStart(rand: () => number): LatLng {
  const pt = CORRIDOR_POINTS[Math.floor(rand() * CORRIDOR_POINTS.length)];
  return {
    lat: pt.lat + (rand() - 0.5) * 0.018,
    lng: pt.lng + (rand() - 0.5) * 0.018,
  };
}

export function generateVehicles(center: LatLng, count = 16, seed = 7): Vehicle[] {
  const rand = pseudoRandom(seed);
  const corridorPlaces = PLACES.filter((p) => CORRIDOR_TOWN_IDS.includes(p.id));
  const now = Date.now();

  return Array.from({ length: count }, (_, i) => {
    const dest = corridorPlaces[Math.floor(rand() * corridorPlaces.length)];
    const position = corridorStart(rand);
    const distToDest = haversineMeters(position, dest.position);
    const speedMps = distToDest > 300 ? 6 + rand() * 5 : 0.5 + rand() * 0.5;
    const seatsTotal = 6;
    const seatsFilled = Math.floor(rand() * 6);

    return {
      id: `veh_${i}_${(rand() * 1e6).toFixed(0)}`,
      label: vehicleLabel(rand),
      position,
      trail: [position],
      destinationId: dest.id,
      routeCoords: [position, dest.position],
      headingDeg: bearingDeg(position, dest.position),
      speedMps,
      seatsTotal,
      seatsFilled,
      status: (speedMps > 1 ? "moving" : "waiting") as "moving" | "waiting",
      lastUpdated: now - Math.floor(rand() * 3000),
    };
  });
}

function placeNear(center: LatLng, rand: () => number, radiusKm: number): LatLng {
  const r = (rand() * radiusKm) / 111;
  const a = rand() * Math.PI * 2;
  return { lat: center.lat + r * Math.cos(a), lng: center.lng + r * Math.sin(a) };
}

export function generatePassengers(center: LatLng, count = 10, seed = 41): PassengerRequest[] {
  const rand = pseudoRandom(seed);
  const now = Date.now();
  return Array.from({ length: count }, (_, i) => {
    const dest = PLACES[Math.floor(rand() * PLACES.length)];
    const position = placeNear(center, rand, 3);
    return {
      id: `pax_${i}_${Math.floor(rand() * 1e6)}`,
      position,
      destinationId: dest.id,
      routeCoords: [position, dest.position],
      headingDeg: bearingDeg(position, dest.position),
      status: "waiting" as const,
      waitMinutes: Math.max(1, Math.round(rand() * 9) + 1),
      lastUpdated: now,
    };
  });
}
