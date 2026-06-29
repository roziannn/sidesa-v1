"use client";

import { MapMarker } from "@/types/gis";

interface MarkerPopupProps {
  marker: MapMarker;
}

export default function MarkerPopup({
  marker,
}: MarkerPopupProps) {
  return (
    <div className="min-w-[260px] space-y-3">
      <div>
        <h3 className="text-base font-semibold">{marker.name}</h3>
        <p className="text-xs capitalize text-slate-500">{marker.category}</p>
      </div>

      {marker.description && (
        <p className="text-sm text-slate-600">{marker.description}</p>
      )}

      {marker.address && (
        <div className="text-sm">
          <span className="font-medium">Alamat</span>
          <p>{marker.address}</p>
        </div>
      )}

      {marker.phone && (
        <div className="text-sm">
          <span className="font-medium">Telepon</span>
          <p>{marker.phone}</p>
        </div>
      )}

      {marker.properties && Object.keys(marker.properties).length > 0 && (
        <div className="space-y-1 border-t border-slate-200 pt-3">
          {Object.entries(marker.properties).map(([key, value]) => (
            <div
              key={key}
              className="flex justify-between gap-3 text-sm"
            >
              <span className="font-medium capitalize text-slate-500">
                {key}
              </span>
              <span className="text-right text-slate-700">
                {String(value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
