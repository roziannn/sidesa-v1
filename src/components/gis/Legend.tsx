"use client";

import { getCategoryColor } from "@/lib/gis/gis";

const legendItems = [
  { key: "resident", label: "Permukiman" },
  { key: "office", label: "Kantor" },
  { key: "school", label: "Sekolah" },
  { key: "mosque", label: "Masjid" },
  { key: "hospital", label: "Rumah sakit" },
  { key: "posyandu", label: "Posyandu" },
  { key: "umkm", label: "UMKM" },
  { key: "tourism", label: "Wisata" },
  { key: "complaint", label: "Pengaduan" },
  { key: "other", label: "Lainnya" },
] as const;

interface LegendProps {
  categoryCounts?: Record<string, number>;
}

export default function Legend({
  categoryCounts = {},
}: LegendProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">Legenda</h2>
        <p className="mt-1 text-sm text-slate-500">
          Warna marker mengikuti kategori data spasial.
        </p>
      </div>

      <div className="space-y-3">
        {legendItems.map((item) => (
          <div
            key={item.key}
            className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2"
          >
            <div className="flex items-center gap-3">
              <span
                className="h-3.5 w-3.5 rounded-full ring-4 ring-white"
                style={{
                  backgroundColor: getCategoryColor(item.key),
                }}
              />
              <span className="text-sm font-medium text-slate-700">
                {item.label}
              </span>
            </div>

            <span className="text-xs font-semibold text-slate-400">
              {categoryCounts[item.key] ?? 0}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
