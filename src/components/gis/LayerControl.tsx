"use client";

import { Check } from "lucide-react";

import { LayerVisibility } from "@/types/gis";

interface LayerControlProps {
  layers: LayerVisibility;

  onChange: (layers: LayerVisibility) => void;
}

export default function LayerControl({
  layers,
  onChange,
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
    <div className="space-y-2">
      {layerItems.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={() => toggleLayer(item.key)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-3 py-2 transition hover:bg-slate-50"
        >
          <span className="text-sm font-medium text-slate-700">
            {item.label}
          </span>

          <div
            className={`flex h-5 w-5 items-center justify-center rounded border transition ${
              layers[item.key]
                ? "border-emerald-600 bg-emerald-600 text-white"
                : "border-slate-300 bg-white text-transparent"
            }`}
          >
            <Check size={14} />
          </div>
        </button>
      ))}
    </div>
  );
}