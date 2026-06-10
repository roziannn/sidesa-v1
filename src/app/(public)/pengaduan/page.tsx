'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from "@/hooks/useToast";

const formSchema = z.object({
  nama: z.string().min(1, "Nama wajib diisi"),
  noTelp: z.string().min(10, "Nomor telepon minimal 10 digit"),
  alamat: z.string().min(1, "Alamat wajib diisi"),
  jenis: z.string(),
  isi: z.string().min(10, "Isi pengaduan minimal 10 karakter"),
});

export default function FormPengaduan() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(data: any) {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      showToast("success", "Berhasil Terkirim", "Terima kasih, pengaduan Anda telah kami terima.");
      reset();
    } catch (error) {
      showToast("error", "Gagal Mengirim", "Terjadi kesalahan saat mengirim pengaduan.");
    } finally {
      setLoading(false);
    }
  }

  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
      {children} <span className="text-red-500">*</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl bg-white p-8 rounded-lg shadow-sm border border-slate-200">
        <div className="mb-8 pb-6 border-b border-slate-100">
          <h1 className="text-xl font-semibold text-slate-900">Form Pengaduan Masyarakat</h1>
          <p className="text-slate-500 text-sm mt-1">Lengkapi data di bawah ini untuk memproses laporan Anda.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Nama Lengkap</Label>
              <input {...register("nama")} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:border-slate-900 outline-none" />
              {errors.nama && <p className="text-red-500 text-[10px] mt-1">{String(errors.nama.message)}</p>}
            </div>

            <div>
              <Label>No. Telepon/WA</Label>
              <input type="number" {...register("noTelp")} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:border-slate-900 outline-none" />
              {errors.noTelp && <p className="text-red-500 text-[10px] mt-1">{String(errors.noTelp.message)}</p>}
            </div>
          </div>

          <div>
            <Label>Alamat</Label>
            <input {...register("alamat")} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:border-slate-900 outline-none" />
            {errors.alamat && <p className="text-red-500 text-[10px] mt-1">{String(errors.alamat.message)}</p>}
          </div>

          <div>
            <Label>Jenis Pengaduan</Label>
            <select {...register("jenis")} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:border-slate-900 outline-none">
              <option value="fasilitas">Fasilitas Umum</option>
              <option value="keamanan">Keamanan</option>
              <option value="kebersihan">Kebersihan</option>
              <option value="lingkungan">Lingkungan</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>

          <div>
            <Label>Isi Pengaduan</Label>
            <textarea {...register("isi")} rows={4} className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-slate-900 focus:border-slate-900 outline-none"></textarea>
            {errors.isi && <p className="text-red-500 text-[10px] mt-1">{String(errors.isi.message)}</p>}
          </div>

          <button disabled={loading} className="w-full bg-slate-900 text-white font-semibold py-2.5 rounded hover:bg-slate-800 transition disabled:opacity-50 uppercase text-sm">
            {loading ? "Memproses..." : "Kirim Pengaduan"}
          </button>
        </form>
      </div>
    </div>
  );
}