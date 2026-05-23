import React from "react";
import FormKeluarga from "@/components/keluarga/FormKeluarga";

export default function TambahKeluargaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pendaftaran Kartu Keluarga</h1>
        <p className="text-sm text-slate-500 mt-1">Isi formulir di bawah ini dengan lengkap untuk mendaftarkan data KK warga baru.</p>
      </div>

      <FormKeluarga mode="tambah" />
    </div>
  );
}