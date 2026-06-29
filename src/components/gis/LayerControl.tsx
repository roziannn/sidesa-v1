"use client";

import { Check } from "lucide-react";

import { LayerVisibility } from "@/types/gis";

interface LayerControlProps {
  layers: LayerVisibility;

  onChange: (layers: LayerVisibility) => void;
  compact?: boolean;
  className?: string;
}

export default function LayerControl({
  layers,
  onChange,
  compact = false,
  className,
}: LayerControlProps) {
  const layerItems: {
    key: keyof LayerVisibility;
    label: string;
  }[] = [
    {
      key: "resident",
      label: "Penduduk",
    },
    {
      key: "office",
      label: "Kantor Desa",
    },
    {
      key: "school",
      label: "Sekolah",
    },
    {
      key: "mosque",
      label: "Masjid",
    },
    {
      key: "hospital",
      label: "Rumah Sakit",
    },
    {
      key: "posyandu",
      label: "Posyandu",
    },
    {
      key: "umkm",
      label: "UMKM",
    },
    {
      key: "tourism",
      label: "Wisata",
    },
    {
      key: "complaint",
      label: "Pengaduan",
    },
    {
      key: "other",
      label: "Lainnya",
    },
    {
      key: "polygon",
      label: "Batas Wilayah",
    },
  ];

  const toggleLayer = (key: keyof LayerVisibility) => {
    onChange({
      ...layers,
      [key]: !layers[key],
    });
  };

  return (
    <div
      className={[
        compact ? "space-y-1.5" : "space-y-2",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {layerItems.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => toggleLayer(item.key)}
          className={`flex w-full items-center justify-between rounded-xl border border-slate-200 transition hover:bg-slate-50 ${
            compact ? "px-2.5 py-2" : "px-3 py-2"
          }`}
        >
          <span
            className={`font-medium text-slate-700 ${
              compact ? "text-xs" : "text-sm"
            }`}
          >
            {item.label}
          </span>

          <div
            className={`flex items-center justify-center rounded border transition ${
              compact ? "h-4.5 w-4.5" : "h-5 w-5"
            } ${
              layers[item.key]
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-300 bg-white text-transparent"
            }`}
          >
            <Check size={compact ? 12 : 14} />
          </div>
        </button>
      ))}
    </div>
  );
}
