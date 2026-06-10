import React, { Suspense } from "react";
import { HandHeart, FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import BansosClient from "@/components/bansos/BansosClient";
import Link from "next/link";

// Memastikan Next.js selalu mengambil data teranyar langsung dari database (No Cache)
export const revalidate = 0;

export default function BansosPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-2 sm:pb-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center border border-emerald-100 shadow-sm">
            <HandHeart className="w-5 h-5 stroke-[2.25]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Bantuan Sosial</h1>
            <p className="text-sm text-slate-500 mt-0.5">Pantau penyaluran dana stimulan, verifikasi data jaring pengaman, serta klasterisasi bansos berkala warga.</p>
          </div>
        </div>

        {/* Tombol Navigasi ke Halaman Laporan */}
        <div className="shrink-0">
          <Link
            href="/dashboard/bansos/laporan"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 shadow-sm transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
            Lihat Laporan Bansos
          </Link>
        </div>
      </div>

      {/* Streaming Layer Fetching */}
      <Suspense fallback={<BansosLoadingSkeleton />}>
        <BansosFetchData />
      </Suspense>
    </div>
  );
}

async function BansosFetchData() {
  const supabase = await createClient();

  // 1. Fetch data bansos beserta relasi profil dan anggota keluarga
  const { data: bansosRaw, error: bansosError } = await supabase.from("bansos").select(`
    id,
    nama_program,
    penerima_id,
    jumlah_bantuan,
    periode,
    status,
    catatan,
    created_at,
    profiles (  
      nama,
      rt,
      rw
    ),
    anggota:penerima_id (
      nama
    )
  `);

  // 2. Fetch data warga dari tabel profiles untuk opsi dropdown tambah penerima
  const { data: profilesRaw, error: profilesError } = await supabase.from("profiles").select("id, nama, rt, rw").order("nama", { ascending: true });

  // 3. Fetch data anggota keluarga juga jika bansos bisa ditujukan langsung ke anggota tertentu
  const { data: anggotaRaw, error: anggotaError } = await supabase.from("anggota").select("id, nama").order("nama", { ascending: true });

  // Pengecekan error handling
  if (bansosError || profilesError || anggotaError) {
    console.error("❌ GAGAL FETCH DATA SUPABASE:", { bansosError, profilesError, anggotaError });
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
        <p>Gagal memuat sistem data jaminan sosial atau data master warga.</p>
        <p className="text-xs text-red-500 font-mono mt-1">Pesan Error: {bansosError?.message || profilesError?.message || anggotaError?.message || "Data baris kosong"}</p>
      </div>
    );
  }

  // 4. Gabungkan data profiles dan anggota untuk dilempar ke dropdown client component
  const daftarWargaDropdown = [
    ...(profilesRaw || []).map((p) => ({
      id: p.id,
      nama: p.nama,
      rt: p.rt || "00",
      rw: p.rw || "00",
    })),
    ...(anggotaRaw || []).map((a) => ({
      id: a.id,
      nama: a.nama,
      rt: "00",
      rw: "00",
    })),
  ];

  // Hilangkan duplikasi jika ada ID yang sama persis antara profiles dan anggota
  const uniqueWargaDropdown = Array.from(new Map(daftarWargaDropdown.map((item) => [item.id, item])).values());

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <BansosClient initialData={bansosRaw as any} daftarWarga={uniqueWargaDropdown} />;
}

// Komponen Shimmer Placeholder Transisi
function BansosLoadingSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white h-32 rounded-xl border border-slate-200 p-4 shadow-sm" />
        ))}
      </div>
      <div className="bg-white h-16 rounded-xl border border-slate-200" />
      <div className="bg-white h-64 rounded-xl border border-slate-200" />
    </div>
  );
}
