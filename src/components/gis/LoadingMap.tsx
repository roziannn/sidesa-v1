"use client";

export default function LoadingMap() {
  return (
    <div className="flex h-[700px] w-full items-center justify-center rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#f8fafc_0%,#eefbf3_100%)] shadow-sm">
      <div className="space-y-3 text-center">
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
        <div>
          <p className="text-sm font-semibold text-slate-700">Memuat peta</p>
          <p className="text-sm text-slate-500">
            Leaflet sedang disiapkan di browser.
          </p>
        </div>
      </div>
    </div>
  );
}
