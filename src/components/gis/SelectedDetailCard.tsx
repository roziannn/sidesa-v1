"use client";

import { CircleDot } from "lucide-react";

import { formatCoordinate } from "@/lib/gis/gis";
import { MapMarker, MapPolygon } from "@/types/gis";

interface SelectedDetailCardProps {
  marker?: MapMarker;
  polygon?: MapPolygon;
}

export default function SelectedDetailCard({
  marker,
  polygon,
}: SelectedDetailCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">
        Detail Terpilih
      </h2>

      {marker ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
              Marker
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {marker.name}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              {marker.description ?? "Belum ada deskripsi."}
            </p>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-start justify-between gap-3">
              <span>Kategori</span>
              <span className="font-medium text-slate-900">
                {marker.category}
              </span>
            </div>
            <div className="flex items-start justify-between gap-3">
              <span>Koordinat</span>
              <span className="text-right font-medium text-slate-900">
                {formatCoordinate(marker.coordinate)}
              </span>
            </div>
            {marker.address && (
              <div className="flex items-start justify-between gap-3">
                <span>Alamat</span>
                <span className="text-right font-medium text-slate-900">
                  {marker.address}
                </span>
              </div>
            )}
          </div>
        </div>
      ) : polygon ? (
        <div className="mt-4 space-y-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
              Polygon
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {polygon.name}
            </p>
          </div>

          <div className="space-y-2 text-sm text-slate-600">
            {polygon.properties &&
              Object.entries(polygon.properties).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-start justify-between gap-3"
                >
                  <span className="capitalize">{key}</span>
                  <span className="text-right font-medium text-slate-900">
                    {String(value)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Klik atau hover marker maupun polygon di peta untuk melihat detailnya
          di sini.
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
        <CircleDot className="h-4 w-4" />
        Struktur panel ini sudah siap dipakai untuk data wilayah desa yang
        lebih detail.
      </div>
    </section>
  );
}
