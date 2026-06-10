'use client';
import DataTable, { Column } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';

interface Pengaduan {
  id: string;
  nama: string;
  jenis: string;
  isi: string;
  status: 'Pending' | 'Diproses' | 'Selesai';
}

export default function PengaduanClient({ data }: { data: Pengaduan[] }) {
  const columns: Column<Pengaduan>[] = [
    { label: "Nama Warga", key: "nama" },
    { label: "Jenis", key: "jenis" },
    { label: "Isi Pengaduan", key: "isi" },
    { 
      label: "Status", 
      key: "status",
      render: (val) => <StatusBadge status={val as any} />
    }
  ];

  return (
    <DataTable 
      columns={columns} 
      data={data} 
      onView={(row) => console.log("Lihat:", row)}
      onEdit={(row) => console.log("Proses:", row)}
    />
  );
}