import { useCallback, useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { LatLng, Vehicle, PassengerRequest, RouteResult } from "../lib/types";

const STYLE = "https://tiles.openfreemap.org/styles/bright";
const TERRAIN_URL = "https://demotiles.maplibre.org/terrain-tiles/tiles.json";

interface MapProps {
  center: LatLng;
  vehicles?: Vehicle[];
  passengers?: PassengerRequest[];
  route?: RouteResult | null;
  destination?: LatLng | null;
  onVehicleClick?: (v: Vehicle) => void;
}

function applyRoute(map: maplibregl.Map, route: RouteResult | null) {
  const src = map.getSource("route") as maplibregl.GeoJSONSource | undefined;
  if (!src) return;
  const coords = route?.coordinates?.map((c) => [c.lng, c.lat]) ?? [];
  src.setData({
    type: "Feature",
    geometry: { type: "LineString", coordinates: coords },
    properties: {},
  });
}

export default function MapGL({
  center,
  vehicles = [],
  passengers = [],
  route = null,
  destination = null,
  onVehicleClick,
}: MapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const styleLoadedRef = useRef(false);
  const pendingRouteRef = useRef<RouteResult | null>(null);
  const centeredRef = useRef(false);

  const userMarkerRef = useRef<maplibregl.Marker | null>(null);
  const destMarkerRef = useRef<maplibregl.Marker | null>(null);
  const vehicleMarkersRef = useRef(new globalThis.Map<string, maplibregl.Marker>());
  const vehicleDataRef = useRef(new globalThis.Map<string, Vehicle>());
  const passengerMarkersRef = useRef(new globalThis.Map<string, maplibregl.Marker>());
  const onVehicleClickRef = useRef(onVehicleClick);
  onVehicleClickRef.current = onVehicleClick;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE,
      center: [center.lng, center.lat],
      zoom: 12,
      pitch: 45,
      bearing: 0,
      canvasContextAttributes: { antialias: true },
    });

    mapRef.current = map;

    map.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "bottom-right",
    );

    map.on("load", () => {
      styleLoadedRef.current = true;

      map.addSource("terrain-dem", {
        type: "raster-dem",
        url: TERRAIN_URL,
        tileSize: 256,
      });

      const layers = map.getStyle().layers;
      const firstLayerId = layers?.[0]?.id;

      map.addLayer(
        {
          id: "hillshade",
          type: "hillshade",
          source: "terrain-dem",
          paint: {
            "hillshade-exaggeration": 0.25,
            "hillshade-shadow-color": "#000",
            "hillshade-highlight-color": "#fff",
          },
        } as maplibregl.LayerSpecification,
        firstLayerId,
      );

      map.setTerrain({ source: "terrain-dem", exaggeration: 1.5 });

      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "LineString", coordinates: [] },
          properties: {},
        },
      });

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": "#000", "line-width": 4, "line-opacity": 0.85 },
      });

      map.addLayer({
        id: "route-dashes",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#fff",
          "line-width": 2,
          "line-opacity": 0.4,
          "line-dasharray": [2, 4],
        },
      });

      if (pendingRouteRef.current) {
        applyRoute(map, pendingRouteRef.current);
      }
    });

    return () => {
      styleLoadedRef.current = false;
      vehicleMarkersRef.current.forEach((m) => m.remove());
      vehicleMarkersRef.current.clear();
      passengerMarkersRef.current.forEach((m) => m.remove());
      passengerMarkersRef.current.clear();
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      destMarkerRef.current?.remove();
      destMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current;
    if (!map || centeredRef.current) return;
    centeredRef.current = true;
    map.flyTo({ center: [center.lng, center.lat], zoom: 13, pitch: 45, duration: 1200 });
  }, [center]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (!userMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "phato-user-marker";
      el.innerHTML = '<div class="phato-user-pulse"></div><div class="phato-user-dot"></div>';
      userMarkerRef.current = new maplibregl.Marker({ element: el, anchor: "center" })
        .setLngLat([center.lng, center.lat])
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat([center.lng, center.lat]);
    }
  }, [center]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    for (const v of vehicles) {
      vehicleDataRef.current.set(v.id, v);
    }

    const existing = vehicleMarkersRef.current;
    const ids = new Set(vehicles.map((v) => v.id));

    for (const [id, marker] of existing) {
      if (!ids.has(id)) {
        marker.remove();
        existing.delete(id);
        vehicleDataRef.current.delete(id);
      }
    }

    for (const v of vehicles) {
      if (existing.has(v.id)) {
        existing.get(v.id)!.setLngLat([v.position.lng, v.position.lat]).setRotation(v.headingDeg);
        const el = existing.get(v.id)!.getElement();
        const badge = el.querySelector(".phato-veh-seats");
        if (badge) badge.textContent = String(v.seatsTotal - v.seatsFilled);
      } else {
        const id = v.id;
        const el = document.createElement("div");
        el.className = "phato-veh-marker";
        el.innerHTML = `
          <div class="phato-veh-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M5 17H3v-5l3-6h10l3 6v5h-2"/>
              <circle cx="7.5" cy="17" r="2.5"/>
              <circle cx="16.5" cy="17" r="2.5"/>
            </svg>
          </div>
          <div class="phato-veh-seats">${v.seatsTotal - v.seatsFilled}</div>`;
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          const vd = vehicleDataRef.current.get(id);
          if (vd) onVehicleClickRef.current?.(vd);
        });
        const marker = new maplibregl.Marker({
          element: el,
          anchor: "center",
          rotation: v.headingDeg,
          rotationAlignment: "map",
        })
          .setLngLat([v.position.lng, v.position.lat])
          .addTo(map);
        existing.set(v.id, marker);
      }
    }
  }, [vehicles]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const existing = passengerMarkersRef.current;
    const ids = new Set(passengers.map((p) => p.id));

    for (const [id, marker] of existing) {
      if (!ids.has(id)) { marker.remove(); existing.delete(id); }
    }

    for (const p of passengers) {
      if (existing.has(p.id)) {
        existing.get(p.id)!.setLngLat([p.position.lng, p.position.lat]);
      } else {
        const el = document.createElement("div");
        el.className = "phato-pax-marker";
        el.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7" r="4"/><path d="M12 14c-7 0-8 3-8 4h16c0-1-1-4-8-4z"/></svg>`;
        const marker = new maplibregl.Marker({ element: el, anchor: "center" })
          .setLngLat([p.position.lng, p.position.lat])
          .addTo(map);
        existing.set(p.id, marker);
      }
    }
  }, [passengers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    pendingRouteRef.current = route;
    if (styleLoadedRef.current) {
      applyRoute(map, route);
    }
  }, [route]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (destination) {
      if (!destMarkerRef.current) {
        const el = document.createElement("div");
        el.className = "phato-dest-marker";
        destMarkerRef.current = new maplibregl.Marker({ element: el, anchor: "bottom" })
          .setLngLat([destination.lng, destination.lat])
          .addTo(map);
      } else {
        destMarkerRef.current.setLngLat([destination.lng, destination.lat]);
      }
    } else {
      destMarkerRef.current?.remove();
      destMarkerRef.current = null;
    }
  }, [destination]);

  const recenter = useCallback(() => {
    mapRef.current?.flyTo({
      center: [center.lng, center.lat],
      zoom: 13,
      pitch: 45,
      duration: 800,
    });
  }, [center]);

  return (
    <div className="phato-map-wrap">
      <div ref={containerRef} className="phato-map" />
      <button className="phato-recenter" onClick={recenter} aria-label="My location">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="1" fill="currentColor" />
          <line x1="12" y1="2" x2="12" y2="6" />
          <line x1="12" y1="18" x2="12" y2="22" />
          <line x1="2" y1="12" x2="6" y2="12" />
          <line x1="18" y1="12" x2="22" y2="12" />
        </svg>
      </button>
    </div>
  );
}
