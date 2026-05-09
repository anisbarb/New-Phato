import { useCallback, useEffect, useRef } from "react";
import {
  PHATO_CHANNEL,
  readDriversMap,
  writeDriversMap,
} from "../lib/transport";
import type { DriverLocation } from "../lib/transport";
import type { LatLng } from "../lib/types";

type Opts = {
  active: boolean;
  driverId: string;
  position: LatLng | null;
  headingDeg: number;
  seatsFree: number;
  seatsTotal: number;
  destinationId: string | null;
  onMessage?: (msg: unknown) => void;
};

export function useDriverBroadcast({
  active,
  driverId,
  position,
  headingDeg,
  seatsFree,
  seatsTotal,
  destinationId,
  onMessage,
}: Opts) {
  const chRef = useRef<BroadcastChannel | null>(null);
  const posRef = useRef({ position, headingDeg, seatsFree, seatsTotal, destinationId });
  posRef.current = { position, headingDeg, seatsFree, seatsTotal, destinationId };
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  useEffect(() => {
    const ch = new BroadcastChannel(PHATO_CHANNEL);
    chRef.current = ch;
    ch.onmessage = ({ data }: MessageEvent) => {
      if (!data || typeof data !== "object") return;
      const m = data as Record<string, unknown>;
      if (
        (m["type"] === "pickup_request" && m["driverId"] === driverId) ||
        (m["type"] === "chat_message" && m["toId"] === driverId)
      ) {
        onMessageRef.current?.(data);
      }
    };
    return () => { ch.close(); chRef.current = null; };
  }, [driverId]);

  useEffect(() => {
    if (!active) {
      const map = readDriversMap();
      delete map[driverId];
      writeDriversMap(map);
      chRef.current?.postMessage({ type: "driver_offline", id: driverId });
      return;
    }

    const tick = () => {
      const { position: pos, headingDeg: hd, seatsFree: sf, seatsTotal: st, destinationId: did } =
        posRef.current;
      if (!pos) return;
      const loc: DriverLocation = {
        id: driverId,
        lat: pos.lat,
        lng: pos.lng,
        headingDeg: hd,
        seatsFree: sf,
        seatsTotal: st,
        destinationId: did,
        updatedAt: Date.now(),
      };
      const map = readDriversMap();
      map[driverId] = loc;
      writeDriversMap(map);
      chRef.current?.postMessage({ type: "driver_location", ...loc });
    };

    tick();
    const id = setInterval(tick, 2000);
    return () => {
      clearInterval(id);
      const map = readDriversMap();
      delete map[driverId];
      writeDriversMap(map);
      chRef.current?.postMessage({ type: "driver_offline", id: driverId });
    };
  }, [active, driverId]);

  const send = useCallback(
    (msg: object) => { chRef.current?.postMessage(msg); },
    [],
  );

  return { send };
}
