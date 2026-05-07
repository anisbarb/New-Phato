import { useCallback, useState } from "react";
import type { IncomingPickup } from "../types";

export function useIncomingPickups(driverId: string) {
  const [incoming, setIncoming] = useState<IncomingPickup | null>(null);

  const handleMessage = useCallback(
    (msg: unknown) => {
      const m = msg as Record<string, unknown>;
      if (m["type"] === "pickup_request" && m["driverId"] === driverId) {
        setIncoming({
          requestId: m["requestId"] as string,
          passengerId: m["passengerId"] as string,
          passengerLat: m["passengerLat"] as number,
          passengerLng: m["passengerLng"] as number,
          passengerDestId: (m["passengerDestId"] as string | null) ?? null,
          sentAt: (m["sentAt"] as number) ?? Date.now(),
        });
      }
    },
    [driverId],
  );

  const dismiss = useCallback(() => setIncoming(null), []);

  return { incoming, handleMessage, dismiss };
}
