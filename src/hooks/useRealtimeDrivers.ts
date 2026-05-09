import { useEffect, useRef, useState } from "react";
import type { DriverLocation } from "../lib/transport";

export function useRealtimeDrivers(): DriverLocation[] {
  const [drivers, setDrivers] = useState<DriverLocation[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    const url = `${proto}//${window.location.host}/api/ws/location`;
    let closed = false;

    function connect() {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "subscribe_passengers" }));
      };
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data as string);
          if (msg.type === "driver_update") {
            setDrivers(msg.drivers as DriverLocation[]);
          }
        } catch {}
      };
      ws.onclose = () => {
        wsRef.current = null;
        if (!closed) setTimeout(connect, 3000);
      };
      ws.onerror = () => { ws.close(); };
    }

    connect();
    return () => {
      closed = true;
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, []);

  return drivers;
}
