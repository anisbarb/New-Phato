import L from "leaflet";
import type { LiveStatus } from "../types";

const CAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1L2 11v5h3"/><circle cx="6.5" cy="16.5" r="2.5"/><circle cx="16.5" cy="16.5" r="2.5"/></svg>`;

const PERSON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7" r="4"/><path d="M12 14c-7 0-8 3-8 4h16c0-1-1-4-8-4z"/></svg>`;

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] ?? c),
  );
}

export const userPulseIcon = L.divIcon({
  className: "",
  html: `<div class="phato-user-dot"><div class="phato-user-pulse"></div></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export const destinationPinIcon = L.divIcon({
  className: "",
  html: `<div class="phato-dest-pin"></div>`,
  iconSize: [20, 28],
  iconAnchor: [10, 28],
});

export function vehicleMarkerIcon(opts: {
  label: string;
  status: LiveStatus;
  seatsFree: number;
  seatsTotal: number;
  headingDeg?: number;
}): L.DivIcon {
  const seatsFree = Math.max(0, opts.seatsFree);
  const isFull = seatsFree === 0;
  const isMoving = opts.status === "moving";

  const badge = isFull
    ? `<span class="phato-veh-badge full">FULL</span>`
    : `<span class="phato-veh-badge">${seatsFree}</span>`;

  const arrow =
    isMoving && opts.headingDeg !== undefined
      ? `<div class="phato-veh-arrow" style="transform:rotate(${opts.headingDeg}deg)">▲</div>`
      : "";

  const html = `
    <div class="phato-veh-wrap ${isMoving ? "moving" : ""}">
      ${arrow}
      <div class="phato-veh-body">
        ${CAR_SVG}
        ${badge}
      </div>
    </div>`;

  return L.divIcon({
    className: "",
    html,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

export function passengerMarkerIcon(status: LiveStatus): L.DivIcon {
  const color = status === "waiting" ? "#000" : "#666";
  return L.divIcon({
    className: "",
    html: `<div class="phato-pax-dot" style="background:${color}">${PERSON_SVG}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}
