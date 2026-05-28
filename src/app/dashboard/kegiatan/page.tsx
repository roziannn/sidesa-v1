/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";

type Kegiatan = {
  id: string;
  judul: string;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string;
  kuota: number;
  status: "Aktif" | "Selesai" | "Dibatalkan";
  peserta_kegiatan?: { count: number }[];
};

export default function KegiatanPage() {
  const router = useRouter();

  // STATE
  const [mode, setMode] = useState<"list" | "kalender">("list");
  const [data, setData] = useState<Kegiatan[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [bulan, setBulan] = useState(now.getMonth() + 1);
  const [tahun, setTahun] = useState(now.getFullYear());

  // FETCH DATA
  const fetchData = async () => {
    setLoading(true);
    const { data: dbData } = await supabaseClient.from("kegiatan").select(`
        *,
        peserta_kegiatan(count)
      `);

    if (dbData) {
      setData(dbData as any);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);
  // =========================
  // FILTER BULAN / TAHUN
  // =========================
  // FILTER LOGIC
  const filteredData = useMemo(() => {
    return data.filter((k) => {
      const d = new Date(k.tanggal);
      return d.getMonth() + 1 === bulan && d.getFullYear() === tahun;
    });
  }, [data, bulan, tahun]);

  // =========================
  // FORMAT TANGGAL
  // =========================
  const formatTanggal = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // =========================
  // STATUS KUOTA COLOR
  // =========================
  const getKuotaColor = (terdaftar: number, kuota: number) => {
    const ratio = terdaftar / kuota;
    if (ratio >= 1) return "text-red-600";
    if (ratio >= 0.8) return "text-orange-500";
    return "text-emerald-600";
  };

  // COLUMNS CONFIG
  const columns: Column<Kegiatan>[] = [
    { key: "judul", label: "Judul Kegiatan" },
    { key: "tanggal", label: "Tanggal", render: (val) => new Date(val as string).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) },
    { key: "waktu", label: "Waktu", render: (_, row) => `${row.waktu_mulai} – ${row.waktu_selesai} WIB` },
    { key: "lokasi", label: "Lokasi" },
    {
      key: "peserta",
      label: "Peserta",
      render: (_, row) => {
        const terdaftar = row.peserta_kegiatan?.[0]?.count || 0;
        const color = terdaftar >= row.kuota ? "text-red-600" : "text-emerald-600";
        return (
          <span className={`font-semibold ${color}`}>
            {terdaftar} / {row.kuota}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (_, row) => <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === "Aktif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"}`}>{row.status}</span>,
    },
    {
      key: "aksi",
      label: "Aksi",
      render: (_, row) => (
        <div className="flex items-center gap-3 text-xs">
          <button onClick={() => router.push(`/dashboard/kegiatan/${row.id}`)} className="text-emerald-600 font-semibold hover:underline">
            Detail
          </button>

          <span className="text-slate-300">|</span>

          <button onClick={() => router.push(`/dashboard/kegiatan/${row.id}/edit`)} className="text-amber-600 font-semibold hover:underline">
            Edit
          </button>
        </div>
      ),
    },
  ];

  // =========================
  // KALENDER LOGIC
  // =========================
  const daysInMonth = new Date(tahun, bulan, 0).getDate();
  const firstDay = new Date(tahun, bulan - 1, 1).getDay();

  const calendarDays = useMemo(() => {
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [bulan, tahun]);

  const namaBulan = new Date(tahun, bulan - 1).toLocaleString("id-ID", {
    month: "long",
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-xl font-bold">Kegiatan Desa</h1>

        <div className="flex items-center gap-2">
          <button onClick={() => setMode("list")} className={`px-3 py-1 rounded-lg text-sm font-semibold border ${mode === "list" ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-300 text-slate-600"}`}>
            <List className="w-4 h-4 inline mr-1" />
            List
          </button>

          <button onClick={() => setMode("kalender")} className={`px-3 py-1 rounded-lg text-sm font-semibold border ${mode === "kalender" ? "bg-emerald-600 text-white border-emerald-600" : "border-slate-300 text-slate-600"}`}>
            <CalendarIcon className="w-4 h-4 inline mr-1" />
            Kalender
          </button>

          <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className="border rounded-lg px-2 py-1 text-sm">
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i + 1}>
                {new Date(2025, i).toLocaleString("id-ID", {
                  month: "long",
                })}
              </option>
            ))}
          </select>

          <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="border rounded-lg px-2 py-1 text-sm">
            {[2024, 2025, 2026].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <button onClick={() => router.push("/dashboard/kegiatan/tambah")} className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Buat Kegiatan
          </button>
        </div>
      </div>

      {/* =========================
          MODE LIST
      ========================= */}
      {mode === "list" && (
        <>
          {filteredData.length === 0 ? (
            <div className="text-center py-16 border rounded-xl bg-slate-50">
              <CalendarIcon className="mx-auto w-10 h-10 text-slate-400" />
              <p className="mt-2 text-slate-600 font-medium">Belum ada kegiatan di bulan ini</p>
              <p className="text-sm text-slate-400">Silakan tambahkan kegiatan baru</p>
            </div>
          ) : (
            <DataTable columns={columns} data={filteredData} />
          )}
        </>
      )}

      {/* =========================
          MODE KALENDER
      ========================= */}
      {mode === "kalender" && (
        <div className="space-y-4">
          {/* NAVIGASI BULAN */}
          <div className="flex items-center justify-between">
            <button onClick={() => setBulan((b) => (b === 1 ? 12 : b - 1))}>
              <ChevronLeft />
            </button>

            <h2 className="font-bold text-lg capitalize">
              {namaBulan} {tahun}
            </h2>

            <button onClick={() => setBulan((b) => (b === 12 ? 1 : b + 1))}>
              <ChevronRight />
            </button>
          </div>

          {/* GRID */}
          <div className="grid grid-cols-7 gap-2 text-center text-sm font-semibold">
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d) => (
              <div key={d}>{d}</div>
            ))}

            {calendarDays.map((day, idx) => {
              const today = new Date().getDate();
              const isToday = day === today && bulan === now.getMonth() + 1 && tahun === now.getFullYear();

              return (
                <div key={idx} className={`h-20 border rounded-lg p-1 relative ${!day ? "bg-slate-50" : ""}`}>
                  {day && (
                    <>
                      <div className={`w-6 h-6 flex items-center justify-center rounded-full mx-auto ${isToday ? "bg-blue-500 text-white" : ""}`}>{day}</div>

                      {/* DOT EVENT */}
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mx-auto mt-1"></div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
