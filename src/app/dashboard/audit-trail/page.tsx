import AuditTrailClient from '@/components/audit-trail/AuditTrailClient';
import { History } from 'lucide-react';

async function getData() {
  return [
    {
      id: '1',
      waktu: new Date('2026-06-12T08:15:00'),
      pengguna: 'Admin RT',
      modul: 'Pengaduan',
      aktivitas: 'Mengubah status pengaduan menjadi Diproses',
      ipAddress: '192.168.1.10',
      status: 'berhasil',
    },
    {
      id: '2',
      waktu: new Date('2026-06-12T08:30:00'),
      pengguna: 'Admin RW',
      modul: 'Surat',
      aktivitas: 'Menyetujui Surat Keterangan Domisili',
      ipAddress: '192.168.1.11',
      status: 'berhasil',
    },
    {
      id: '3',
      waktu: new Date('2026-06-12T09:00:00'),
      pengguna: 'Operator Desa',
      modul: 'Bansos',
      aktivitas: 'Gagal memperbarui data penerima bantuan',
      ipAddress: '192.168.1.12',
      status: 'gagal',
    },
    {
      id: '4',
      waktu: new Date('2026-06-12T09:20:00'),
      pengguna: 'Admin RT',
      modul: 'Penduduk',
      aktivitas: 'Menambahkan data penduduk baru',
      ipAddress: '192.168.1.15',
      status: 'berhasil',
    },
    {
      id: '5',
      waktu: new Date('2026-06-12T10:05:00'),
      pengguna: 'Sekretaris Desa',
      modul: 'Surat',
      aktivitas: 'Menolak permohonan surat usaha',
      ipAddress: '192.168.1.18',
      status: 'berhasil',
    },
  ];
}

export default async function AuditTrailPage() {
  const data = await getData();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shadow-sm">
          <History className="w-5 h-5 stroke-[2.25]" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Audit Trail
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Riwayat aktivitas pengguna dalam sistem.
          </p>
        </div>
      </div>

      <AuditTrailClient data={data} />
    </div>
  );
}