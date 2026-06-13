'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { useToast } from '@/hooks/useToast';

const surveySchema = z.object({
  nama: z.string().min(3, 'Nama wajib diisi'),

  telepon: z
    .string()
    .regex(
      /^08[0-9]{8,11}$/,
      'Nomor HP tidak valid'
    ),

  pelayanan: z.string().min(
    1,
    'Pilih jenis pelayanan'
  ),

  q1: z.string().min(1, 'Pertanyaan 1 wajib diisi'),
  q2: z.string().min(1, 'Pertanyaan 2 wajib diisi'),
  q3: z.string().min(1, 'Pertanyaan 3 wajib diisi'),
  q4: z.string().min(1, 'Pertanyaan 4 wajib diisi'),
  q5: z.string().min(1, 'Pertanyaan 5 wajib diisi'),

  saran: z.string().optional(),
});

type SurveyForm = z.infer<
  typeof surveySchema
>;

export default function SurveyKepuasanPage() {
  const [loading, setLoading] =
    useState(false);


  const [showSuccessModal, setShowSuccessModal] =
  useState(false);

  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
formState: { errors },
    reset,
  } = useForm<SurveyForm>({
    resolver:
      zodResolver(surveySchema),
  });

    const questions = [
    'Kemudahan prosedur pelayanan',
    'Kecepatan pelayanan',
    'Keramahan petugas',
    'Kejelasan informasi',
    'Kepuasan terhadap pelayanan secara keseluruhan',
    ];

    const pelayananOptions = [
    'Surat Keterangan Domisili',
    'Surat Keterangan Usaha',
    'Surat Pengantar KTP',
    'Surat Pengantar KK',
    'Bantuan Sosial',
    'Pengaduan Masyarakat',
    'Pelayanan Umum',
    ];

  const onSubmit = async (
  data: SurveyForm
    ) => {
      try {
        setLoading(true);

        const response =
          await fetch(
            '/api/survey-kepuasan',
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
          'Survey Berhasil Dikirim',
          'Terima kasih atas penilaian dan masukan yang telah Anda berikan.'
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
    };

  return (
  <div className="min-h-screen bg-slate-100 py-12 px-4">
    <div className="mx-auto max-w-4xl">
      <div className="overflow-hidden rounded-2xl shadow-sm">
        <div className="bg-gradient-to-r from-emerald-600 to-green-700 px-8 py-10 text-white">
          <h1 className="text-3xl font-bold">
            Survey Kepuasan Masyarakat
          </h1>
          <p className="mt-2 text-emerald-50">
            Penilaian Anda membantu kami meningkatkan kualitas pelayanan desa.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-6 space-y-5"
      >
        {/* Data Responden */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-slate-900">
            Data Responden
          </h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-slate-900 font-medium">
                Nama
              </label>

              <input
                {...register('nama')}
                className="w-full rounded-xl border border-slate-300 text-slate-900 px-4 py-3 focus:border-emerald-500 focus:outline-none"
              />

              {errors.nama && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.nama.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-900 font-medium">
                Nomor Telepon
              </label>

              <input
              type="tel"
                inputMode="numeric"
                maxLength={13}
                onInput={(e) => {
                  e.currentTarget.value =
                    e.currentTarget.value.replace(
                      /\D/g,
                      ''
                    );
                }}
                {...register('telepon')}
                className="w-full rounded-xl border border-slate-300 text-slate-900 px-4 py-3 focus:border-emerald-500 focus:outline-none">
                </input>
              {errors.telepon && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.telepon.message}
                </p>
              )}
            </div>

            <div>
                <label className="mb-2 block text-sm font-medium text-slate-900">
                    Jenis Pelayanan
                </label>

                <select
                    {...register('pelayanan')}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-emerald-500 focus:outline-none"
                >
                    <option value="">
                    Pilih Pelayanan
                    </option>

                    {pelayananOptions.map(
                    (pelayanan) => (
                        <option
                        key={pelayanan}
                        value={pelayanan}
                        >
                        {pelayanan}
                        </option>
                    )
                    )}
                </select>

                {errors.pelayanan && (
                    <p className="mt-1 text-xs text-red-500">
                    {errors.pelayanan.message}
                    </p>
                )}
                </div>
          </div>
        </div>

        {/* Pertanyaan */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="mb-6 text-lg font-semibold text-slate-900">
            Penilaian Pelayanan
        </h2>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <div
              key={index}
              className="border-b border-slate-100 pb-6 last:border-0 last:pb-0"
            >
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-800">
                  {index + 1}. {question}
                </p>
              </div>

              <div className="flex items-center justify-between mb-3 text-xs font-medium text-slate-500">
                <span>Sangat Tidak Puas</span>
                <span>Sangat Puas</span>
              </div>

              <div className="flex justify-center gap-8">
                {[1, 2, 3, 4, 5].map((value) => (
                 <label
                      key={value}
                      className="group cursor-pointer"
                    >
                    <input
                      type="radio"
                      value={value}
                      className="peer hidden"
                      {...register(
                        `q${index + 1}` as keyof SurveyForm
                      )}
                    />

                    <div
                    className="
                      flex h-12 w-12 items-center justify-center
                      rounded-full border-2 border-slate-300
                      bg-white text-sm font-semibold text-slate-600
                      transition

                      group-hover:border-emerald-500

                      peer-checked:border-emerald-600
                      peer-checked:bg-emerald-600
                      peer-checked:text-white
                    "
                  >
                    {value}
                  </div>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        </div>

        {/* Saran */}
        <div className="rounded-2xl bg-white p-8 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Saran & Masukan
          </h2>

          <textarea
            rows={5}
            {...register('saran')}
            placeholder="Tuliskan saran atau masukan Anda..."
           className="w-full rounded-xl border border-slate-300 text-slate-900 px-4 py-3 focus:border-emerald-500 focus:outline-none resize-none"
          />
        </div>

        {/* Submit */}
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
            ? 'Mengirim Survey...'
            : 'Kirim Survey'}
        </button>
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
                Survey Berhasil Dikirim
              </h2>

              <p className="mt-3 text-sm text-slate-600">
                Terima kasih atas penilaian dan masukan yang
                telah Anda berikan. Pendapat Anda sangat
                membantu kami dalam meningkatkan kualitas
                pelayanan desa.
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