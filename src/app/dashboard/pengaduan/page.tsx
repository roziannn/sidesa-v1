import PengaduanClient from '@components/pengaduan/PengaduanClient';
import { FilesIcon, FileWarning } from 'lucide-react';

async function getData() {
  return [
   {
  id: "1",
  nama: "Budi Santoso",
  jenis: "Kebersihan",
  isi: "Sampah tidak diangkut 2 hari",
  tanggal: "2026-06-10",
  updatedAt: new Date("2026-06-10"),
  petugasPenanganan: "-",
  catatanPetugas: "-",
  prioritas: "Sedang" as const,
  status: "pending" as const,
},
{
  id: "2",
  nama: "Siti Rahma",
  jenis: "Fasilitas",
  isi: "Lampu jalan mati",
  tanggal: "2026-06-08",
  updatedAt: new Date("2026-06-11"),
  petugasPenanganan: "Admin RT",
  catatanPetugas: "Pengaduan sedang diproses.",
  prioritas: "Tinggi" as const,
  status: "diproses" as const,
},
{
  id: "3",
  nama: "Agus Jaya",
  jenis: "Keamanan",
  isi: "Gerbang rusak",
  tanggal: "2026-06-05",
  updatedAt: new Date("2026-06-09"),
  petugasPenanganan: "Admin RW",
  catatanPetugas: "Pengaduan telah selesai.",
  prioritas: "Rendah" as const,
  status: "selesai" as const,
},
  ];
}

export default async function PengaduanPage() {
  const data = await getData();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center border border-emerald-100 shadow-sm">
          <FilesIcon className="w-5 h-5 stroke-[2.25]" />
        </div>

        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Daftar Pengaduan
          </h1>

          <p className="text-sm text-slate-500 mt-0.5">
            Kelola dan pantau pengaduan warga.
          </p>
        </div>
      </div>

      <PengaduanClient data={data} />
    </div>
  );
}