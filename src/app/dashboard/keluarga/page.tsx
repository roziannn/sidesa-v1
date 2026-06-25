import React, { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import KeluargaClient from "@/components/keluarga/KeluargaClient";
import { DashboardPageSkeleton } from "@/components/loading/PageSkeleton";

// Memastikan Next.js selalu mengambil data teranyar langsung dari database (No Cache)
export const revalidate = 0;

export default function KeluargaPage() {
  return (
    <Suspense fallback={<DashboardPageSkeleton statsCount={1} showFilters={true} tableRows={8} />}>
      <KeluargaServerFetch />
    </Suspense>
  );
}

async function KeluargaServerFetch() {
  const supabase = await createClient();

  // 1. Eksekusi query mengambil kolom sesuai ERD (no_kk, nama_kepala, rt, rw, alamat)
  // Serta melakukan sub-query aggregate untuk menghitung jumlah baris di tabel anggota (keluarga_id)
  const { data: keluargaRaw, error } = await supabase
    .from("keluarga")
    .select(`
      id,
      no_kk,
      nama_kepala,
      rt,
      rw,
      alamat,
      updated_at,
      anggota(count)
    `);

  // Jika ada kendala koneksi atau salah nama tabel, tampilkan log debug yang ramah
  if (error || !keluargaRaw) {
    console.error("❌ GAGAL FETCH SUPABASE:", error);
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm space-y-2">
        <p className="font-bold">Gagal memuat data Kartu Keluarga.</p>
        <p className="text-xs text-red-600">Pesan Sistem: {error?.message || "Data kosong"}</p>
        <p className="text-xs text-slate-400 font-mono mt-1">Saran: Pastikan tabel &apos;keluarga&apos; dan &apos;anggota&apos; sudah memiliki data atau RLS Policy di Supabase diizinkan.</p>
      </div>
    );
  }

  // 2. Transformasi data mentah dari Supabase ke format properti yang diminta oleh KeluargaClient
  const cleanedData = keluargaRaw.map((k) => ({
    id: k.id,
    nomor_kk: k.no_kk, // Memetakan 'no_kk' dari database ke 'nomor_kk' milik DataTable
    nama_kepala: k.nama_kepala || "Belum Diisi", // Mengambil kolom nama_kepala string langsung
    alamat: k.alamat,
    updated_at: k.updated_at,
    rt: k.rt || "00",
    rw: k.rw || "00",
    jumlah_anggota: k.anggota && k.anggota[0] ? Number(k.anggota[0].count) : 0,
  }));

  return <KeluargaClient initialData={cleanedData} totalKK={cleanedData.length} />;
}
