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
  status: "aktif" | "selesai" | "Dibatalkan";
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

  // FILTER LOGIC
  const filteredData = useMemo(() => {
    return data.filter((k) => {
      const d = new Date(k.tanggal);
      return d.getMonth() + 1 === bulan && d.getFullYear() === tahun;
    });
  }, [data, bulan, tahun]);

  // AGREGASI EVENT BERDASARKAN TANGGAL
  const eventsByDay = useMemo(() => {
    const map: Record<number, Kegiatan[]> = {};
    filteredData.forEach((kegiatan) => {
      const d = new Date(kegiatan.tanggal);
      const tgl = d.getDate();
      if (!map[tgl]) {
        map[tgl] = [];
      }
      map[tgl].push(kegiatan);
    });
    return map;
  }, [filteredData]);

  // COLUMNS CONFIG FOR LIST
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
      render: (_, row) => <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row.status === "aktif" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"}`}>{row.status}</span>,
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

  // KALENDER LOGIC
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

  // Menentukan jumlah baris minggu dalam bulan terpilih (biasanya 5 atau 6)
  const totalWeeks = Math.ceil(calendarDays.length / 7);

  const namaBulan = new Date(tahun, bulan - 1).toLocaleString("id-ID", {
    month: "long",
  });

  const handlePrevBulan = () => {
    if (bulan === 1) {
      setBulan(12);
      setTahun((t) => t - 1);
    } else {
      setBulan((b) => b - 1);
    }
  };

  const handleNextBulan = () => {
    if (bulan === 12) {
      setBulan(1);
      setTahun((t) => t + 1);
    } else {
      setBulan((b) => b + 1);
    }
  };

  return (
    <div className={`space-y-4 ${mode === "kalender" ? "h-[calc(100vh-110px)] flex flex-col" : ""}`}>
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
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

          <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))} className="border rounded-lg px-2 py-1 text-sm bg-white">
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i} value={i + 1}>
                {new Date(2025, i).toLocaleString("id-ID", { month: "long" })}
              </option>
            ))}
          </select>

          <select value={tahun} onChange={(e) => setTahun(Number(e.target.value))} className="border rounded-lg px-2 py-1 text-sm bg-white">
            {[2024, 2025, 2026].map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <button onClick={() => router.push("/dashboard/kegiatan/tambah")} className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm font-semibold flex items-center gap-1 shadow-sm">
            <Plus className="w-4 h-4" />
            Buat Kegiatan
          </button>
        </div>
      </div>

      {/* MODE LIST */}
      {mode === "list" && (
        <div className="overflow-auto">
          {filteredData.length === 0 ? (
            <div className="text-center py-16 border rounded-xl bg-slate-50">
              <CalendarIcon className="mx-auto w-10 h-10 text-slate-400" />
              <p className="mt-2 text-slate-600 font-medium">Belum ada kegiatan di bulan ini</p>
              <p className="text-sm text-slate-400">Silakan tambahkan kegiatan baru</p>
            </div>
          ) : (
            <DataTable columns={columns} data={filteredData} />
          )}
        </div>
      )}

      {/* MODE KALENDER (Full Page Viewport) */}
      {mode === "kalender" && (
        <div className="flex-1 flex flex-col bg-white border p-4 rounded-xl shadow-sm min-h-0 overflow-hidden">
          {/* NAVIGASI BULAN */}
          <div className="flex items-center justify-between border-b pb-2 flex-shrink-0">
            <button onClick={handlePrevBulan} className="p-1 hover:bg-slate-100 rounded-md transition">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-bold text-lg capitalize text-slate-800">
              {namaBulan} {tahun}
            </h2>
            <button onClick={handleNextBulan} className="p-1 hover:bg-slate-100 rounded-md transition">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* WRAPPER GRID HARI & TANGGAL */}
          <div className="flex-1 flex flex-col min-h-0 mt-3">
            {/* NAMA HARI */}
            <div className="grid grid-cols-7 gap-2 flex-shrink-0 mb-1">
              {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((d, i) => (
                <div key={d} className={`text-center text-xs font-bold uppercase tracking-wider ${i === 0 ? "text-red-500" : "text-slate-500"}`}>
                  {d}
                </div>
              ))}
            </div>

            {/* BARIS TANGGAL */}
            {/* Menggunakan grid-rows dinamis berdasarkan jumlah minggu agar sel selalu terbagi rata */}
            <div className="grid grid-cols-7 gap-2 flex-1 min-h-0" style={{ gridTemplateRows: `repeat(${totalWeeks}, minmax(0, 1fr))` }}>
              {calendarDays.map((day, idx) => {
                const today = new Date();
                const isToday = day === today.getDate() && bulan === today.getMonth() + 1 && tahun === today.getFullYear();
                const dayEvents = day ? eventsByDay[day] || [] : [];

                return (
                  <div key={idx} className={`border rounded-xl p-1 flex flex-col justify-between transition min-h-0 overflow-hidden ${!day ? "bg-slate-50/50 border-dashed border-slate-200" : "bg-white hover:border-slate-400"}`}>
                    {day && (
                      <>
                        {/* Penanda Angka Tanggal */}
                        <div className="flex justify-between items-center flex-shrink-0">
                          <div className={`w-5 h-5 flex items-center justify-center text-[11px] font-bold rounded-full ${isToday ? "bg-blue-600 text-white shadow-sm" : "text-slate-700"}`}>{day}</div>
                          {dayEvents.length > 0 && <span className="text-[9px] bg-slate-100 text-slate-600 font-extrabold px-1 py-0.2 rounded-full border">{dayEvents.length}</span>}
                        </div>

                        {/* AREA SPASIAL LABEL KEGIATAN */}
                        {/* Ditambahkan overflow-y-auto jika dalam 1 hari ada event sangat banyak, grid selnya tidak akan rusak jebol keluar */}
                        <div className="mt-1 space-y-1 flex-1 overflow-y-auto min-h-0 pr-0.5 scrollbar-thin">
                          {dayEvents.map((event) => (
                            <button
                              key={event.id}
                              onClick={() => router.push(`/dashboard/kegiatan/${event.id}`)}
                              title={`${event.judul} (${event.waktu_mulai.slice(0, 5)})`}
                              className={`w-full text-left text-[9px] font-bold px-1 py-0.5 rounded border transition truncate block ${
                                event.status === "aktif" ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100" : "bg-slate-50 text-slate-500 border-slate-200 line-through"
                              }`}
                            >
                              {event.waktu_mulai.slice(0, 5)} {event.judul}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
