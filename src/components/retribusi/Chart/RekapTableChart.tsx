// src/components/retribusi/Chart/RekapTableChart.tsx
'use client';
import DataTable, { Column } from '@/components/DataTable';
import { formatRupiah } from '@/lib/format';

export default function RekapTableClient() {
  const dataRekap = [
    { bulan: "Maret 2026", tagihan: 5000000, lunas: 4500000, tunggakan: 500000, persen: "90%" },
  ];

  const columns: Column<any>[] = [
    { label: "Bulan", key: "bulan" },
    { label: "Total Tagihan", key: "tagihan", render: (val) => formatRupiah(val as number) },
    { label: "Total Lunas", key: "lunas", render: (val) => formatRupiah(val as number) },
    { label: "Tunggakan", key: "tunggakan", render: (val) => formatRupiah(val as number) },
    { label: "% Lunas", key: "persen" },
  ];

  return <DataTable columns={columns} data={dataRekap} />;
}