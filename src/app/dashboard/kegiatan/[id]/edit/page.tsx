"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import FormKegiatan from "@/components/kegiatan/FormKegiatan";
import { Loader2 } from "lucide-react";

export default function EditKegiatanPage() {
  // 1. Ambil ID dari URL Menggunakan Hooks bawaan Next.js
  const params = useParams();
  const id = params?.id as string;

  // 2. State untuk Data, Loading, dan Error
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchDetailKegiatan = async () => {
      try {
        setLoading(true);

        // Query ke Supabase menggunakan Browser Client yang aman di Client-side
        const { data: kegiatan, error } = await supabaseClient.from("kegiatan").select("*").eq("id", id).single();

        if (error) throw error;

        setData(kegiatan);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        console.error("Error fetching:", err);
        setErrorMsg(err.message || "Gagal mengambil data kegiatan");
      } finally {
        setLoading(false);
      }
    };

    fetchDetailKegiatan();
  }, [id]);

  // 3. Tampilan Loading Spinner
  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        <p className="text-sm text-slate-500 font-medium">Memuat data kegiatan...</p>
      </div>
    );
  }

  // 4. Tampilan Jika Error / Data Tidak Ditemukan
  if (errorMsg || !data) {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-10">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
          <p className="text-red-600 font-bold text-lg">Kegiatan Tidak Ditemukan</p>
          <p className="text-sm text-red-500 font-mono bg-white p-3 rounded-xl border border-red-100">Detail: {errorMsg || "Data kosong"}</p>
          <p className="text-xs text-slate-400">
            Pastikan UUID <span className="underline font-semibold">{id}</span> tersedia di tabel <code className="bg-slate-100 px-1 py-0.5 rounded">kegiatan</code> database Supabase Anda.
          </p>
        </div>
      </div>
    );
  }

  // 5. Tampilan Sukses (Render Form)
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-slate-800">Edit Kegiatan</h1>
      <FormKegiatan mode="edit" initialData={data} />
    </div>
  );
}
