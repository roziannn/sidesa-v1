import PengaduanClient from '@components/pengaduan/PengaduanClient';

async function getData() {
  return [
    { id: "1", nama: "Budi Santoso", jenis: "Kebersihan", isi: "Sampah tidak diangkut 2 hari", status: "Pending" as const },
    { id: "2", nama: "Siti Rahma", jenis: "Fasilitas", isi: "Lampu jalan mati", status: "Diproses" as const },
    { id: "3", nama: "Agus Jaya", jenis: "Keamanan", isi: "Gerbang rusak", status: "Selesai" as const },
  ];
}

export default async function PengaduanPage() {
  const data = await getData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Daftar Pengaduan</h1>
        <p className="text-gray-500 text-sm">Kelola dan pantau pengaduan warga.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <PengaduanClient data={data} />
      </div>
    </div>
  );
}