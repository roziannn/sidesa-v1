import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import KeluargaDetailClient from "@/components/keluarga/KeluargaDetailClient";
import KeluargaDetailLoading from "./loading";

// Memastikan Next.js selalu mengambil data teranyar langsung dari database (No Cache)
export const revalidate = 0;

interface DetailKeluargaPageProps {
  // Sesuai standar Next.js 15, params didefinisikan sebagai Promise
  params: Promise<{
    id: string;
  }>;
}

export default async function DetailKeluargaPage({ params }: DetailKeluargaPageProps) {
  // Mengurai Promise params menggunakan await
  const resolvedParams = await params;

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Membungkus proses fetching data dengan Suspense agar loading skeleton berjalan */}
      <Suspense fallback={<KeluargaDetailLoading />}>
        <KeluargaDetailFetch id={resolvedParams.id} />
      </Suspense>
    </div>
  );
}

// Sub-komponen internal server untuk proses pengambilan data relasional
async function KeluargaDetailFetch({ id }: { id: string }) {
  const supabase = await createClient();

  // Query mengambil data keluarga beserta relasi seluruh anggota di dalamnya
  const { data: keluarga, error } = await supabase
    .from("keluarga")
    .select(`
      id,
      no_kk,
      nama_kepala,
      alamat,
      rt,
      rw,
      created_at,
      anggota (
        id,
        keluarga_id,
        nama,
        nik,
        hubungan,
        tgl_lahir,
        jenis_kelamin
      )
    `)
    .eq("id", id)
    .maybeSingle(); // Aman dari error PGRST116 jika baris data tidak ditemukan

  // Jika terjadi gangguan koneksi sistem database asli
  if (error) {
    console.error("❌ DETAIL FETCH ERROR:", error);
    notFound();
  }

  // Jika data keluarga bernilai null (ID tidak valid atau sudah terhapus)
  if (!keluarga) {
    notFound();
  }

  // Kirim data yang valid ke komponen visual interaktif klien
  return <KeluargaDetailClient keluarga={keluarga as any} />;
}