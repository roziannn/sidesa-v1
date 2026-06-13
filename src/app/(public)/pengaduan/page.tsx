'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/useToast';
import * as z from 'zod';


const formSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),

  noTelp: z
    .string()
    .regex(
      /^08[0-9]{8,11}$/,
      'Nomor HP tidak valid'
    ),

  alamat: z.string().min(
    1,
    'Alamat wajib diisi'
  ),

  jenis: z.string().min(
    1,
    'Jenis pengaduan wajib dipilih'
  ),

  isi: z.string().min(
    10,
    'Isi pengaduan minimal 10 karakter'
  ),
});

type FormPengaduanData = z.infer<
  typeof formSchema
>;

const jenisPengaduan = [
  'Fasilitas Umum',
  'Keamanan',
  'Kebersihan',
  'Lingkungan',
  'Lainnya',
];

export default function FormPengaduan() {
  const [loading, setLoading] =
    useState(false);

  const [showSuccessModal, setShowSuccessModal] =
    useState(false);

  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormPengaduanData>({
    resolver: zodResolver(formSchema),
  });

  async function onSubmit(
  data: FormPengaduanData
) {
  setLoading(true);

  try {
    const response =
      await fetch(
        '/api/pengaduan',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify(
            data
          ),
        }
      );

    const result =
      await response.json();

    if (!response.ok) {
      throw new Error(
        result.message
      );
    }

    showToast(
      'success',
      'Berhasil Terkirim',
      'Terima kasih, pengaduan Anda telah kami terima.'
    );

    setShowSuccessModal(true);

    reset();
  } catch (error: any) {
    showToast(
      'error',
      'Gagal Mengirim',
      error.message
    );
  } finally {
    setLoading(false);
  }
}

  const inputClass =
    'w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none';

  const Label = ({
    children,
  }: {
    children: React.ReactNode;
  }) => (
    <label className="mb-2 block text-sm font-medium text-slate-900">
      {children}
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="overflow-hidden rounded-2xl shadow-sm">
          <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-8 py-10 text-white">
            <h1 className="text-3xl font-bold">
              Form Pengaduan Masyarakat
            </h1>

            <p className="mt-2 text-emerald-50">
              Sampaikan keluhan, masukan,
              atau laporan Anda kepada
              pemerintah desa.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(
            onSubmit
          )}
          className="mt-6"
        >
          <div className="space-y-6 rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Data Pengaduan
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>
                  Nama Lengkap
                </Label>

                <input
                  {...register('nama')}
                  className={
                    inputClass
                  }
                />

                {errors.nama && (
                  <p className="mt-1 text-xs text-red-500">
                    {
                      errors.nama
                        .message
                    }
                  </p>
                )}
              </div>

              <div>
                <Label>
                  Nomor Telepon / WA
                </Label>

                <input
                  type="tel"
                  maxLength={13}
                  {...register(
                    'noTelp'
                  )}
                  className={
                    inputClass
                  }
                />

                {errors.noTelp && (
                  <p className="mt-1 text-xs text-red-500">
                    {
                      errors.noTelp
                        .message
                    }
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label>Alamat</Label>

              <input
                {...register(
                  'alamat'
                )}
                className={
                  inputClass
                }
              />

              {errors.alamat && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    errors.alamat
                      .message
                  }
                </p>
              )}
            </div>

            <div>
              <Label>
                Jenis Pengaduan
              </Label>

              <select
                {...register(
                  'jenis'
                )}
                className={
                  inputClass
                }
              >
                <option value="">
                  Pilih Jenis
                  Pengaduan
                </option>

                {jenisPengaduan.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>

              {errors.jenis && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    errors.jenis
                      .message
                  }
                </p>
              )}
            </div>

            <div>
              <Label>
                Isi Pengaduan
              </Label>

              <textarea
                rows={6}
                {...register('isi')}
                placeholder="Tuliskan pengaduan Anda secara lengkap..."
                className={`${inputClass} resize-none`}
              />

              {errors.isi && (
                <p className="mt-1 text-xs text-red-500">
                  {
                    errors.isi
                      .message
                  }
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full rounded-2xl
                bg-emerald-600 py-4
                text-sm font-semibold text-white  
                transition
                hover:bg-emerald-700
                disabled:opacity-50
              "
            >
              {loading
                ? 'Mengirim Pengaduan...'
                : 'Kirim Pengaduan'}
            </button>
          </div>
        </form>
        {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
                <svg
                  className="h-10 w-10 text-emerald-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <h2 className="mt-6 text-2xl font-bold text-slate-900">
                Pengaduan Berhasil Terkirim
              </h2>

              <p className="mt-3 text-sm text-slate-600">
                Terima kasih atas partisipasi Anda.
                Pengaduan yang dikirim akan
                segera diteruskan kepada petugas
                terkait untuk ditindaklanjuti.
              </p>

              <button
                onClick={() =>
                  setShowSuccessModal(false)
                }
                className="mt-8 w-full rounded-2xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}