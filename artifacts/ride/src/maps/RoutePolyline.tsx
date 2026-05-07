import { Marker, Polyline } from "react-leaflet";
import { destinationPinIcon, userPulseIcon } from "./mapIcons";
import type { LatLng, RouteResult } from "../types";

type RoutePolylineProps = {
  route: RouteResult | null;
  userPosition: LatLng | null;
  destination: LatLng | null;
};

export default function RoutePolyline({
  route,
  userPosition,
  destination,
}: RoutePolylineProps) {
  const coords = route?.coordinates ?? [];

  return (
    <>
      {coords.length >= 2 && (
        <>
          <Polyline
            positions={coords.map((c) => [c.lat, c.lng])}
            pathOptions={{
              color: "#000",
              weight: 4,
              opacity: 0.85,
              lineCap: "round",
              lineJoin: "round",
            }}
          />
          <Polyline
            positions={coords.map((c) => [c.lat, c.lng])}
            pathOptions={{
              color: "#fff",
              weight: 2,
              opacity: 0.4,
              lineCap: "round",
              lineJoin: "round",
              dashArray: "4 8",
            }}
          />
        </>
      )}

      {destination && (
        <Marker position={[destination.lat, destination.lng]} icon={destinationPinIcon} />
      )}

      {userPosition && (
        <Marker position={[userPosition.lat, userPosition.lng]} icon={userPulseIcon} />
      )}
    </>
  );
}
