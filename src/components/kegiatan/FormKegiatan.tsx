/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";
import { Save, Calendar, MapPin, Clock, Users, Info, RefreshCw } from "lucide-react";

interface FormKegiatanProps {
  initialData?: {
    id?: string;
    judul: string;
    deskripsi?: string | null;
    tanggal: string;
    waktu_mulai: string;
    waktu_selesai: string;
    lokasi: string;
    kuota?: number | null;
    status: "aktif" | "nonaktif";
    catatan?: string | null;
  };
  mode: "create" | "edit";
}

export default function FormKegiatan({ initialData, mode }: FormKegiatanProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const [judul, setJudul] = useState(initialData?.judul || "");
  const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi || "");
  const [tanggal, setTanggal] = useState(initialData?.tanggal || "");
  const [waktuMulai, setWaktuMulai] = useState(initialData?.waktu_mulai || "");
  const [waktuSelesai, setWaktuSelesai] = useState(initialData?.waktu_selesai || "");
  const [lokasi, setLokasi] = useState(initialData?.lokasi || "");
  const [kuota, setKuota] = useState<number | "">(initialData?.kuota ?? "");
  const [status, setStatus] = useState<"aktif" | "nonaktif">(initialData?.status || "aktif");

  // STATE KEGIATAN BERULANG (RECURRING EVENTS)
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState<"weekly" | "biweekly" | "monthly">("weekly");
  const [repeatCount, setRepeatCount] = useState<number>(2);

  const isValid = useMemo(() => {
    return judul.length >= 5 && tanggal && waktuMulai && waktuSelesai && lokasi;
  }, [judul, tanggal, waktuMulai, waktuSelesai, lokasi]);

  // LOGIKA MENGHITUNG DAFTAR TANGGAL BERULANG
  const recurringDates = useMemo(() => {
    if (!tanggal || !isRecurring) return [];

    const dates: string[] = [];
    const baseDate = new Date(tanggal);

    for (let i = 0; i < repeatCount; i++) {
      const nextDate = new Date(baseDate);

      if (frequency === "weekly") {
        nextDate.setDate(baseDate.getDate() + i * 7);
      } else if (frequency === "biweekly") {
        nextDate.setDate(baseDate.getDate() + i * 14);
      } else if (frequency === "monthly") {
        nextDate.setMonth(baseDate.getMonth() + i);
      }

      // Format kembali ke YYYY-MM-DD untuk standard input / PostgreSQL date
      const yyyy = nextDate.getFullYear();
      const mm = String(nextDate.getMonth() + 1).padStart(2, "0");
      const dd = String(nextDate.getDate()).padStart(2, "0");
      dates.push(`${yyyy}-${mm}-${dd}`);
    }

    return dates;
  }, [tanggal, isRecurring, frequency, repeatCount]);

  const handleSubmit = async () => {
    if (!isValid) {
      showToast("error", "Validasi gagal", "Mohon isi semua field yang wajib");
      return;
    }
    setLoading(true);

    try {
      const basePayload = {
        judul,
        deskripsi,
        waktu_mulai: waktuMulai,
        waktu_selesai: waktuSelesai,
        lokasi,
        kuota: kuota === "" ? null : Number(kuota),
        status,
      };

      if (mode === "create") {
        if (isRecurring && recurringDates.length > 0) {
          // BATCH INSERT UNTUK KEGIATAN BERULANG
          const batchPayloads = recurringDates.map((dateStr) => ({
            ...basePayload,
            tanggal: dateStr,
          }));

          const { data: insertedData, error } = await supabaseClient.from("kegiatan").insert(batchPayloads).select();

          if (error) throw error;

          showToast("success", "Berhasil", `${insertedData.length} kegiatan berhasil dibuat sekaligus!`);
          // Redirect ke halaman list kegiatan karena datanya banyak
          router.push("/dashboard/kegiatan");
        } else {
          // SINGLE INSERT BIASA
          const { data, error } = await supabaseClient
            .from("kegiatan")
            .insert({ ...basePayload, tanggal })
            .select()
            .single();

          if (error) throw error;

          showToast("success", "Berhasil", "Kegiatan telah disimpan");
          router.push(`/dashboard/kegiatan/${data.id}`);
        }
      } else {
        // UPDATE BIASA (MODE EDIT)
        const { data, error } = await supabaseClient
          .from("kegiatan")
          .update({ ...basePayload, tanggal })
          .eq("id", initialData?.id)
          .select()
          .single();

        if (error) throw error;

        showToast("success", "Berhasil", "Kegiatan telah diperbarui");
        router.push(`/dashboard/kegiatan/${data.id}`);
      }

      router.refresh();
    } catch (err: any) {
      showToast("error", "Gagal", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* FORM SECTION */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <h2 className="font-bold text-slate-800 text-sm uppercase tracking-widest">{mode === "create" ? "Buat Kegiatan Baru" : "Edit Kegiatan"}</h2>
        </div>

        <div className="p-6 space-y-6">
          {/* INFO UTAMA */}
          <section className="space-y-4">
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Nama Program *</label>
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                placeholder='Contoh: "PKH 2026" atau "BLT Dana Desa"'
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Deskripsi</label>
              <textarea
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none h-24"
                placeholder="Detail kegiatan..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
              />
            </div>
          </section>

          {/* DETAIL GRID */}
          <section>
            <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-3">Detail Kegiatan</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputIcon icon={<Calendar className="w-4 h-4 text-slate-400" />} type="date" value={tanggal} onChange={setTanggal} />
              <div className="flex gap-2">
                <InputIcon icon={<Clock className="w-4 h-4 text-slate-400" />} type="time" value={waktuMulai} onChange={setWaktuMulai} />
                <InputIcon icon={<Clock className="w-4 h-4 text-slate-400" />} type="time" value={waktuSelesai} onChange={setWaktuSelesai} />
              </div>
              <InputIcon icon={<MapPin className="w-4 h-4 text-slate-400" />} placeholder="Lokasi kegiatan" value={lokasi} onChange={setLokasi} />
              <InputIcon icon={<Users className="w-4 h-4 text-slate-400" />} type="number" placeholder="Kuota (Opsional)" value={kuota} onChange={setKuota} />
            </div>
          </section>

          {/* SECTION KEGIATAN BERULANG (Hanya muncul saat mode create) */}
          {mode === "create" && (
            <section className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 text-slate-500 ${isRecurring ? "animate-spin-slow" : ""}`} />
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Kegiatan Berulang</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {isRecurring && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Frekuensi Pengulangan</label>
                    <select value={frequency} onChange={(e) => setFrequency(e.target.value as any)} className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white outline-none focus:border-emerald-500">
                      <option value="weekly">Mingguan (Setiap Minggu)</option>
                      <option value="biweekly">Dua Mingguan (2 Minggu Sekali)</option>
                      <option value="monthly">Bulanan (Setiap Bulan)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Jumlah Pengulangan (Maks. 12)</label>
                    <input
                      type="number"
                      min={2}
                      max={12}
                      value={repeatCount}
                      onChange={(e) => setRepeatCount(Math.min(12, Math.max(2, Number(e.target.value))))}
                      className="w-full border border-slate-200 rounded-lg p-2 text-sm bg-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </section>
          )}

          {/* STATUS */}
          <section className="flex items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Status:</span>
            {(["aktif", "nonaktif"] as const).map((s) => (
              <label key={s} className="flex items-center gap-2 cursor-pointer text-sm font-medium capitalize">
                <input type="radio" checked={status === s} onChange={() => setStatus(s)} className="accent-emerald-600" />
                {s}
              </label>
            ))}
          </section>

          <button
            onClick={handleSubmit}
            disabled={!isValid || loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {loading ? "Menyimpan..." : mode === "create" && isRecurring ? "Simpan Semua Kegiatan" : "Simpan Perubahan"}
          </button>
        </div>
      </div>

      {/* PREVIEW SIDEBAR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit sticky top-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-400">
          <Info className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Preview</span>
        </div>

        <div className="space-y-4">
          <p className="font-bold text-slate-800 text-lg leading-snug">{judul || "Nama Program"}</p>
          <div className="space-y-2 text-sm text-slate-600">
            <p>📅 {tanggal ? new Date(tanggal).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "Tanggal belum dipilih"}</p>
            <p>
              ⏰ {waktuMulai || "--"} - {waktuSelesai || "--"}
            </p>
            <p>📍 {lokasi || "Lokasi belum ditentukan"}</p>
          </div>
          {kuota && (
            <div className="pt-3 border-t border-dashed">
              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg">Kuota: {kuota} Orang</span>
            </div>
          )}
        </div>

        {/* PREVIEW DAFTAR TANGGAL RECURRING */}
        {isRecurring && recurringDates.length > 0 && (
          <div className="pt-4 border-t-2 border-slate-100 space-y-2 animate-in fade-in duration-200">
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider block w-fit">Akan Membuat {recurringDates.length} Kegiatan</span>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 max-h-40 overflow-y-auto space-y-1.5 text-xs text-slate-600 font-medium">
              {recurringDates.map((dateStr, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-slate-400 text-[10px]">#{index + 1}</span>
                  <span>{new Date(dateStr).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InputIcon({ icon, type = "text", placeholder, value, onChange }: any) {
  return (
    <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all bg-white">
      {icon}
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full text-sm outline-none bg-transparent" />
    </div>
  );
}
