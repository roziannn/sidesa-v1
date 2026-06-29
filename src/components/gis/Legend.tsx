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
  compact?: boolean;
  className?: string;
}

export default function Legend({
  categoryCounts = {},
  compact = false,
  className,
}: LegendProps) {
  return (
    <section
      className={[
        compact
          ? "rounded-2xl border border-white/70 bg-white/95 p-3 shadow-lg backdrop-blur"
          : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={compact ? "mb-2" : "mb-4"}>
        <h2
          className={`font-semibold text-slate-900 ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          Legenda
        </h2>
        {!compact && (
          <p className="mt-1 text-sm text-slate-500">
            Warna marker mengikuti kategori data spasial.
          </p>
        )}
      </div>

      <div className={compact ? "space-y-1.5" : "space-y-3"}>
        {legendItems.map((item) => (
          <div
            key={item.key}
            className={`flex items-center justify-between gap-3 rounded-xl ${
              compact
                ? "border border-white/60 bg-white/80 px-2.5 py-1.5"
                : "border border-slate-100 px-3 py-2"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full ring-white ${
                  compact
                    ? "h-2.5 w-2.5 ring-2"
                    : "h-3.5 w-3.5 ring-4"
                }`}
                style={{
                  backgroundColor: getCategoryColor(item.key),
                }}
              />
              <span
                className={`font-medium text-slate-700 ${
                  compact ? "text-xs" : "text-sm"
                }`}
              >
                {item.label}
              </span>
            </div>

            <span
              className={`font-semibold text-slate-400 ${
                compact ? "text-[11px]" : "text-xs"
              }`}
            >
              {categoryCounts[item.key] ?? 0}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
