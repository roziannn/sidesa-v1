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
import Card from '@components/ui/Card';

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
      <Card 
        title="Trend Pemasukan (12 Bulan Terakhir)"
        description='Grafik trend pemasukan dalam 12 bulan terakhir.'
        className="lg:col-span-2"
      >
        <div className="h-[300px] w-full">
          <Suspense fallback={<div className="h-full w-full bg-slate-100 animate-pulse rounded-lg" />}>
            <IncomeTrendSection />
          </Suspense>
        </div>
      </Card>

      <Card 
        title="Proporsi Jenis Retribusi"
        description='Grafik pembagian jenis retribusi.'
      >
        <div className="h-[300px] w-full">
          <Suspense fallback={<div className="h-full w-full bg-slate-100 animate-pulse rounded-lg" />}>
            <LevyBreakdownSection />
          </Suspense>
        </div>
      </Card>
    </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Rekapitulasi */}
        <Card 
          title="Rekapitulasi Penagihan Bulanan" 
          description='Summary rekap penagihan bulanan.'
          padding="sm"
          className="h-full"
        >
          <Suspense fallback={<div className="p-8 text-center text-gray-500">Memuat tabel rekap...</div>}>
            <RekapTableClient />
          </Suspense>
        </Card>

        {/* Card 2: Top 10 Warga */}
        <Card 
          title="Top 10 Warga Paling Tepat Bayar" 
          description='Daftar 10 warga yang paling tepat bayar retribusi.'
          padding="sm"
          className="h-full"
        >
          <Suspense fallback={<div className="p-8 text-center text-gray-500">Memuat data apresiasi...</div>}>
            <TopCitizensTable />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}