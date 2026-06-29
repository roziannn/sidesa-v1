"use client";

import {
  Crosshair,
  Maximize2,
  RotateCcw,
  Search,
} from "lucide-react";

interface MapToolbarProps {
  keyword: string;

  onKeywordChange: (value: string) => void;

  onReset?: () => void;

  onMyLocation?: () => void;

  onFullscreen?: () => void;

  loading?: boolean;
}

export default function MapToolbar({
  keyword,
  onKeywordChange,
  onReset,
  onMyLocation,
  onFullscreen,
  loading = false,
}: MapToolbarProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}

        <div className="relative w-full lg:max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />

          <input
            type="text"
            value={keyword}
            disabled={loading}
            placeholder="Cari lokasi, warga, fasilitas..."
            onChange={(e) =>
              onKeywordChange(e.target.value)
            }
            className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm outline-none transition-all focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
          />
        </div>

        {/* Actions */}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onReset}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RotateCcw size={16} />
            Reset
          </button>

          <button
            type="button"
            onClick={onMyLocation}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Crosshair size={16} />
            Lokasi Saya
          </button>

          <button
            type="button"
            onClick={onFullscreen}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Maximize2 size={16} />
            Fullscreen
          </button>
        </div>
      </div>
    </div>
  );
}