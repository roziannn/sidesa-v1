import { notFound } from 'next/navigation';
import StatusBadge from '@/components/StatusBadge';
import { createClient } from '@/lib/supabase/server';
import PengaduanActionButtons from '@components/pengaduan/PengaduanActionButton';
import CatatanPetugasForm from '@components/pengaduan/PengaduanCatatanForm';
import {formatDate, formatDateTime} from '@/lib/format';

async function getPengaduan(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('pengaduan')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}


export default async function DetailPengaduanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const pengaduan = await getPengaduan(id);

  if (!pengaduan) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Detail Pengaduan
          </h1>

          <p className="text-sm text-gray-500">
            Tinjau dan tindak lanjuti laporan warga.
          </p>
        </div>

      <PengaduanActionButtons
        id={pengaduan.id}
        status={pengaduan.status}
      />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="font-semibold text-gray-900">
            Informasi Pengaduan
          </h2>

          <StatusBadge status={pengaduan.status} />
        </div>

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
            <div className="border-b border-gray-200 pb-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                ID Pengaduan
              </p>

              <p className="mt-2 break-all text-sm font-semibold text-gray-900">
                {pengaduan.id}
              </p>
            </div>

            <div className="border-b border-gray-200 pb-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Nama Warga
              </p>

              <p className="mt-2 text-sm font-semibold text-gray-900">
                {pengaduan.nama_warga}
              </p>
            </div>

            <div className="border-b border-gray-200 pb-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Jenis Pengaduan
              </p>

              <p className="mt-2 text-sm font-semibold text-gray-900">
                {pengaduan.jenis}
              </p>
            </div>

            <div className="border-b border-gray-200 pb-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Tanggal Pengaduan
              </p>
             <p className="mt-2 text-sm font-semibold text-gray-900">
              {formatDateTime(pengaduan.tanggal)}
            </p>
            </div>

            <div className="border-b border-gray-200 pb-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Prioritas
              </p>

              <div className="mt-2">
                <StatusBadge
                  status={pengaduan.prioritas}
                />
              </div>
            </div>

            <div className="border-b border-gray-200 pb-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Petugas
              </p>

              <p className="mt-2 text-sm font-semibold text-gray-900">
                {pengaduan.petugas ?? '-'}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Isi Pengaduan
            </h3>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              {pengaduan.isi_pengaduan}
            </div>
          </div>

          <CatatanPetugasForm
              id={pengaduan.id}
              initialValue={
                pengaduan.catatan_petugas ?? ''
              }
          />
        </div>
      </div>
    </div>
  );
}