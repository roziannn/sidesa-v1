import StatusBadge from '@/components/StatusBadge';
import { CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

async function getPengaduan(id: string) {
  return {
    id,
    nama: 'Budi Santoso',
    jenis: 'Kebersihan',
    isi: 'Sampah tidak diangkut selama 2 hari berturut-turut sehingga menimbulkan bau tidak sedap di lingkungan sekitar. Mohon segera ditindaklanjuti.',
    status: 'Pending' as const,
    tanggal: '12 Juni 2026',
  };
}

export default async function DetailPengaduanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pengaduan = await getPengaduan(id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          {/* <Link
            href="/dashboard/pengaduan"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Kembali ke daftar pengaduan
          </Link> */}

          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            Detail Pengaduan
          </h1>

          <p className="text-sm text-gray-500">
            Tinjau dan tindak lanjuti laporan warga.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700"
          >
            <XCircle className="h-4 w-4" />
            Tolak
          </button>

          <button
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            <CheckCircle2 className="h-4 w-4" />
            Terima
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <h2 className="font-semibold text-gray-900">
            Informasi Pengaduan
        </h2>

        <StatusBadge status={pengaduan.status} />
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-2">
  <div className="border-b border-gray-200 pb-3">
    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
      ID Pengaduan
    </p>
    <p className="mt-2 text-sm font-semibold text-gray-900">
      #PGD-{pengaduan.id.padStart(4, '0')}
    </p>
  </div>

  <div className="border-b border-gray-200 pb-3">
    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
      Nama Warga
    </p>
    <p className="mt-2 text-sm font-semibold text-gray-900">
      {pengaduan.nama}
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
      {pengaduan.tanggal}
    </p>
  </div>
</div>

          {/* Isi Pengaduan */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Isi Pengaduan
            </h3>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
              {pengaduan.isi}
            </div>
          </div>

          {/* Catatan Petugas */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-900">
              Catatan Petugas
            </label>

            <textarea
              rows={5}
              placeholder="Masukkan catatan atau tindak lanjut pengaduan..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}