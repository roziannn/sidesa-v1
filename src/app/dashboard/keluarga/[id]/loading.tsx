import React from "react";

export default function KeluargaDetailLoading() {
  return (
    <div className="space-y-8 animate-pulse p-4">
      {/* SKELETON: Kartu Info Keluarga */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-lg" />
            <div className="space-y-2">
              <div className="h-5 bg-slate-200 rounded w-48" />
              <div className="h-3 bg-slate-200 rounded w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-8 bg-slate-200 rounded-lg w-24" />
            <div className="h-8 bg-slate-200 rounded-lg w-24" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:justify-between py-1.5 border-b border-slate-100 gap-2">
              <div className="h-4 bg-slate-200 rounded sm:w-1/3" />
              <div className="h-4 bg-slate-200 rounded sm:w-1/2" />
            </div>
          ))}
        </div>
      </div>

      {/* SKELETON: Daftar Anggota Keluarga */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="h-6 bg-slate-200 rounded w-40" />
          <div className="h-8 bg-slate-200 rounded-lg w-32" />
        </div>
        <div className="bg-white rounded-xl border border-slate-200 h-48 w-full shadow-sm" />
      </div>
    </div>
  );
}