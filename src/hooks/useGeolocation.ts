import { useEffect, useState } from "react";
import { watchPosition } from "../lib/geo";
import type { GeoError } from "../lib/geo";
import type { LatLng } from "../lib/types";

type GeoState = {
  position: LatLng | null;
  error: GeoError | null;
  ready: boolean;
};

export function useGeolocation(active = true): GeoState {
  const [state, setState] = useState<GeoState>({
    position: null,
    error: null,
    ready: false,
  });

  useEffect(() => {
    if (!active) return;
    return watchPosition(
      (pos) => setState({ position: pos, error: null, ready: true }),
      (err) =>
        setState((prev) => ({ position: prev.position, error: err, ready: true })),
    );
  }, [active]);

  return state;
}
