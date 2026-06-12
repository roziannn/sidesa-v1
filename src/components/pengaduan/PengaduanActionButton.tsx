'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  XCircle,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

import { supabaseClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/useToast';

type PengaduanActionButtonsProps = {
  id: string;
  status: string;
};

export default function PengaduanActionButtons({
  id,
  status,
}: PengaduanActionButtonsProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [loadingStatus, setLoadingStatus] = useState<string | null>(null);

  const updateStatus = async (nextStatus: string) => {
    setLoadingStatus(nextStatus);

    try {
      const { error } = await supabaseClient
        .from('pengaduan')
        .update({
          status: nextStatus,
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      showToast(
        'success',
        'Berhasil',
        `Status pengaduan berhasil diubah menjadi ${nextStatus}.`
      );

      router.refresh();
    } catch (error) {
      showToast(
        'error',
        'Gagal',
        'Status pengaduan gagal diperbarui.'
      );
    } finally {
      setLoadingStatus(null);
    }
  };

  const isLoading = loadingStatus !== null;

  if (status === 'Menunggu') {
    return (
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => updateStatus('Ditolak')}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingStatus === 'Ditolak' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          Tolak
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => updateStatus('Diproses')}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loadingStatus === 'Diproses' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          Terima
        </button>
      </div>
    );
  }

 if (status === 'Diproses') {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={isLoading}
        onClick={() => updateStatus('Perlu Tindak Lanjut')}
        className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loadingStatus === 'Perlu Tindak Lanjut' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <AlertTriangle className="h-4 w-4" />
        )}
        Perlu Tindak Lanjut
      </button>

      <button
        type="button"
        disabled={isLoading}
        onClick={() => updateStatus('Selesai')}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loadingStatus === 'Selesai' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        Selesai
      </button>
    </div>
  );
}

if (status === 'Perlu Tindak Lanjut') {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        disabled={isLoading}
        onClick={() => updateStatus('Selesai')}
        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loadingStatus === 'Selesai' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        Selesai
      </button>
    </div>
  );
}

  return null;
}