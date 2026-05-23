import React, { Suspense } from "react";
import { HandHeart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import BansosClient from "@/components/bansos/BansosClient";

// Memastikan Next.js selalu mengambil data teranyar langsung dari database (No Cache)
export const revalidate = 0;

export default function BansosPage() {
  return (
    <div className="space-y-6">
      {/* Title Header Menu */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center border border-emerald-100 shadow-sm">
          <HandHeart className="w-5 h-5 stroke-[2.25]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Bantuan Sosial</h1>
          <p className="text-sm text-slate-500 mt-0.5">Pantau penyaluran dana stimulan, verifikasi data jaring pengaman, serta klasterisasi bansos berkala warga.</p>
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

  // PERBAIKAN UTAMA: Query Join Dua Tabel Sesuai ERD Asli (bansos -> profiles via penerima_id)
  const { data: bansosRaw, error } = await supabase
    .from("bansos")
    .select(`
      id,
      nama_program,
      penerima_id,
      jumlah_bantuan,
      periode,
      status,
      catatan,
      created_at,
      profiles!penerima_id (
        nama,
        rt,
        rw
      )
    `);

  if (error || !bansosRaw) {
    console.error("❌ GAGAL FETCH DATA BANSOS SUPABASE:", error);
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-sm font-medium">
        <p>Gagal memuat sistem data jaminan sosial.</p>
        <p className="text-xs text-red-500 font-mono mt-1">Pesan Error: {error?.message || "Data baris kosong"}</p>
      </div>
    );
  }

  return <BansosClient initialData={bansosRaw as any} />;
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