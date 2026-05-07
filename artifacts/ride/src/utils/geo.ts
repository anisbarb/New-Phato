import type { LatLng } from "../types";

export const DEFAULT_CENTER: LatLng = { lat: 24.8333, lng: 92.7789 };

export type GeoErrorCode = "unsupported" | "denied" | "unavailable" | "timeout";
export type GeoError = { code: GeoErrorCode; message: string };

function mapPositionError(err: GeolocationPositionError): GeoError {
  if (err.code === err.PERMISSION_DENIED)
    return { code: "denied", message: "Location permission denied." };
  if (err.code === err.POSITION_UNAVAILABLE)
    return { code: "unavailable", message: "Location unavailable." };
  if (err.code === err.TIMEOUT)
    return { code: "timeout", message: "Location request timed out." };
  return { code: "unavailable", message: "Could not retrieve location." };
}

export function watchPosition(
  onPosition: (pos: LatLng) => void,
  onError: (err: GeoError) => void,
): () => void {
  if (!navigator?.geolocation) {
    onError({ code: "unsupported", message: "Geolocation not supported." });
    return () => {};
  }
  const id = navigator.geolocation.watchPosition(
    (pos) => onPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
    (err) => onError(mapPositionError(err)),
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 2000 },
  );
  return () => navigator.geolocation.clearWatch(id);
}

const R = 6371000;

export function haversineMeters(a: LatLng, b: LatLng): number {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat));
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function stepToward(from: LatLng, to: LatLng, meters: number): LatLng {
  const total = haversineMeters(from, to);
  if (total <= meters || total === 0) return to;
  const t = meters / total;
  return {
    lat: from.lat + (to.lat - from.lat) * t,
    lng: from.lng + (to.lng - from.lng) * t,
  };
}
