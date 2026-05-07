import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import type { LatLng } from "../types";
import { DEFAULT_CENTER } from "../utils/geo";
import L from "leaflet";

const TILE_URL =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const TILE_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>';

function MapControls({ center }: { center: LatLng }) {
  const map = useMap();

  useEffect(() => {
    const ZoomCtrl = L.Control.extend({
      onAdd() {
        const wrap = L.DomUtil.create("div", "phato-zoom-btns");
        wrap.innerHTML = `
          <button class="zoom-in" title="Zoom in">+</button>
          <button class="zoom-out" title="Zoom out">−</button>`;
        L.DomEvent.disableClickPropagation(wrap);
        L.DomEvent.on(wrap.querySelector(".zoom-in")!, "click", () => map.zoomIn());
        L.DomEvent.on(wrap.querySelector(".zoom-out")!, "click", () => map.zoomOut());
        return wrap;
      },
      onRemove() {},
    });

    const RecenterCtrl = L.Control.extend({
      onAdd() {
        const wrap = L.DomUtil.create("div", "phato-recenter-btn");
        wrap.innerHTML = `<button title="My location" aria-label="My location">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="1" fill="currentColor"/>
            <line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
            <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
          </svg>
        </button>`;
        L.DomEvent.disableClickPropagation(wrap);
        L.DomEvent.on(wrap, "click", () =>
          map.flyTo([center.lat, center.lng], 13, { duration: 0.8 }),
        );
        return wrap;
      },
      onRemove() {},
    });

    const zoom = new (ZoomCtrl as any)({ position: "bottomright" });
    const recenter = new (RecenterCtrl as any)({ position: "bottomright" });
    zoom.addTo(map);
    recenter.addTo(map);

    return () => {
      zoom.remove();
      recenter.remove();
    };
  }, [map, center]);

  return null;
}

function MapUpdater({ center }: { center: LatLng | null }) {
  const map = useMap();
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!center || initializedRef.current) return;
    initializedRef.current = true;
    map.flyTo([center.lat, center.lng], 13, { duration: 1.2 });
  }, [center, map]);

  return null;
}

type MapViewProps = {
  userPosition: LatLng | null;
  children?: React.ReactNode;
};

export default function MapView({ userPosition, children }: MapViewProps) {
  const center = userPosition ?? DEFAULT_CENTER;

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      zoomControl={false}
      attributionControl={false}
      className="phato-map"
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
      <MapControls center={center} />
      <MapUpdater center={userPosition} />
      {children}
    </MapContainer>
  );
}
