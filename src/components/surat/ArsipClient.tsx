/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import { RefreshCw, Eye } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/hooks/useToast";
import { formatDate } from "@/lib/format";

export default function ArsipClient({ initialData }: { initialData: any[] }) {
  const [data] = useState(initialData);
  const [search, setSearch] = useState("");

  // Hook Toast
  const { showToast } = useToast();

  // State untuk Modal & Loading
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateStatus = async (suratId: string, status: "diproses" | "selesai" | "ditolak", catatan?: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/surat/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surat_id: suratId, new_status: status, catatan: catatan }),
      });

      if (!res.ok) throw new Error("Gagal memperbarui status");

      showToast("success", "Berhasil!", `Status surat diubah menjadi ${status}.`);

      window.location.reload();
    } catch (err: any) {
      showToast("error", "Gagal!", err.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedSurat) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/surat/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" }, // Tambahkan header ini
        body: JSON.stringify({ surat_id: selectedSurat.id }),
      });

      if (!res.ok) throw new Error("Gagal");

      // PANGGIL DENGAN 3 ARGUMEN (variant, title, message)
      showToast("success", "Berhasil!", "Surat berhasil digenerate ulang.");

      setIsModalOpen(false);
      window.location.reload(); // Refresh data
    } catch (err) {
      // PANGGIL DENGAN 3 ARGUMEN
      showToast("error", "Gagal!", "Terjadi kesalahan saat generate surat.");
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<any>[] = [
    { key: "nomor_surat", label: "Nomor Surat" },
    { key: "pemohon", label: "Pemohon", render: (_, row) => row.profiles?.nama || "-" },
    { key: "jenis_surat", label: "Jenis" },
    {
      key: "created_at",
      label: "Tanggal",
      render: (val) =>  formatDate(String(val)),
    },
    {
      key: "aksi",
      label: "Aksi",
      render: (_, row) => (
        <div className="flex gap-2">
          {row.status === "pending" && (
            <button onClick={() => handleUpdateStatus(row.id, "diproses")} className="px-3 py-1 bg-amber-500 text-white text-xs rounded-md hover:bg-amber-600 transition">
              Proses
            </button>
          )}

          {/* Tombol Selesai (Memanggil fungsi generate & update status) */}
          {row.status === "diproses" && (
            <button onClick={() => handleUpdateStatus(row.id, "selesai")} className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-md hover:bg-emerald-700 transition">
              Selesai
            </button>
          )}

          {/* Tombol Download (Hanya jika status selesai) */}
          {row.status === "selesai" && (
            <button onClick={() => window.open(row.file_url, "_blank")} className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition">
              Download
            </button>
          )}
        </div>
      ),
    },
  ];

  // Logic filter data
  const filteredData = data.filter((item) => item.profiles?.nama?.toLowerCase().includes(search.toLowerCase()) || item.nomor_surat?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Cari nama atau nomor surat..."
        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14532d]"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <DataTable columns={columns} data={filteredData} />

      <ConfirmModal
        isOpen={isModalOpen}
        title="Konfirmasi Generate Ulang"
        message={`Apakah Anda yakin ingin men-generate ulang surat ${selectedSurat?.nomor_surat || ""}? Proses ini akan memperbarui file PDF arsip.`}
        confirmLabel="Ya, Generate Ulang"
        confirmVariant="primary"
        isLoading={isLoading}
        onConfirm={handleGenerate}
        onCancel={() => setIsModalOpen(false)}
      />
    </div>
  );
}
