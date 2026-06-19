import React from "react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalizedStatus = status.trim().toLowerCase();

  // Mapping dengan warna yang lebih deep/tua (Coretax Vibe)
  const statusMap: Record<string, { label: string; className: string }> = {
    pending: { label: "Menunggu", className: "bg-amber-100/50 text-amber-800 border-amber-300" },
    diproses: { label: "Diproses", className: "bg-blue-100/50 text-blue-800 border-blue-300" },
    selesai: { label: "Selesai", className: "bg-emerald-100/50 text-emerald-900 border-emerald-300" },
    ditolak: { label: "Ditolak", className: "bg-rose-100/50 text-rose-800 border-rose-300" },
    aktif: { label: "Aktif", className: "bg-emerald-100/50 text-emerald-900 border-emerald-300" },
    nonaktif: { label: "Nonaktif", className: "bg-slate-200/50 text-slate-700 border-slate-300" },
    tersalurkan: { label: "Tersalurkan", className: "bg-emerald-100/50 text-emerald-900 border-emerald-300" },
    belum_bayar: { label: "Belum Bayar", className: "bg-amber-100/50 text-amber-800 border-amber-300" },
    lunas: { label: "Lunas", className: "bg-emerald-100/50 text-emerald-900 border-emerald-300" },
    jatuh_tempo: { label: "Jatuh Tempo", className: "bg-rose-100/50 text-rose-800 border-rose-300" },
    berhasil: { label: "Berhasil", className: "bg-emerald-100/50 text-emerald-900 border-emerald-300" },
    gagal: { label: "Gagal", className: "bg-rose-100/50 text-rose-800 border-rose-300" },
    expired: { label: "Expired", className: "bg-slate-200/50 text-slate-700 border-slate-300" },
    rendah: { label: "Rendah", className: "bg-emerald-100/50 text-emerald-900 border-emerald-300" },
    sedang: { label: "Sedang", className: "bg-amber-100/50 text-amber-800 border-amber-300" },
    tinggi: { label: "Tinggi", className: "bg-rose-100/50 text-rose-800 border-rose-300" },
  };

  const currentBadge = statusMap[normalizedStatus] || {
    label: status,
    className: "bg-slate-200/50 text-slate-700 border-slate-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "px-3 py-0.5", 
        "rounded-lg text-[11px] font-bold", 
        "border", 
        currentBadge.className
      )}
    >
      {currentBadge.label}
    </span>
  );
}