import type { LatLng, RouteResult } from "../types";
import { isValidLatLng } from "../types";

const OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

export async function fetchRoute(
  from: LatLng,
  to: LatLng,
  signal?: AbortSignal,
): Promise<RouteResult | null> {
  if (!isValidLatLng(from) || !isValidLatLng(to)) return null;
  try {
    const res = await fetch(
      `${OSRM_URL}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`,
      { signal },
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.code !== "Ok") return null;
    const r = data?.routes?.[0];
    const rawCoords = r?.geometry?.coordinates as [number, number][] | undefined;
    if (!rawCoords || rawCoords.length < 2) return null;
    const coordinates: LatLng[] = rawCoords
      .map(([lng, lat]) => ({ lat, lng }))
      .filter(isValidLatLng);
    if (coordinates.length < 2) return null;
    return {
      coordinates,
      distanceMeters: Number(r.distance ?? 0),
      durationSeconds: Number(r.duration ?? 0),
    };
  } catch (err) {
    if ((err as { name?: string })?.name === "AbortError") return null;
    return null;
  }
}

export function formatDistance(meters: number): string {
  if (!Number.isFinite(meters)) return "";
  if (meters < 950) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  const mins = Math.max(1, Math.round(seconds / 60));
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} m`;
}
