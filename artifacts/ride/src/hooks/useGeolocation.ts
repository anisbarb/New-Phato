import { useEffect, useState } from "react";
import { watchPosition } from "../utils/geo";
import type { GeoError } from "../utils/geo";
import type { LatLng } from "../types";

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
