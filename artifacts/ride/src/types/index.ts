export type LatLng = { lat: number; lng: number };

export type Place = { id: string; name: string; position: LatLng };

export type Destination = {
  name: string;
  position: LatLng;
  placeId?: string;
  isCustom?: boolean;
};

export type LiveStatus = "moving" | "waiting" | "offline" | "inactive";
export type RouteConfidence = "on" | "near" | "off";

export type RouteResult = {
  coordinates: LatLng[];
  distanceMeters: number;
  durationSeconds: number;
};

export type UserRole = "passenger" | "driver";

export type Vehicle = {
  id: string;
  label: string;
  position: LatLng;
  trail: LatLng[];
  destinationId: string;
  routeCoords: LatLng[];
  headingDeg: number;
  speedMps: number;
  seatsTotal: number;
  seatsFilled: number;
  status: LiveStatus;
  lastUpdated: number;
};

export type PassengerRequest = {
  id: string;
  position: LatLng;
  destinationId: string;
  routeCoords: LatLng[];
  headingDeg: number;
  status: LiveStatus;
  waitMinutes: number;
  lastUpdated: number;
};

export type ChatMessage = {
  chatId: string;
  fromId: string;
  toId: string;
  role: "driver" | "passenger";
  text: string;
  sentAt: number;
  fromSelf: boolean;
};

export type IncomingPickup = {
  requestId: string;
  passengerId: string;
  passengerLat: number;
  passengerLng: number;
  passengerDestId: string | null;
  sentAt: number;
};

export type PickupStatus = "idle" | "pending" | "accepted" | "declined" | "unreachable";

export type PickupRequestState = {
  status: PickupStatus;
  requestId: string | null;
  driverId: string | null;
};

export function isValidLatLng(v: unknown): v is LatLng {
  if (!v || typeof v !== "object") return false;
  const c = v as Partial<LatLng>;
  return (
    typeof c.lat === "number" &&
    typeof c.lng === "number" &&
    Number.isFinite(c.lat) &&
    Number.isFinite(c.lng) &&
    c.lat >= -90 &&
    c.lat <= 90 &&
    c.lng >= -180 &&
    c.lng <= 180
  );
}
