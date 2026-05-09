import type { LatLng } from "./types";
import { haversineMeters } from "./geo";

export function bearingDeg(a: LatLng, b: LatLng): number {
  const toRad = (n: number) => (n * Math.PI) / 180;
  const toDeg = (n: number) => (n * 180) / Math.PI;
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const dLng = toRad(b.lng - a.lng);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

export function bearingDiff(a: number, b: number): number {
  return Math.abs(((a - b) % 360 + 540) % 360 - 180);
}

const DEG_PER_M_LAT = 1 / 111320;
function degPerMLng(lat: number) {
  return 1 / (111320 * Math.cos((lat * Math.PI) / 180));
}

function projectLocal(p: LatLng, origin: LatLng): { x: number; y: number } {
  return {
    x: (p.lng - origin.lng) / degPerMLng(origin.lat),
    y: (p.lat - origin.lat) / DEG_PER_M_LAT,
  };
}

function ptToSegment(p: LatLng, a: LatLng, b: LatLng): number {
  const P = projectLocal(p, a);
  const B = projectLocal(b, a);
  const len2 = B.x * B.x + B.y * B.y;
  if (len2 === 0) return Math.hypot(P.x, P.y);
  const t = Math.max(0, Math.min(1, (P.x * B.x + P.y * B.y) / len2));
  return Math.hypot(P.x - t * B.x, P.y - t * B.y);
}

export function pointToPolylineDist(p: LatLng, line: LatLng[]): number {
  if (!line?.length) return Infinity;
  if (line.length === 1) return haversineMeters(p, line[0]);
  let best = Infinity;
  for (let i = 0; i < line.length - 1; i++) {
    const d = ptToSegment(p, line[i], line[i + 1]);
    if (d < best) best = d;
  }
  return best;
}
