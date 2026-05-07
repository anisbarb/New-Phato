import type { LatLng, Vehicle, PassengerRequest, Destination, RouteConfidence } from "../types";
import { haversineMeters } from "./geo";
import { bearingDeg, bearingDiff, pointToPolylineDist } from "./geometry";

const CORRIDOR_M = 150;
const HEADING_TOL = 45;
const MAX_MARKERS = 30;

export type MatchedVehicle = Vehicle & {
  distanceM: number;
  corridorDistM: number;
  etaMinutes: number;
  confidence: RouteConfidence;
};

export type MatchedPassenger = PassengerRequest & {
  distanceM: number;
  corridorDistM: number;
  etaMinutes: number;
  confidence: RouteConfidence;
};

function confidenceFor(d: number): RouteConfidence {
  if (d <= 50) return "on";
  if (d <= CORRIDOR_M) return "near";
  return "off";
}

function etaMin(distM: number, speedMps: number): number {
  return Math.max(1, Math.round(distM / Math.max(speedMps, 4) / 60));
}

function sortKey(confidence: RouteConfidence): number {
  return confidence === "on" ? 0 : confidence === "near" ? 1 : 2;
}

export function matchVehicles({
  origin,
  destination,
  vehicles,
  radiusM,
}: {
  origin: LatLng | null;
  destination: Destination | null;
  vehicles: Vehicle[];
  radiusM: number;
}): MatchedVehicle[] {
  if (!origin || !destination) return [];
  const userHeading = bearingDeg(origin, destination.position);
  const matches: MatchedVehicle[] = [];

  for (const v of vehicles) {
    if (v.status === "offline") continue;
    const distanceM = haversineMeters(origin, v.position);
    if (distanceM > radiusM) continue;
    const corridorDistM = pointToPolylineDist(origin, v.routeCoords);
    if (corridorDistM > CORRIDOR_M) continue;
    if (bearingDiff(userHeading, v.headingDeg) > HEADING_TOL) continue;
    matches.push({
      ...v,
      distanceM,
      corridorDistM,
      etaMinutes: etaMin(distanceM, v.speedMps),
      confidence: confidenceFor(corridorDistM),
    });
  }

  return matches
    .sort((a, b) =>
      sortKey(a.confidence) - sortKey(b.confidence) ||
      a.distanceM - b.distanceM,
    )
    .slice(0, MAX_MARKERS);
}

export function matchPassengers({
  origin,
  destination,
  passengers,
  radiusM,
}: {
  origin: LatLng | null;
  destination: Destination | null;
  passengers: PassengerRequest[];
  radiusM: number;
}): MatchedPassenger[] {
  if (!origin || !destination) return [];
  const driverHeading = bearingDeg(origin, destination.position);
  const matches: MatchedPassenger[] = [];

  for (const p of passengers) {
    if (p.status === "inactive" || p.status === "offline") continue;
    const distanceM = haversineMeters(origin, p.position);
    if (distanceM > radiusM) continue;
    const corridorDistM = pointToPolylineDist(p.position, [
      origin,
      destination.position,
    ]);
    if (corridorDistM > CORRIDOR_M) continue;
    if (bearingDiff(driverHeading, p.headingDeg) > HEADING_TOL) continue;
    matches.push({
      ...p,
      distanceM,
      corridorDistM,
      etaMinutes: etaMin(distanceM, 6),
      confidence: confidenceFor(corridorDistM),
    });
  }

  return matches
    .sort((a, b) =>
      sortKey(a.confidence) - sortKey(b.confidence) ||
      a.distanceM - b.distanceM,
    )
    .slice(0, MAX_MARKERS);
}
