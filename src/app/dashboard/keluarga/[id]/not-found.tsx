"use client";

import React from "react";
import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function KeluargaNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center animate-fade-in">
      <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-5 shadow-sm border border-amber-100">
        <FileQuestion className="w-8 h-8 stroke-[1.75]" />
      </div>
      
      <h2 className="text-xl font-bold text-slate-800 tracking-tight mb-2">
        Data Tidak Ditemukan
      </h2>
      
      <p className="text-sm text-slate-500 max-w-sm leading-relaxed mb-6">
        Data keluarga dengan ID ini tidak ditemukan atau sudah dihapus dari sistem.
      </p>

      <Link
        href="/dashboard/keluarga"
        className="inline-flex items-center gap-2 bg-[#14532d] hover:bg-[#166534] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Daftar Keluarga
      </Link>
    </div>
  );
}