'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';

import DataTable, { Column } from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';

interface Pengaduan {
  id: string;
  nama: string;
  jenis: string;
  isi: string;
  tanggal: string;
  updatedAt: Date;
  petugasPenanganan: string;
  catatanPetugas: string;
  prioritas: 'Rendah' | 'Sedang' | 'Tinggi';
  status: 'pending' | 'diproses' | 'selesai' | 'ditolak';
}

type FilterStatus =
  | 'semua'
  | 'pending'
  | 'diproses'
  | 'selesai'
  | 'ditolak';

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
      pending: data.filter(
        (p) => p.status === 'pending'
      ).length,
      diproses: data.filter(
        (p) => p.status === 'diproses'
      ).length,
      selesai: data.filter(
        (p) => p.status === 'selesai'
      ).length,
      ditolak: data.filter(
        (p) => p.status === 'ditolak'
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
      key: 'nama',
    },
    {
      label: 'Jenis',
      key: 'jenis',
    },
    {
      label: 'Tanggal',
      key: 'tanggal',
    },
    {
      label: 'Isi Pengaduan',
      key: 'isi',
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
      key: 'petugasPenanganan',
    },
    {
      label: 'Catatan Petugas',
      key: 'catatanPetugas',
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
      key: 'updatedAt',
      render: (val) =>
        new Date(val as Date).toLocaleString(
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
      id: 'pending',
      label: 'Pending',
    },
    {
      id: 'diproses',
      label: 'Diproses',
    },
    {
      id: 'selesai',
      label: 'Selesai',
    },
    {
      id: 'ditolak',
      label: 'Ditolak',
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