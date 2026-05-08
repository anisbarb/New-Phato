import { useState, useCallback, useEffect } from "react";
import MapGL from "../components/Map";
import Sidebar from "../components/Sidebar";
import SeatCounter from "../components/SeatCounter";
import ChatTray from "../components/ChatTray";
import PickupCard from "../components/PickupCard";
import { useGeolocation } from "../hooks/useGeolocation";
import { useDriverBroadcast } from "../hooks/useDriverBroadcast";
import { useLocationBroadcast } from "../hooks/useLocationBroadcast";
import { useSimulatedPassengers } from "../hooks/useSimulatedPassengers";
import { useIncomingPickups } from "../hooks/useIncomingPickups";
import { useChat } from "../hooks/useChat";
import { getOrCreateId, setUserRole } from "../lib/transport";
import { bearingDeg } from "../lib/geometry";
import { DEFAULT_CENTER } from "../lib/geo";
import type { IncomingPickup, Destination } from "../lib/types";
import { getPlace } from "../lib/corridor";

interface Props {
  onBackToPassenger: () => void;
}

export default function Driver({ onBackToPassenger }: Props) {
  const driverId = getOrCreateId("phato_driver_id");
  const { position: geoPosition } = useGeolocation();
  const userPosition = geoPosition ?? DEFAULT_CENTER;

  const [online, setOnline] = useState(true);
  const [seatsFree, setSeatsFree] = useState(4);
  const [seatsTotal] = useState(6);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPartnerId, setChatPartnerId] = useState<string | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);

  const headingDeg =
    geoPosition && destination ? bearingDeg(geoPosition, destination.position) : 0;

  const { messages, handleMessage: handleChatMsg, sendMessage } = useChat(driverId, "driver");
  const { incoming, handleMessage: handlePickupMsg, dismiss } = useIncomingPickups(driverId);

  const handleMessage = useCallback(
    (msg: unknown) => { handlePickupMsg(msg); handleChatMsg(msg); },
    [handlePickupMsg, handleChatMsg],
  );

  const { send: bcastSend } = useDriverBroadcast({
    active: online,
    driverId,
    position: userPosition,
    headingDeg,
    seatsFree,
    seatsTotal,
    destinationId: destination?.placeId ?? null,
    onMessage: handleMessage,
  });

  useLocationBroadcast({
    active: online,
    driverId,
    position: userPosition,
    headingDeg,
    seatsFree,
    seatsTotal,
    destinationId: destination?.placeId ?? null,
    onMessage: handleMessage,
  });

  const passengers = useSimulatedPassengers(userPosition, online, 10);

  const handleAccept = (pickup: IncomingPickup) => {
    bcastSend({
      type: "pickup_response",
      requestId: pickup.requestId,
      driverId,
      passengerId: pickup.passengerId,
      accepted: true,
    });
    setChatPartnerId(pickup.passengerId);
    setChatOpen(true);
    dismiss();
  };

  const handleDecline = (pickup: IncomingPickup) => {
    bcastSend({
      type: "pickup_response",
      requestId: pickup.requestId,
      driverId,
      passengerId: pickup.passengerId,
      accepted: false,
    });
    dismiss();
  };

  const handleBackToPassenger = () => {
    setSidebarOpen(false);
    setUserRole("passenger");
    onBackToPassenger();
  };

  useEffect(() => {
    const places = ["silchar", "hailakandi", "algapur", "dholai"];
    const pick = places[Math.floor(Math.random() * places.length)];
    const place = getPlace(pick);
    if (place) setDestination({ name: place.name, position: place.position, placeId: place.id });
  }, []);

  return (
    <div className="phato-screen">
      <MapGL
        center={userPosition}
        passengers={passengers}
        destination={destination?.position ?? null}
      />

      <div className="phato-driver-hud">
        <button
          className={`phato-online-toggle ${online ? "online" : "offline"}`}
          onClick={() => setOnline((v) => !v)}
        >
          <span className="phato-online-dot" />
          {online ? "Online" : "Offline"}
        </button>

        <button className="phato-hud-icon-btn" onClick={() => setSidebarOpen(true)} aria-label="Menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
      </div>

      {online && (
        <div className="phato-driver-panel">
          <div className="phato-driver-panel-row">
            <div className="phato-driver-label">
              <span className="phato-driver-label-main">Seats available</span>
              <span className="phato-driver-label-sub">Tap to adjust</span>
            </div>
            <SeatCounter value={seatsFree} max={seatsTotal} onChange={setSeatsFree} />
          </div>

          {destination && (
            <div className="phato-driver-destination">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M20 10c0 6-8 13-8 13S4 16 4 10a8 8 0 1 1 16 0z" />
                <circle cx="12" cy="10" r="2" fill="currentColor" />
              </svg>
              <span>Heading to {destination.name}</span>
            </div>
          )}

          {messages.length > 0 && (
            <button className="phato-driver-chat-btn" onClick={() => setChatOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Chat ({messages.length})
            </button>
          )}
        </div>
      )}

      <PickupCard pickup={incoming} onAccept={handleAccept} onDecline={handleDecline} />

      <ChatTray
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={messages}
        onSend={(text) => { if (chatPartnerId) sendMessage(bcastSend, chatPartnerId, text); }}
        toName="Passenger"
      />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        role="driver"
        onBecomeDriver={() => {}}
        onBackToPassenger={handleBackToPassenger}
      />
    </div>
  );
}
