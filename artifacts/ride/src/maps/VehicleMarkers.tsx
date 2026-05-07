import { Marker, Tooltip } from "react-leaflet";
import { vehicleMarkerIcon, passengerMarkerIcon } from "./mapIcons";
import type { Vehicle, PassengerRequest } from "../types";

type VehicleMarkersProps = {
  vehicles: Vehicle[];
  onVehicleClick?: (v: Vehicle) => void;
};

export function VehicleMarkers({ vehicles, onVehicleClick }: VehicleMarkersProps) {
  return (
    <>
      {vehicles.map((v) => (
        <Marker
          key={v.id}
          position={[v.position.lat, v.position.lng]}
          icon={vehicleMarkerIcon({
            label: v.label,
            status: v.status,
            seatsFree: v.seatsTotal - v.seatsFilled,
            seatsTotal: v.seatsTotal,
            headingDeg: v.headingDeg,
          })}
          eventHandlers={{
            click: () => onVehicleClick?.(v),
          }}
        >
          <Tooltip direction="top" offset={[0, -20]} opacity={1} className="phato-tooltip">
            <span className="phato-tooltip-label">{v.label}</span>
            <span className="phato-tooltip-seats">
              {v.seatsTotal - v.seatsFilled}/{v.seatsTotal} seats
            </span>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}

type PassengerMarkersProps = {
  passengers: PassengerRequest[];
  onPassengerClick?: (p: PassengerRequest) => void;
};

export function PassengerMarkers({ passengers, onPassengerClick }: PassengerMarkersProps) {
  return (
    <>
      {passengers.map((p) => (
        <Marker
          key={p.id}
          position={[p.position.lat, p.position.lng]}
          icon={passengerMarkerIcon(p.status)}
          eventHandlers={{ click: () => onPassengerClick?.(p) }}
        >
          <Tooltip direction="top" offset={[0, -12]} opacity={1} className="phato-tooltip">
            <span className="phato-tooltip-label">Waiting {p.waitMinutes} min</span>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
}
