import React from 'react';
import DataTable, { Column } from '@/components/DataTable';

// Definisi tipe data dengan field yang sudah terformat (siap tampil)
interface WargaDisplay {
  nama: string;
  rt_rw: string;
  skor: string;
  status: string;
}

async function getTopCitizens(): Promise<WargaDisplay[]> {
  const data = [
    { nama: "Agus Supriyadi", rt: "01", rw: "05", skor: "100%", status: "Sangat Patuh" },
    { nama: "Siti Aminah", rt: "02", rw: "05", skor: "100%", status: "Sangat Patuh" },
  ];

  // Map data ke format yang tidak membutuhkan fungsi render di client
  return data.map(w => ({
    nama: w.nama,
    rt_rw: `${w.rt} / ${w.rw}`,
    skor: w.skor,
    status: w.status
  }));
}

export default async function TopCitizensTable() {
  const data = await getTopCitizens();

  const columns: Column<WargaDisplay>[] = [
    { label: "Nama Warga", key: "nama" },
    { label: "RT/RW", key: "rt_rw" },
    { label: "Skor Ketepatan", key: "skor" },
    { label: "Predikat", key: "status" },
  ];

  return <DataTable columns={columns} data={data} />;
}