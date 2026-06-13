'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';

import DataTable, { Column } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import { formatDate } from '@/lib/format';

interface Pengaduan {
  id: string;
  nama_warga: string;
  jenis: string;
  tanggal: string;
  isi_pengaduan: string;
  prioritas: 'Rendah' | 'Sedang' | 'Tinggi';
  petugas: string | null;
  catatan_petugas: string | null;
  status:
    | 'Menunggu'
    | 'Diproses'
    | 'Selesai'
    | 'Ditolak'
    | 'Perlu Tindak Lanjut';
  created_at: string;
  updated_at: string;
}

type FilterStatus =
  | 'semua'
  | 'Menunggu'
  | 'Diproses'
  | 'Selesai'
  | 'Ditolak'
  | 'Perlu Tindak Lanjut';

export default function PengaduanClient({
  data,
}: {
  data: Pengaduan[];
}) {
  const [activeTab, setActiveTab] =
    useState<FilterStatus>('semua');

  const counts = useMemo(
  () => ({
    semua: data.length,
    Menunggu: data.filter(
      (p) => p.status === 'Menunggu'
    ).length,
    Diproses: data.filter(
      (p) => p.status === 'Diproses'
    ).length,
    Selesai: data.filter(
      (p) => p.status === 'Selesai'
    ).length,
    Ditolak: data.filter(
      (p) => p.status === 'Ditolak'
    ).length,
    'Perlu Tindak Lanjut': data.filter(
      (p) =>
        p.status === 'Perlu Tindak Lanjut'
    ).length,
  }),
  [data]
);

  const filteredData = useMemo(() => {
  if (activeTab === 'semua') {
    return data;
  }

  return data.filter(
    (p) => p.status === activeTab
  );
}, [data, activeTab]);

  const columns: Column<Pengaduan>[] = [
  {
    label: 'Nama Warga',
    key: 'nama_warga',
  },
  {
    label: 'Jenis',
    key: 'jenis',
  },
  {
    label: 'Tanggal',
    key: 'tanggal',
    render: (val) => formatDate(String(val)),
  },
  {
    label: 'Isi Pengaduan',
    key: 'isi_pengaduan',
  },
  {
    label: 'Prioritas',
    key: 'prioritas',
    render: (val) => (
      <StatusBadge status={String(val)} />
    ),
  },
  {
    label: 'Petugas',
    key: 'petugas',
    render: (val) => String(val ?? '-'),
  },
  {
    label: 'Catatan Petugas',
    key: 'catatan_petugas',
    render: (val) => String(val ?? '-'),
  },
  {
    label: 'Status',
    key: 'status',
    render: (val) => (
      <StatusBadge status={String(val)} />
    ),
  },
  {
    label: 'Updated',
    key: 'updated_at',
    render: (val) =>
      new Date(String(val)).toLocaleString(
        'id-ID',
        {
          dateStyle: 'medium',
          timeStyle: 'short',
        }
      ),
  },
  {
    label: 'Aksi',
    key: 'id',
    render: (_, row) => (
      <Link
        href={`/dashboard/pengaduan/${row.id}`}
        className="inline-flex items-center justify-center text-blue-600 hover:text-blue-800 transition"
      >
        <Eye className="w-4 h-4" />
      </Link>
    ),
  },
];

  const tabs = [
  {
    id: 'semua',
    label: 'Semua',
  },
  {
    id: 'Menunggu',
    label: 'Menunggu',
  },
  {
    id: 'Diproses',
    label: 'Diproses',
  },
  {
    id: 'Selesai',
    label: 'Selesai',
  },
  {
    id: 'Ditolak',
    label: 'Ditolak',
  },
  {
    id: 'Perlu Tindak Lanjut',
    label: 'Tindak Lanjut',
  },
] as const;

  return (
    <>
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive =
            activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id)
              }
              className={`py-3 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive
                  ? 'border-emerald-600 text-emerald-600 bg-emerald-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              {tab.label}

              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {
                  counts[
                    tab.id as keyof typeof counts
                  ]
                }
              </span>
            </button>
          );
        })}
      </div>

      <DataTable
        columns={columns}
        data={filteredData}
      />
    </>
  );
}