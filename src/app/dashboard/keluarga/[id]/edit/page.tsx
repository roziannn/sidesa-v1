import React from "react";
import FormKeluarga from "@/components/keluarga/FormKeluarga";

interface EditKeluargaPageProps {
  // Di Next.js 15, params didefinisikan sebagai Promise
  params: Promise<{
    id: string;
  }>;
}

// Tambahkan async pada function komponen agar bisa menggunakan await
export default async function EditKeluargaPage({ params }: EditKeluargaPageProps) {
  const resolvedParams = await params;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Perbarui Data Kartu Keluarga</h1>
        <p className="text-sm text-slate-500 mt-1">Ubah informasi berkas kependudukan di bawah ini. Perubahan akan langsung disinkronkan ke database desa.</p>
      </div>

      {/* Sekarang gunakan properti dari params yang sudah di-await */}
      <FormKeluarga mode="edit" idKeluarga={resolvedParams.id} />
    </div>
  );
}