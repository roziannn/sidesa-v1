import L, { divIcon } from "leaflet";

import {
  Coordinate,
  LayerVisibility,
  MapFilter,
  MapMarker,
} from "@/types/gis";

/* =====================================
   DEFAULT MAP CONFIG
===================================== */

export const DEFAULT_CENTER: Coordinate = {
  lat: -6.9829,
  lng: 108.4854,
};

export const DEFAULT_ZOOM = 15;

/* =====================================
   MARKER ICON
===================================== */

export function createMarkerIcon(
  color: string,
  label: string
) {
  return divIcon({
    className: "",
    html: `
      <div style="display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 10px 24px rgba(15,23,42,.22);font-size:11px;font-weight:700;color:white;text-transform:uppercase;">
        ${label}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

/* =====================================
   FILTER MARKER
===================================== */

export function filterMarkers(
  markers: MapMarker[],
  filter: MapFilter,
  layers: LayerVisibility
) {
  return markers.filter((marker) => {
    const keyword =
      filter.keyword === "" ||
      marker.name.toLowerCase().includes(filter.keyword.toLowerCase());

    const category =
      filter.category === "all" ||
      marker.category === filter.category;

    const wilayah =
      filter.dusun === "all" ||
      String(marker.properties?.wilayah ?? "").toLowerCase() ===
        filter.dusun.toLowerCase();

    const rw =
      filter.rw === "all" ||
      String(marker.properties?.rw ?? "").toLowerCase() ===
        filter.rw.toLowerCase();

    const rt =
      filter.rt === "all" ||
      String(marker.properties?.rt ?? "").toLowerCase() ===
        filter.rt.toLowerCase();

    const visible = layers[marker.category];

    return keyword && category && wilayah && rw && rt && visible;
  });
}

/* =====================================
   SEARCH
===================================== */

export function searchMarkers(
  markers: MapMarker[],
  keyword: string
) {
  return markers.filter((item) =>
    item.name.toLowerCase().includes(keyword.toLowerCase())
  );
}

/* =====================================
   MAP BOUNDS
===================================== */

export function calculateBounds(markers: MapMarker[]) {
  if (markers.length === 0) return null;

  return L.latLngBounds(
    markers.map((item) => [
      item.coordinate.lat,
      item.coordinate.lng,
    ])
  );
}

/* =====================================
   COORDINATE FORMAT
===================================== */

export function formatCoordinate(
  coordinate: Coordinate
) {
  return `${coordinate.lat.toFixed(6)}, ${coordinate.lng.toFixed(6)}`;
}

/* =====================================
   DISTANCE
===================================== */

export function calculateDistance(
  from: Coordinate,
  to: Coordinate
) {
  return (
    L.latLng(from.lat, from.lng).distanceTo(
      L.latLng(to.lat, to.lng)
    ) / 1000
  );
}

/* =====================================
   CATEGORY COLOR
===================================== */

export function getCategoryColor(category: string) {
  switch (category) {
    case "resident":
      return "#2563eb";

    case "office":
      return "#ef4444";

    case "school":
      return "#f59e0b";

    case "hospital":
      return "#dc2626";

    case "mosque":
      return "#16a34a";

    case "posyandu":
      return "#8b5cf6";

    case "umkm":
      return "#0ea5e9";

    case "tourism":
      return "#fb923c";

    case "complaint":
      return "#7c3aed";

    default:
      return "#64748b";
  }
}
