import type { LatLng, Place } from "../types";
import { haversineMeters } from "./geo";

export const NH306: LatLng[] = [
  { lat: 24.6833, lng: 92.5667 },
  { lat: 24.6905, lng: 92.5736 },
  { lat: 24.6980, lng: 92.5850 },
  { lat: 24.7050, lng: 92.5960 },
  { lat: 24.7130, lng: 92.6080 },
  { lat: 24.7200, lng: 92.6185 },
  { lat: 24.7280, lng: 92.6280 },
  { lat: 24.7360, lng: 92.6390 },
  { lat: 24.7430, lng: 92.6480 },
  { lat: 24.7510, lng: 92.6595 },
  { lat: 24.7590, lng: 92.6710 },
  { lat: 24.7660, lng: 92.6820 },
  { lat: 24.7740, lng: 92.6930 },
  { lat: 24.7810, lng: 92.7050 },
  { lat: 24.7880, lng: 92.7160 },
  { lat: 24.7945, lng: 92.7265 },
  { lat: 24.8000, lng: 92.7370 },
  { lat: 24.8070, lng: 92.7465 },
  { lat: 24.8150, lng: 92.7550 },
  { lat: 24.8240, lng: 92.7670 },
  { lat: 24.8333, lng: 92.7789 },
];

export const BADARPUR_SPUR: LatLng[] = [
  { lat: 24.8333, lng: 92.7789 },
  { lat: 24.8380, lng: 92.7640 },
  { lat: 24.8430, lng: 92.7480 },
  { lat: 24.8470, lng: 92.7315 },
  { lat: 24.8520, lng: 92.7150 },
  { lat: 24.8555, lng: 92.6975 },
  { lat: 24.8580, lng: 92.6800 },
  { lat: 24.8605, lng: 92.6640 },
  { lat: 24.8630, lng: 92.6480 },
  { lat: 24.8636, lng: 92.5969 },
];

export const SONAI_SPUR: LatLng[] = [
  { lat: 24.8333, lng: 92.7789 },
  { lat: 24.8250, lng: 92.7865 },
  { lat: 24.8165, lng: 92.7930 },
  { lat: 24.8080, lng: 92.8000 },
  { lat: 24.7960, lng: 92.8090 },
  { lat: 24.7850, lng: 92.8180 },
  { lat: 24.7725, lng: 92.8260 },
  { lat: 24.7600, lng: 92.8320 },
  { lat: 24.7420, lng: 92.8350 },
  { lat: 24.7250, lng: 92.8367 },
];

export const ALL_CORRIDORS = [NH306, BADARPUR_SPUR, SONAI_SPUR] as const;

export const CORRIDOR_POINTS = [
  ...NH306,
  ...BADARPUR_SPUR.slice(1),
  ...SONAI_SPUR.slice(1),
];

export const PLACES: Place[] = [
  { id: "silchar", name: "Silchar", position: { lat: 24.8333, lng: 92.7789 } },
  { id: "hailakandi", name: "Hailakandi", position: { lat: 24.6833, lng: 92.5667 } },
  { id: "badarpur", name: "Badarpur", position: { lat: 24.8636, lng: 92.5969 } },
  { id: "sonai", name: "Sonai", position: { lat: 24.7250, lng: 92.8367 } },
  { id: "karimganj", name: "Karimganj", position: { lat: 24.8697, lng: 92.3542 } },
  { id: "lakhipur", name: "Lakhipur", position: { lat: 24.8000, lng: 93.0136 } },
  { id: "algapur", name: "Algapur", position: { lat: 24.7430, lng: 92.6480 } },
  { id: "dholai", name: "Dholai", position: { lat: 24.7600, lng: 92.6750 } },
  { id: "kalain", name: "Kalain", position: { lat: 24.8500, lng: 92.6000 } },
  { id: "udharbond", name: "Udharbond", position: { lat: 24.7950, lng: 92.7600 } },
];

export const CORRIDOR_TOWN_IDS = [
  "silchar", "hailakandi", "algapur", "dholai", "udharbond", "badarpur", "sonai",
];

export const DEFAULT_PLACE_ID = "silchar";

export function getPlace(id: string | null | undefined): Place | null {
  if (!id) return null;
  return PLACES.find((p) => p.id === id) ?? null;
}

export function nearestPlace(point: LatLng): Place {
  let best = PLACES[0];
  let bestDist = haversineMeters(point, best.position);
  for (let i = 1; i < PLACES.length; i++) {
    const d = haversineMeters(point, PLACES[i].position);
    if (d < bestDist) { bestDist = d; best = PLACES[i]; }
  }
  return best;
}
