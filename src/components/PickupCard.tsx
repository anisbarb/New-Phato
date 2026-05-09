import { motion, AnimatePresence } from "framer-motion";
import type { IncomingPickup } from "../lib/types";
import { getPlace } from "../lib/corridor";

interface Props {
  pickup: IncomingPickup | null;
  onAccept: (pickup: IncomingPickup) => void;
  onDecline: (pickup: IncomingPickup) => void;
}

export default function PickupCard({ pickup, onAccept, onDecline }: Props) {
  const destName = pickup?.passengerDestId
    ? getPlace(pickup.passengerDestId)?.name ?? "Unknown"
    : "No destination";

  return (
    <AnimatePresence>
      {pickup && (
        <motion.div
          className="phato-pickup-card"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", damping: 26, stiffness: 280 }}
        >
          <div className="phato-pickup-header">
            <div className="phato-pickup-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="7" r="4" /><path d="M12 14c-7 0-8 3-8 4h16c0-1-1-4-8-4z" />
              </svg>
            </div>
            <div className="phato-pickup-info">
              <span className="phato-pickup-label">Pickup Request</span>
              <span className="phato-pickup-dest">→ {destName}</span>
            </div>
          </div>
          <div className="phato-pickup-actions">
            <button className="phato-pickup-decline" onClick={() => onDecline(pickup)}>
              Decline
            </button>
            <button className="phato-pickup-accept" onClick={() => onAccept(pickup)}>
              Accept
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
