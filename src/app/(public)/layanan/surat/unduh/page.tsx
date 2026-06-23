'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/useToast';
import * as z from 'zod';
import { Download } from 'lucide-react';

const formSchema = z.object({
  nik: z.string().length(16, 'NIK harus 16 digit'),
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
  jenisSurat: z.string().min(1, 'Jenis surat wajib dipilih'),
});

type FormSuratData = z.infer<typeof formSchema>;

const daftarSurat = [
  'Surat Keterangan KTP',
  'Surat Keterangan Domisili',
  'Surat Keterangan Usaha',
  'Surat Pengantar Nikah',
];

export default function LayananSuratPage() {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<FormSuratData>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(data: FormSuratData) {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('success', 'Berhasil', 'Surat sedang disiapkan untuk diunduh.');
    }, 1500);
  }

  const inputClass = 'w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none';
  const Label = ({ children }: { children: React.ReactNode }) => (
    <label className="mb-2 block text-sm font-medium text-slate-900">{children}</label>
  );

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="overflow-hidden rounded-2xl shadow-sm">
          <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-8 py-10 text-white">
            <h1 className="text-3xl font-bold">Layanan Surat Mandiri</h1>
            <p className="mt-2 text-emerald-50">
              Masukkan data diri Anda untuk mengunduh dokumen layanan desa secara praktis.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-6">
          <div className="space-y-6 rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Data Pemohon</h2>

            <div>
              <Label>Nomor Induk Kependudukan (NIK)</Label>
              <input {...register('nik')} maxLength={16} placeholder="Masukkan 16 digit NIK" className={inputClass} />
              {errors.nik && <p className="mt-1 text-xs text-red-500">{errors.nik.message}</p>}
            </div>

            <div>
              <Label>Tanggal Lahir</Label>
              <input type="date" {...register('tanggalLahir')} className={inputClass} />
              {errors.tanggalLahir && <p className="mt-1 text-xs text-red-500">{errors.tanggalLahir.message}</p>}
            </div>

            <div>
              <Label>Jenis Surat</Label>
              <select {...register('jenisSurat')} className={inputClass}>
                <option value="">Pilih Jenis Surat...</option>
                {daftarSurat.map((surat) => (
                  <option key={surat} value={surat}>{surat}</option>
                ))}
              </select>
              {errors.jenisSurat && <p className="mt-1 text-xs text-red-500">{errors.jenisSurat.message}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? 'Memproses...' : (
                <>
                  <Download className="w-4 h-4" /> Unduh Dokumen
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}