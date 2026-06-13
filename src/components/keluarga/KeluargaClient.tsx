"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus } from "lucide-react";
import Link from "next/link";
import DataTable, { Column } from "@/components/DataTable";
import ConfirmModal from "@/components/ConfirmModal";
import { supabaseClient } from "@/lib/supabase/client";

interface KeluargaData {
  id: string;
  nomor_kk: string;
  alamat: string;
  rt: string;
  rw: string;
  nama_kepala: string;
  jumlah_anggota: number;
}

interface KeluargaClientProps {
  initialData: KeluargaData[];
  totalKK: number;
}

export default function KeluargaClient({ initialData, totalKK }: KeluargaClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState("");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<KeluargaData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredData = initialData.filter((item) => {
    const searchLower = search.toLowerCase();
    return (
      item.nomor_kk.toLowerCase().includes(searchLower) ||
      item.nama_kepala.toLowerCase().includes(searchLower)
    );
  });

  // Perbaikan Utama: Semua parameter fungsi render diberi tipe data eksplisit (unknown, KeluargaData)
  // Kolom No diubah hanya menerima 2 parameter agar sinkron dengan interface DataTable kamu
  const columns: Column<KeluargaData>[] = [
    { key: "nomor_kk", label: "Nomor KK" },
    { key: "nama_kepala", label: "Nama Kepala KK" },
    {
      key: "rt_rw",
      label: "RT / RW",
      render: (value: unknown, row: KeluargaData) => `RT ${row.rt} / RW ${row.rw}`,
    },
    {
      key: "jumlah_anggota",
      label: "Anggota",
      render: (value: unknown) => (
        <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold text-xs">
          {Number(value ?? 0)} Jiwa
        </span>
      ),
    },
  ];

  const handleDeleteClick = (row: KeluargaData) => {
    setSelectedRow(row);
    setIsModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!selectedRow) return;
    setIsDeleting(true);

    try {
      const { error } = await supabaseClient
        .from("keluarga")
        .delete()
        .eq("id", selectedRow.id);

      if (error) throw error;

      setIsModalOpen(false);
      setSelectedRow(null);
      
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      alert("Gagal menghapus data keluarga. Silakan coba kembali.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER ACTION */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Data Keluarga</h1>
          <p className="text-sm text-slate-500 mt-1">{totalKK} Kartu Keluarga terdaftar di sistem.</p>
        </div>
        <Link
          href="/dashboard/keluarga/tambah"
          className="inline-flex items-center justify-center gap-2 bg-[#15803d] hover:bg-[#166534] text-white font-semibold text-sm py-2.5 px-4 rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Tambah KK Baru
        </Link>
      </div>

      {/* SEARCH BAR PANEL */}
      <div className="relative w-full sm:max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama kepala keluarga atau nomor KK..."
          className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition"
        />
      </div>

      {/* DATATABLE */}
      <DataTable<KeluargaData>
        columns={columns}
        data={filteredData}
        isLoading={isPending}
        onView={(row) => router.push(`/dashboard/keluarga/${row.id}`)}
        onEdit={(row) => router.push(`/dashboard/keluarga/${row.id}/edit`)}
        onDelete={handleDeleteClick}
      />

      {/* CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={isModalOpen}
        title="Hapus Data Kartu Keluarga?"
        message={`Tindakan ini akan menghapus KK nomor ${selectedRow?.nomor_kk} milik kepala keluarga ${selectedRow?.nama_kepala} secara permanen. Seluruh relasi data anggota di dalamnya juga ikut terhapus.`}
        confirmLabel="Ya, Hapus"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleExecuteDelete}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}