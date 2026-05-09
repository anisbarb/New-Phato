import { useState, useCallback, useEffect, useRef } from "react";
import MapGL from "../components/Map";
import SearchBar from "../components/SearchBar";
import Sidebar from "../components/Sidebar";
import Sheet from "../components/Sheet";
import ChatTray from "../components/ChatTray";
import { useGeolocation } from "../hooks/useGeolocation";
import { useSimulatedVehicles } from "../hooks/useSimulatedVehicles";
import { usePickupRequest } from "../hooks/usePickupRequest";
import { useChat } from "../hooks/useChat";
import { getOrCreateId, setUserRole } from "../lib/transport";
import { fetchRoute } from "../lib/routing";
import { DEFAULT_CENTER } from "../lib/geo";
import type { Destination, Vehicle, RouteResult } from "../lib/types";

interface Props {
  onBecomeDriver: () => void;
}

export default function Passenger({ onBecomeDriver }: Props) {
  const passengerId = getOrCreateId("phato_passenger_id");
  const { position: geoPosition } = useGeolocation();
  const userPosition = geoPosition ?? DEFAULT_CENTER;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [chatOpen, setChatOpen] = useState(false);

  const vehicles = useSimulatedVehicles(userPosition, 16);
  const { messages, handleMessage, sendMessage } = useChat(passengerId, "passenger");

  const { state: pickupState, sendRequest, reset: resetPickup, sendChat } = usePickupRequest({
    passengerId,
    onDriverUpdate: useCallback(() => {}, []),
    onChatMessage: handleMessage,
  });

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!destination || !userPosition) { setRoute(null); return; }
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    fetchRoute(userPosition, destination.position, ctrl.signal).then((r) => {
      if (!ctrl.signal.aborted) setRoute(r);
    });
    return () => ctrl.abort();
  }, [destination, userPosition]);

  const handleDestinationSelect = (dest: Destination) => {
    setDestination(dest);
    setSelectedVehicle(null);
    resetPickup();
  };

  const handleVehicleClick = (v: Vehicle) => {
    if (pickupState.status !== "idle") return;
    setSelectedVehicle(v);
  };

  const handleRequestPickup = () => {
    if (!selectedVehicle || !userPosition) return;
    sendRequest({
      driverId: selectedVehicle.id,
      passengerLat: userPosition.lat,
      passengerLng: userPosition.lng,
      passengerDestId: destination?.placeId ?? null,
    });
  };

  const handleBecomeDriver = () => {
    setSidebarOpen(false);
    setUserRole("driver");
    onBecomeDriver();
  };

  const seatsFree = selectedVehicle ? selectedVehicle.seatsTotal - selectedVehicle.seatsFilled : 0;

  const statusLabel =
    pickupState.status === "pending" ? "Waiting for driver response…" :
    pickupState.status === "accepted" ? "Driver accepted! Get ready." :
    pickupState.status === "declined" ? "Driver declined. Try another." :
    pickupState.status === "unreachable" ? "Could not reach driver." : null;

  return (
    <div className="phato-screen">
      <MapGL
        center={userPosition}
        vehicles={vehicles}
        onVehicleClick={handleVehicleClick}
        route={route}
        destination={destination?.position ?? null}
      />

      <div className="phato-overlay-top">
        <SearchBar
          onDestinationSelect={handleDestinationSelect}
          onMenuOpen={() => setSidebarOpen(true)}
          selectedDestination={destination}
          onClear={() => {
            setDestination(null);
            setRoute(null);
            setSelectedVehicle(null);
            resetPickup();
          }}
        />
      </div>

      {statusLabel && (
        <div className="phato-status-banner">
          <span>{statusLabel}</span>
          {(pickupState.status === "accepted" || pickupState.status === "declined" || pickupState.status === "unreachable") && (
            <button className="phato-status-dismiss" onClick={resetPickup}>Dismiss</button>
          )}
          {pickupState.status === "accepted" && (
            <button className="phato-chat-trigger" onClick={() => setChatOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Chat
            </button>
          )}
        </div>
      )}

      <Sheet
        open={!!selectedVehicle && pickupState.status === "idle"}
        onClose={() => setSelectedVehicle(null)}
        title={selectedVehicle?.label}
      >
        <div className="phato-vehicle-sheet">
          <div className="phato-vehicle-stats">
            <div className="phato-stat">
              <span className="phato-stat-value">{seatsFree}</span>
              <span className="phato-stat-label">Seats free</span>
            </div>
            <div className="phato-stat-divider" />
            <div className="phato-stat">
              <span className="phato-stat-value">{selectedVehicle?.status === "moving" ? "Moving" : "Waiting"}</span>
              <span className="phato-stat-label">Status</span>
            </div>
          </div>
          {destination ? (
            <button className="phato-request-btn" onClick={handleRequestPickup} disabled={seatsFree === 0}>
              {seatsFree === 0 ? "Auto is full" : "Request Pickup"}
            </button>
          ) : (
            <p className="phato-sheet-hint">Set a destination to request a pickup</p>
          )}
        </div>
      </Sheet>

      <ChatTray
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={messages}
        onSend={(text) => {
          if (pickupState.driverId) {
            sendMessage((msg) => sendChat(pickupState.driverId!, (msg as { text: string }).text), pickupState.driverId, text);
            sendChat(pickupState.driverId, text);
          }
        }}
        toName="Driver"
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role="passenger"
        onBecomeDriver={handleBecomeDriver}
        onBackToPassenger={() => {}}
      />
    </div>
  );
}
