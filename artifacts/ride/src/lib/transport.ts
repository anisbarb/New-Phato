export const PHATO_CHANNEL = "phato_v1";
export const DRIVERS_LS_KEY = "phato_online_drivers";

export type DriverLocation = {
  id: string;
  lat: number;
  lng: number;
  headingDeg: number;
  seatsFree: number;
  seatsTotal: number;
  destinationId: string | null;
  updatedAt: number;
};

export function readDriversMap(): Record<string, DriverLocation> {
  try {
    return JSON.parse(localStorage.getItem(DRIVERS_LS_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function writeDriversMap(m: Record<string, DriverLocation>) {
  try {
    localStorage.setItem(DRIVERS_LS_KEY, JSON.stringify(m));
  } catch {}
}

export function getUserRole(): "passenger" | "driver" {
  return (localStorage.getItem("phato_user_role") as "passenger" | "driver") ?? "passenger";
}

export function setUserRole(role: "passenger" | "driver") {
  localStorage.setItem("phato_user_role", role);
  window.dispatchEvent(new Event("phato_role_changed"));
}

export function getOrCreateId(key: string): string {
  let id = localStorage.getItem(key);
  if (!id) {
    id = key + "_" + Math.random().toString(36).slice(2, 12);
    localStorage.setItem(key, id);
  }
  return id;
}
