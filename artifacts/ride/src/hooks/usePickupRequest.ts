import { useCallback, useEffect, useRef, useState } from "react";
import {
  PHATO_CHANNEL,
  readDriversMap,
} from "../services/transport";
import type { DriverLocation } from "../services/transport";
import type { PickupStatus, PickupRequestState } from "../types";

type Opts = {
  passengerId: string;
  onDriverUpdate: (drivers: DriverLocation[]) => void;
  onChatMessage?: (msg: unknown) => void;
};

export function usePickupRequest({ passengerId, onDriverUpdate, onChatMessage }: Opts) {
  const [state, setState] = useState<PickupRequestState>({
    status: "idle",
    requestId: null,
    driverId: null,
  });
  const stateRef = useRef(state);
  stateRef.current = state;
  const chRef = useRef<BroadcastChannel | null>(null);
  const driversRef = useRef<Record<string, DriverLocation>>(readDriversMap());
  const onDriverUpdateRef = useRef(onDriverUpdate);
  onDriverUpdateRef.current = onDriverUpdate;
  const onChatRef = useRef(onChatMessage);
  onChatRef.current = onChatMessage;

  useEffect(() => {
    driversRef.current = readDriversMap();
    onDriverUpdateRef.current(Object.values(driversRef.current));

    const ch = new BroadcastChannel(PHATO_CHANNEL);
    chRef.current = ch;

    ch.onmessage = ({ data }: MessageEvent) => {
      if (!data || typeof data !== "object") return;
      const m = data as Record<string, unknown>;

      if (m["type"] === "driver_location") {
        const loc = m as unknown as DriverLocation;
        driversRef.current[loc.id] = loc;
        onDriverUpdateRef.current(Object.values(driversRef.current));
      }

      if (m["type"] === "driver_offline") {
        delete driversRef.current[m["id"] as string];
        onDriverUpdateRef.current(Object.values(driversRef.current));
      }

      if (
        m["type"] === "pickup_response" &&
        (m["requestId"] as string) === stateRef.current.requestId
      ) {
        setState({
          status: (m["accepted"] as boolean) ? "accepted" : "declined",
          requestId: m["requestId"] as string,
          driverId: m["driverId"] as string,
        });
      }

      if (m["type"] === "chat_message" && m["toId"] === passengerId) {
        onChatRef.current?.(data);
      }
    };

    const poll = setInterval(() => {
      const fresh = readDriversMap();
      const now = Date.now();
      for (const k of Object.keys(fresh)) {
        if (now - fresh[k].updatedAt > 10_000) delete fresh[k];
      }
      driversRef.current = fresh;
      onDriverUpdateRef.current(Object.values(fresh));
    }, 4000);

    return () => { ch.close(); chRef.current = null; clearInterval(poll); };
  }, [passengerId]);

  const sendRequest = useCallback(
    (opts: {
      driverId: string;
      passengerLat: number;
      passengerLng: number;
      passengerDestId: string | null;
    }) => {
      const ch = chRef.current;
      if (!ch) {
        setState({ status: "unreachable", requestId: null, driverId: opts.driverId });
        return;
      }
      const requestId = "req-" + Math.random().toString(36).slice(2, 10);
      setState({ status: "pending", requestId, driverId: opts.driverId });
      ch.postMessage({
        type: "pickup_request",
        requestId,
        passengerId,
        ...opts,
        sentAt: Date.now(),
      });
    },
    [passengerId],
  );

  const reset = useCallback(
    () => setState({ status: "idle", requestId: null, driverId: null }),
    [],
  );

  const sendChat = useCallback(
    (toId: string, text: string) => {
      if (!text.trim()) return;
      chRef.current?.postMessage({
        type: "chat_message",
        chatId: "chat-" + Math.random().toString(36).slice(2, 10),
        fromId: passengerId,
        toId,
        role: "passenger",
        text: text.trim(),
        sentAt: Date.now(),
      });
    },
    [passengerId],
  );

  return { state, sendRequest, reset, chRef, sendChat };
}
