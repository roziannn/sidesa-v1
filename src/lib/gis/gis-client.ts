"use client";

import L, { divIcon } from "leaflet";

import { Coordinate, MapMarker } from "@/types/gis";

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

export function calculateBounds(markers: MapMarker[]) {
  if (markers.length === 0) return null;

  return L.latLngBounds(
    markers.map((item) => [
      item.coordinate.lat,
      item.coordinate.lng,
    ])
  );
}

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
