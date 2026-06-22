/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import DataTable, { Column } from "@/components/DataTable";
import { RefreshCw, Eye, Search, Download } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { useToast } from "@/hooks/useToast";
import { formatDate } from "@/lib/format";
import Input from "@components/ui/Input";
import Button from "@components/ui/Button";

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
       <div className="flex items-center gap-1.5">
        {row.status === "pending" && (
          <Button 
            variant="warning" 
            size="xs" 
            onClick={() => handleUpdateStatus(row.id, "diproses")}
          >
            Proses
          </Button>
        )}

        {row.status === "diproses" && (
          <Button 
            variant="primary" 
            size="xs" 
            onClick={() => handleUpdateStatus(row.id, "selesai")}
          >
            Selesai
          </Button>
        )}

        {row.status === "selesai" && (
          <Button 
            variant="primary" // Warna Emerald sesuai dengan "ijo"
            size="xs" 
            leftIcon={<Download className="w-3 h-3" />} 
            onClick={() => window.open(row.file_url, "_blank")}
          >
            Download
          </Button>
        )}
      </div>
      ),
    },
  ];

  // Logic filter data
  const filteredData = data.filter((item) => item.profiles?.nama?.toLowerCase().includes(search.toLowerCase()) || item.nomor_surat?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="w-full max-w-sm">
      <Input
        placeholder="Cari nama pemohon..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="pl-9"
        leftIcon={<Search className="w-4 h-4 text-slate-400" />}
      />
    </div>

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
