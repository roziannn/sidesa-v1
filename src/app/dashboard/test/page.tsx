"use client";

import React, { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import ConfirmModal from "@/components/ConfirmModal";
import StatusBadge from "@/components/StatusBadge";

// 1. Interface khusus untuk struktur data testing halaman ini
interface DataTest {
  id: string;
  nama: string;
  status: string;
  tanggal: string;
}

export default function TestComponentPage() {
  // State untuk kontrol buka/tutup ConfirmModal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);

  // 2. Definisi Struktur Kolom untuk DataTable
  const columns: Column<DataTest>[] = [
    { key: "nama", label: "Nama Penduduk / Pemohon" },
    {
      key: "status",
      label: "Status Sistem",
      // Menguji integrasi StatusBadge di dalam cell DataTable
      render: (value) => <StatusBadge status={String(value)} />,
    },
    { key: "tanggal", label: "Tanggal Pembaruan" },
  ];

  // 3. Dummy Data Riil (3 Baris) untuk Menguji Kondisi Normal Tabel
  const dummyDataNormal: DataTest[] = [
    { id: "1", nama: "Ahmad Subarjo", status: "pending", tanggal: "22 Mei 2026" },
    { id: "2", nama: "Siti Aminah", status: "diproses", tanggal: "21 Mei 2026" },
    { id: "3", nama: "Budi Setiawan", status: "lunas", tanggal: "20 Mei 2026" },
  ];

  // Fungsi simulasi loading saat menekan konfirmasi di dalam modal
  const handleExecuteAction = () => {
    setIsModalLoading(true);
    setTimeout(() => {
      setIsModalLoading(false);
      setIsModalOpen(false);
      alert("Aksi sukses dieksekusi!");
    }, 2000);
  };

  // Daftar seluruh variasi status untuk pengujian StatusBadge
  const semuaStatus = [
    "pending",
    "diproses",
    "selesai",
    "ditolak",
    "aktif",
    "nonaktif",
    "tersalurkan",
    "belum_bayar",
    "lunas",
    "jatuh_tempo",
    "status_kustom_aneh",
  ];

  return (
    <div className="space-y-10 pb-12">
      {/* HEADER HALAMAN TEST */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 shadow-sm">
        <h1 className="text-lg font-bold text-amber-800">🛠️ Laboratorium Pengujian Komponen</h1>
        <p className="text-xs text-amber-600 mt-1">
          Halaman sementara untuk memvalidasi props, state, animasi, dan layout responsif. Hapus folder <code className="bg-amber-100 px-1 py-0.5 rounded font-mono font-bold">src/app/(dashboard)/test</code> jika aplikasi sudah siap diproduksi.
        </p>
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* PENGUJIAN 1: DERETAN STATUS BADGE                             */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">1. Pengujian Komponen StatusBadge</h2>
        <div className="flex flex-wrap gap-2.5 p-4 bg-slate-50 rounded-lg border border-slate-100">
          {semuaStatus.map((st) => (
            <div key={st} className="flex flex-col items-center gap-1 bg-white p-2 rounded border border-slate-200 min-w-[100px]">
              <StatusBadge status={st} />
              <span className="text-[10px] font-mono text-slate-400 mt-1">{st}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* PENGUJIAN 2: INTERAKTIF MODAL KONFIRMASI                       */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">2. Pengujian Interaksi ConfirmModal</h2>
        <div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg shadow transition-colors flex items-center gap-2"
          >
            🗑️ Simulasikan Hapus Data (Danger Variant)
          </button>
        </div>

        {/* Pemanggilan Komponen Modal Konfirmasi */}
        <ConfirmModal
          isOpen={isModalOpen}
          title="Hapus Permanen Berkas Penduduk?"
          message="Apakah Anda yakin ingin menghapus data ini? Tindakan ini bersifat irreversible dan akan melenyapkan data dari database Supabase desa selamanya."
          confirmLabel="Ya, Hapus Saja"
          confirmVariant="danger"
          isLoading={isModalLoading}
          onConfirm={handleExecuteAction}
          onCancel={() => setIsModalOpen(false)}
        />
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* PENGUJIAN 3: KONDISI DATATABLE (NORMAL, LOADING, KOSONG)       */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider px-1">3. Pengujian Kondisi DataTable Generic</h2>

        {/* A. Kondisi Tabel Normal */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">Kondisi A: Data Normal Berhasil Dimuat (Dengan Aksi)</span>
          <DataTable<DataTest>
            columns={columns}
            data={dummyDataNormal}
            onView={(row) => alert(`Detail: ${row.nama}`)}
            onEdit={(row) => alert(`Edit ID: ${row.id}`)}
            onDelete={(row) => alert(`Hapus ID: ${row.id}`)}
          />
        </div>

        {/* B. Kondisi Tabel Sedang Memuat / Loading Shimmer */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">Kondisi B: State Mengambil Data Database (isLoading = true)</span>
          <DataTable<DataTest>
            columns={columns}
            data={[]}
            isLoading={true}
            onEdit={() => {}}
          />
        </div>

        {/* C. Kondisi Tabel Kosong Tanpa Baris */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-500 block">Kondisi C: State Database Bersih / Hasil Filter Kosong (data = [])</span>
          <DataTable<DataTest>
            columns={columns}
            data={[]}
            isLoading={false}
          />
        </div>
      </section>
    </div>
  );
}