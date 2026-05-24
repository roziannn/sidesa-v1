/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";
import { Save, Calendar, MapPin, Clock, Users, Info } from "lucide-react";

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

  const today = new Date().toISOString().split("T")[0];

  const isValid = useMemo(() => {
    return judul.length >= 5 && tanggal && waktuMulai && waktuSelesai && lokasi;
  }, [judul, tanggal, waktuMulai, waktuSelesai, lokasi]);

  const handleSubmit = async () => {
    if (!isValid) {
      showToast("error", "Validasi gagal", "Mohon isi semua field yang wajib");
      return;
    }
    setLoading(true);
    try {
      const payload = { judul, deskripsi, tanggal, waktu_mulai: waktuMulai, waktu_selesai: waktuSelesai, lokasi, kuota: kuota === "" ? null : Number(kuota), status };
      let result;
      if (mode === "create") {
        result = await supabaseClient.from("kegiatan").insert(payload).select().single();
      } else {
        result = await supabaseClient.from("kegiatan").update(payload).eq("id", initialData?.id).select().single();
      }
      if (result.error) throw result.error;
      showToast("success", "Berhasil", "Kegiatan telah disimpan");
      router.push(`/dashboard/kegiatan/${result.data.id}`);
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

        <div className="p-6 space-y-8">
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

          <button onClick={handleSubmit} disabled={!isValid || loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>

      {/* PREVIEW SIDEBAR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-fit sticky top-6">
        <div className="flex items-center gap-2 text-slate-400 mb-4">
          <Info className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Preview</span>
        </div>
        <div className="space-y-4">
          <p className="font-bold text-slate-800 text-lg leading-snug">{judul || "Nama Program"}</p>
          <div className="space-y-2 text-sm text-slate-600">
            <p>📅 {tanggal || "Tanggal belum dipilih"}</p>
            <p>
              ⏰ {waktuMulai || "--"} - {waktuSelesai || "--"}
            </p>
            <p>📍 {lokasi || "Lokasi belum ditentukan"}</p>
          </div>
          {kuota && (
            <div className="pt-4 border-t">
              <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg">Kuota: {kuota} Orang</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sub-komponen Input agar kodingan bersih
function InputIcon({ icon, type = "text", placeholder, value, onChange }: any) {
  return (
    <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all bg-white">
      {icon}
      <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full text-sm outline-none bg-transparent" />
    </div>
  );
}
