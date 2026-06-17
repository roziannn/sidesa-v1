// app/(dashboard)/retribusi/laporan/page.tsx
import React, { Suspense } from 'react'; 
import DataTable, { Column } from '@/components/DataTable';
import { formatRupiah } from '@/lib/format';
import { FileSpreadsheet, FileText } from 'lucide-react';
import TopCitizensTable from '@/components/retribusi/TopWargaTable'; 
import RekapTableClient from '@components/retribusi/Chart/RekapTableChart';
import IncomeTrendSection from '@components/retribusi/Chart/IncomeTrandChart';
import LevyBreakdownSection from '@components/retribusi/Chart/LevyBreakdownChart';
import Link from 'next/link';
import Button from '@components/ui/Button';

export default async function LaporanPage() {
  // Contoh data rekap (biasanya hasil query ke DB)
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
  return (
    <div className="space-y-6 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Laporan Keuangan Retribusi</h1>
          <p className="text-gray-500 text-sm">Analisis performa penagihan dan pemasukan warga.</p>
        </div>
       <div className="flex items-center gap-2">
        <Link href="#">
          <Button
            variant="outline"
            leftIcon={<FileSpreadsheet className="w-4 h-4 text-emerald-600" />}
          >
            Export Excel
          </Button>
        </Link>

        <Link href="#">
          <Button
            leftIcon={<FileText className="w-4 h-4" />}
          >
            Export Laporan PDF
          </Button>
        </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Tren Pemasukan (12 Bulan Terakhir)</h3>
          <div className="h-[300px] w-full">
            <Suspense fallback={<div className="h-full w-full bg-gray-100 animate-pulse rounded-lg" />}>
              <IncomeTrendSection />
            </Suspense>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Proporsi Jenis Retribusi</h3>
          <div className="h-[300px] w-full">
            <Suspense fallback={<div className="h-full w-full bg-gray-100 animate-pulse rounded-lg" />}>
              <LevyBreakdownSection />
            </Suspense>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700">Rekapitulasi Penagihan Bulanan</h3>
        </div>
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Memuat tabel rekap...</div>}>
          <RekapTableClient/>
        </Suspense>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700">Top 10 Warga Paling Tepat Bayar</h3>
        </div>
        <Suspense fallback={<div className="p-8 text-center text-gray-500">Memuat data apresiasi...</div>}>
          <TopCitizensTable />
        </Suspense>
      </div>
    </div>
  );
}