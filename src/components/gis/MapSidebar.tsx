"use client";

import {
  MapPin,
} from "lucide-react";

import { MapMarker, MapPolygon } from "@/types/gis";
import SelectedDetailCard from "@/components/gis/SelectedDetailCard";

interface MapSidebarProps {
  markers: MapMarker[];
  selectedMarkerId?: string;
  selectedMarker?: MapMarker;
  selectedPolygon?: MapPolygon;
  onMarkerSelect: (marker: MapMarker) => void;
}

export default function MapSidebar({
  markers,
  selectedMarkerId,
  selectedMarker,
  selectedPolygon,
  onMarkerSelect,
}: MapSidebarProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
        <div>
        <h2 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <div className="rounded-full bg-slate-100 p-2 text-slate-600">
            <MapPin className="h-4 w-4" />
            </div>
            Daftar Titik
        </h2>
        <p className="mt-1 text-sm text-slate-500">
            {markers.length} lokasi sesuai filter aktif.
        </p>
        </div>

          <div className="flex items-center gap-2">
        <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
            </div>
                <div className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    Live
                </div>
            </div>
        </div>

        <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
          {markers.map((marker) => (
            <button
              key={marker.id}
              type="button"
              onClick={() => onMarkerSelect(marker)}
              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                selectedMarkerId === marker.id
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-3">
                {/* <div className="mt-0.5 rounded-full bg-slate-100 p-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                </div> */}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {marker.name}
                  </p>
                  <p className="mt-1 text-xs uppercase text-slate-700">
                    {marker.category}
                  </p>
                  {marker.address && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {marker.address}
                    </p>
                  )}
                </div>
              </div>
            </button>
          ))}

          {markers.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
              Tidak ada titik yang cocok dengan filter saat ini.
            </div>
          )}
        </div>
      </section>

      {/* <SelectedDetailCard
        marker={selectedMarker}
        polygon={selectedPolygon}
      /> */}
    </div>
  );
}
