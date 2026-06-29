"use client";

import {
  CircleDot,
  MapPin,
  SearchCheck,
} from "lucide-react";

import { formatCoordinate } from "@/lib/gis/gis";
import { MapFilter, MapMarker, MapPolygon } from "@/types/gis";

interface MapSidebarProps {
  filter: MapFilter;
  markers: MapMarker[];
  selectedMarkerId?: string;
  selectedMarker?: MapMarker;
  selectedPolygon?: MapPolygon;
  onFilterChange: (filter: MapFilter) => void;
  onMarkerSelect: (marker: MapMarker) => void;
}

const categoryOptions: {
  value: MapFilter["category"];
  label: string;
}[] = [
  { value: "all", label: "Semua kategori" },
  { value: "office", label: "Kantor" },
  { value: "hospital", label: "Rumah sakit" },
  { value: "school", label: "Sekolah" },
  { value: "mosque", label: "Masjid" },
  { value: "posyandu", label: "Posyandu" },
  { value: "umkm", label: "UMKM" },
  { value: "tourism", label: "Wisata" },
  { value: "complaint", label: "Pengaduan" },
  { value: "resident", label: "Permukiman" },
  { value: "other", label: "Lainnya" },
];

const areaOptions = ["all", "Kuningan", "Cigugur", "Cilimus"];

export default function MapSidebar({
  filter,
  markers,
  selectedMarkerId,
  selectedMarker,
  selectedPolygon,
  onFilterChange,
  onMarkerSelect,
}: MapSidebarProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start gap-3">
          <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <SearchCheck className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Filter Wilayah
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Paket filter dasar untuk demo sebelum dihubungkan ke data dusun,
              RW, dan RT sebenarnya.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Kategori
            </label>
            <select
              value={filter.category}
              onChange={(event) =>
                onFilterChange({
                  ...filter,
                  category: event.target.value as MapFilter["category"],
                })
              }
              className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Wilayah
              </label>
              <select
                value={filter.dusun}
                onChange={(event) =>
                  onFilterChange({
                    ...filter,
                    dusun: event.target.value,
                  })
                }
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              >
                {areaOptions.map((option) => (
                  <option key={option} value={option}>
                    {option === "all" ? "Semua wilayah" : option}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">RW</label>
              <input
                value={filter.rw === "all" ? "" : filter.rw}
                onChange={(event) =>
                  onFilterChange({
                    ...filter,
                    rw: event.target.value || "all",
                  })
                }
                placeholder="Contoh: 03"
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">RT</label>
              <input
                value={filter.rt === "all" ? "" : filter.rt}
                onChange={(event) =>
                  onFilterChange({
                    ...filter,
                    rt: event.target.value || "all",
                  })
                }
                placeholder="Contoh: 01"
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Daftar Titik
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {markers.length} lokasi sesuai filter aktif.
            </p>
          </div>

          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            Live
          </div>
        </div>

        <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
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
                <div className="mt-0.5 rounded-full bg-slate-100 p-2 text-slate-600">
                  <MapPin className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {marker.name}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-400">
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">
          Detail Terpilih
        </h2>

        {selectedMarker ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                Marker
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {selectedMarker.name}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {selectedMarker.description ?? "Belum ada deskripsi."}
              </p>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex items-start justify-between gap-3">
                <span>Kategori</span>
                <span className="font-medium text-slate-900">
                  {selectedMarker.category}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span>Koordinat</span>
                <span className="text-right font-medium text-slate-900">
                  {formatCoordinate(selectedMarker.coordinate)}
                </span>
              </div>
              {selectedMarker.address && (
                <div className="flex items-start justify-between gap-3">
                  <span>Alamat</span>
                  <span className="text-right font-medium text-slate-900">
                    {selectedMarker.address}
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : selectedPolygon ? (
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                Polygon
              </p>
              <p className="mt-1 text-base font-semibold text-slate-900">
                {selectedPolygon.name}
              </p>
            </div>

            <div className="space-y-2 text-sm text-slate-600">
              {selectedPolygon.properties &&
                Object.entries(selectedPolygon.properties).map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="flex items-start justify-between gap-3"
                    >
                      <span className="capitalize">{key}</span>
                      <span className="text-right font-medium text-slate-900">
                        {String(value)}
                      </span>
                    </div>
                  )
                )}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
            Klik marker atau polygon di peta untuk melihat detailnya di sini.
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          <CircleDot className="h-4 w-4" />
          Struktur panel ini sudah siap dipakai untuk data wilayah desa yang
          lebih detail.
        </div>
      </section>
    </div>
  );
}
