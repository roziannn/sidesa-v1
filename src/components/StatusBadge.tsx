import React from "react";

interface StatusBadgeProps {
  status: string;
}

// Definisikan tipe untuk struktur config mapping
interface BadgeConfig {
  label: string;
  className: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  // Normalisasi string status agar tidak sensitif terhadap huruf besar/kecil (case-insensitive)
  const normalizedStatus = status.trim().toLowerCase();

  // Mapping status lengkap sesuai spesifikasi kebutuhan modul desa
  const statusMap: Record<string, BadgeConfig> = {
    pending: {
      label: "Menunggu",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    diproses: {
      label: "Diproses",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    selesai: {
      label: "Selesai",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    ditolak: {
      label: "Ditolak",
      className: "bg-rose-50 text-rose-700 border-rose-200",
    },
    aktif: {
      label: "Aktif",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    nonaktif: {
      label: "Nonaktif",
      className: "bg-slate-100 text-slate-600 border-slate-200",
    },
    tersalurkan: {
      label: "Tersalurkan",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    belum_bayar: {
      label: "Belum Bayar",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    },
    lunas: {
      label: "Lunas",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    jatuh_tempo: {
      label: "Jatuh Tempo",
      className: "bg-rose-50 text-rose-700 border-rose-200",
    },
    berhasil: { label: "Berhasil", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    gagal: { label: "Gagal", className: "bg-rose-50 text-rose-700 border-rose-200" },
    expired: { label: "Expired", className: "bg-slate-100 text-slate-600 border-slate-200" },
  };

  // Ambil config berdasarkan status aktif. Jika tidak terdaftar, gunakan fallback default (abu-abu)
  const currentBadge = statusMap[normalizedStatus] || {
    label: status, // Tampilkan status apa adanya jika kustom luar biasa
    className: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide shadow-sm select-none leading-none ${currentBadge.className}`}
    >
      {currentBadge.label}
    </span>
  );
}