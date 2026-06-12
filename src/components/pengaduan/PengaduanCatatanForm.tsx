'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';
import { z } from 'zod';

import { supabaseClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/useToast';

const catatanSchema = z.object({
  catatan: z
    .string()
    .trim()
    .min(20, 'Catatan petugas minimal 20 karakter'),
});

export default function CatatanPetugasForm({
  id,
  initialValue,
}: {
  id: string;
  initialValue: string;
}) {
  const [catatan, setCatatan] = useState(initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { showToast } = useToast();

  const handleSubmit = async () => {
    const result = catatanSchema.safeParse({
      catatan,
    });

    if (!result.success) {
      const message = result.error.issues[0].message;

      setError(message);

      showToast(
        'warning',
        'Validasi Gagal',
        message
        );

      return;
    }

    setError('');

    try {
      setLoading(true);

      const { error } = await supabaseClient
        .from('pengaduan')
        .update({
          catatan_petugas: catatan.trim(),
        })
        .eq('id', id);

      if (error) throw error;

      showToast(
        'success',
        'Berhasil',
        'Catatan petugas berhasil disimpan.'
        );
    } catch (error) {
      console.error(error);

      showToast(
        'error',
        'Gagal',
        'Gagal menyimpan catatan petugas.'
        );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label className="mb-3 block text-sm font-semibold text-gray-900">
        Catatan Petugas
      </label>

      <textarea
        rows={5}
        value={catatan}
        onChange={(e) => {
          setCatatan(e.target.value);

          if (error) {
            setError('');
          }
        }}
        placeholder="Masukkan catatan atau tindak lanjut pengaduan..."
        className={`w-full rounded-lg border px-4 py-3 text-sm focus:outline-none focus:ring-0 ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />

      <div className="mt-1 flex items-center justify-between">
        <div>
          {error && (
            <p className="text-xs text-red-600">
              {error}
            </p>
          )}
        </div>

        <span className="text-xs text-slate-500">
          Minimal 20 karakter
        </span>
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />

          {loading ? 'Menyimpan...' : 'Simpan Catatan'}
        </button>
      </div>
    </div>
  );
}