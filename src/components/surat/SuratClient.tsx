/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";
import DataTable, { Column } from "@/components/DataTable"; // Sesuaikan path component DataTable kamu
import { FileText, CheckCircle2, Clock, XCircle, AlertTriangle, Archive, FileCheck, Download, Eye, RefreshCw, AlertCircle, Plus, CircleX } from "lucide-react";
import { formatDate } from "@/lib/format";
import Button from "@components/ui/Button";
import Modal from "@components/ui/Modal";
import Textarea from "@components/ui/Textarea";

// Interface data lokal
interface Profile {
  id: string;
  nama: string;
  rt: string;
  rw: string;
}

interface Surat {
  id: string;
  jenis_surat: string;
  keperluan: string;
  status: "pending" | "diproses" | "selesai" | "ditolak";
  created_at: string;
  catatan_petugas?: string | null;
  file_url?: string | null;
  pemohon_id: string;
  profiles: Profile;
}

interface ClientProps {
  initialSurat: Surat[];
}

type FilterStatus = "semua" | "pending" | "diproses" | "selesai" | "ditolak";

export default function SuratClient({ initialSurat }: ClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [listSurat, setListSurat] = useState<Surat[]>(initialSurat);
  const [activeTab, setActiveTab] = useState<FilterStatus>("semua");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // State Modal Tolak
  const [modalTolak, setModalTolak] = useState<{ isOpen: boolean; suratId: string | null }>({
    isOpen: false,
    suratId: null,
  });
  const [alasanTolak, setAlasanTolak] = useState("");

  // State Modal Lihat Alasan
  const [modalAlasan, setModalAlasan] = useState<{ isOpen: boolean; teks: string }>({
    isOpen: false,
    teks: "",
  });

  // 1. HITUNG COUNTER UTK BADGE & TABS
  const counts = useMemo(() => {
    return {
      semua: listSurat.length,
      pending: listSurat.filter((s) => s.status === "pending").length,
      diproses: listSurat.filter((s) => s.status === "diproses").length,
      selesai: listSurat.filter((s) => s.status === "selesai").length,
      ditolak: listSurat.filter((s) => s.status === "ditolak").length,
    };
  }, [listSurat]);

  // 2. FILTER DATA BERDASARKAN TAB YANG AKTIF
  const filteredSurat = useMemo(() => {
    if (activeTab === "semua") return listSurat;
    return listSurat.filter((s) => s.status === activeTab);
  }, [listSurat, activeTab]);

  // 3. UTILITY FORMAT DATA & TANGGAL
  const formatTanggalKonteks = (
  isoString: string
  ) => {
    const date = new Date(isoString);
    const now = new Date();

    const diffTime =
      Math.abs(
        now.getTime() - date.getTime()
      );

    const diffDays = Math.floor(
      diffTime /
        (1000 * 60 * 60 * 24)
    );

    let konteksHari = 'Hari ini';

    if (diffDays > 0) {
      konteksHari = `${diffDays} hari lalu`;
    }

    return {
      formattedDate: formatDate(
        isoString
      ),
      diffDays,
      konteksHari,
    };
  };

  const getSuratIcon = (jenis: string) => {
    return <FileText className="w-4 h-4 text-slate-500" />;
  };

  // 5. MUTASI STATUS SURAT (UPDATE/PROSES/SELESAI) -> SEKARANG LEWAT API ROUTE AGAR KIRIM EMAIL
  const handleUpdateStatus = async (id: string, newStatus: "diproses" | "selesai", catatan?: string) => {
    setLoadingId(id);
    try {
      // UBAH: Dari supabaseClient langsung, menjadi fetch ke API Route
      const response = await fetch("/api/surat/update-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          surat_id: id,
          new_status: newStatus,
          catatan: catatan || (newStatus === "diproses" ? "Surat sedang diverifikasi oleh petugas." : "Surat telah selesai diproses."),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Gagal mengubah status menjadi ${newStatus}`);
      }

      setListSurat((prev) => prev.map((s) => (s.id === id ? { ...s, status: newStatus, catatan_petugas: catatan || s.catatan_petugas } : s)));

      showToast("success", "Status Diperbarui", `Surat berhasil dipindahkan ke status '${newStatus}' dan email notifikasi telah dikirim.`);
      router.refresh();
    } catch (err: any) {
      showToast("error", "Gagal memperbarui", err.message);
    } finally {
      setLoadingId(null);
    }
  };

  // 🌟 NEW ACTION: LOGIKA GENERATE PDF & PENYELESAIAN DOKUMEN OTOMATIS
  const handleGeneratePDF = async (id: string) => {
    setLoadingId(id); // Mengaktifkan loader spinner spesifik pada baris tombol ini
    try {
      const response = await fetch("/api/surat/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ surat_id: id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.details || "Terjadi kegagalan sistem internal.");
      }

      // 1. Kirim notifikasi konfirmasi sukses lewat toast hook
      showToast("success", "Generasi PDF Berhasil", "✅ Surat berhasil digenerate! Warga bisa download sekarang.");

      // 2. Perbarui state lokal secara instan agar UI bermutasi ke tombol "Download PDF" tanpa kedipan hard-reload
      setListSurat((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                status: "selesai",
                file_url: result.file_url,
                catatan_petugas: `Surat digenerate otomatis melalui sistem.`,
              }
            : s,
        ),
      );

      // 3. Sinkronisasi Server Component Next.js di latar belakang
      router.refresh();
    } catch (err: any) {
      showToast("error", "Gagal Memproses Surat", err.message);
    } finally {
      setLoadingId(null); // Mematikan state loading pasca operasi selesai/gagal
    }
  };

  const handleDownloadPDF = async (id: string, jenisSurat: string, namaPemohon: string) => {
    // Set ID loading spesifik agar spinner tidak menyala di semua baris
    setLoadingId(`download-${id}`);
    try {
      const response = await fetch("/api/surat/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ surat_id: id }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || result.details || "Gagal mengunduh berkas.");
      }

      // Jika API kamu me-return JSON berisi publicUrl (seperti struktur route.ts kamu saat ini):
      const result = await response.json();
      if (!result.file_url) throw new Error("URL File tidak ditemukan.");

      // Tembak URL file untuk diubah menjadi blob agar terdownload otomatis, bukan sekadar buka tab baru
      const fileResponse = await fetch(result.file_url);
      const blob = await fileResponse.blob();

      // Proses download via browser trigger
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // Sanitasi nama file (Contoh: Surat_Domisili_Firda_Rosiana.pdf)
      const fileName = `${jenisSurat.replace(/\s+/g, "_")}_${namaPemohon.replace(/\s+/g, "_")}.pdf`;
      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();

      // Cleanup elemen link
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast("success", "Unduhan Berhasil", "Dokumen PDF berhasil disimpan ke perangkat.");
    } catch (err: any) {
      showToast("error", "Gagal Mendownload", err.message);
    } finally {
      setLoadingId(null);
    }
  };

  // 6. SUBMIT PENOLAKAN
  // 6. SUBMIT PENOLAKAN
  const handleKirimPenolakan = async () => {
    if (alasanTolak.trim().length < 20) {
      showToast("error", "Validasi Gagal", "Alasan penolakan minimal wajib 20 karakter!");
      return;
    }

    const id = modalTolak.suratId;
    if (!id) return;

    setLoadingId(id); // Set loading agar user tahu proses sedang berjalan
    try {
      // Panggil API Route update-status (yang otomatis kirim email)
      const response = await fetch("/api/surat/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surat_id: id,
          new_status: "ditolak",
          catatan: alasanTolak,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Gagal menolak surat");

      setListSurat((prev) => prev.map((s) => (s.id === id ? { ...s, status: "ditolak", catatan_petugas: alasanTolak } : s)));

      showToast("success", "Surat Ditolak", "Alasan penolakan telah dikirim melalui email ke pemohon.");
      setModalTolak({ isOpen: false, suratId: null });
      setAlasanTolak("");
      router.refresh();
    } catch (err: any) {
      showToast("error", "Gagal", err.message);
    } finally {
      setLoadingId(null);
    }
  };

  // Helper untuk menentukan highlight background sel di dalam DataTable
  const getHighlightClass = (surat: Surat) => {
    if (surat.status !== "pending") return "";
    const date = new Date(surat.created_at);
    const now = new Date();
    const diffDays = Math.floor(Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays >= 7) return "bg-red-50/80 h-full w-full -m-4 p-4 block";
    if (diffDays >= 3) return "bg-yellow-50/70 h-full w-full -m-4 p-4 block";
    return "";
  };

  // ================= KONFIGURASI KOLOM DATATABLE =================
  const columns: Column<Surat>[] = useMemo(
    () => [
      {
        key: "no",
        label: "No",
        render: (_, __, index) => <span className="text-center text-slate-400 font-mono block">{index + 1}</span>,
      },
      {
        key: "profiles",
        label: "Nama Pemohon",
        render: (_, row) => (
          <div className={getHighlightClass(row)}>
            <div className="font-semibold text-slate-800">{row.profiles?.nama || "Warga Anonim"}</div>
            <div className="text-slate-400 text-xs">
              RT {row.profiles?.rt || "00"}/RW {row.profiles?.rw || "00"}
            </div>
          </div>
        ),
      },
      {
        key: "jenis_surat",
        label: "Jenis Surat",
        render: (val, row) => (
          <div className={getHighlightClass(row)}>
            <div className="flex items-center gap-2 font-medium text-slate-700">
              {getSuratIcon(String(val))}
              <span>{String(val)}</span>
            </div>
          </div>
        ),
      },
      {
        key: "keperluan",
        label: "Keperluan",
        render: (val, row) => (
          <div className={getHighlightClass(row)}>
            <p className="text-slate-600 max-w-[220px] truncate cursor-help" title={String(val)}>
              {String(val)}
            </p>
          </div>
        ),
      },
      {
        key: "created_at",
        label: "Tanggal Request",
        render: (val, row) => {
          const { formattedDate, diffDays, konteksHari } = formatTanggalKonteks(String(val));
          const showWarningTooltip = row.status === "pending" && diffDays >= 7;

          return (
            <div className={getHighlightClass(row)}>
              <div className="text-slate-700 font-medium text-xs">{formattedDate}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[11px] px-1.5 py-0.5 rounded font-bold ${row.status === "pending" && diffDays >= 3 ? "text-amber-700 bg-amber-100" : "text-slate-400 bg-slate-100"}`}>{konteksHari}</span>

                {showWarningTooltip && (
                  <div className="group relative inline-block cursor-pointer">
                    <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-bounce" />
                    <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 rounded-md bg-slate-900 p-2 text-center text-[11px] text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100 leading-normal normal-case">
                      Menunggu {diffDays} hari — mohon segera diproses
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: "aksi",
        label: "Aksi",
        render: (_, row) => {
          const isRowLoading = loadingId === row.id;

          return (
            <div className={`${getHighlightClass(row)} flex items-center gap-1.5 whitespace-nowrap`}>
              {row.status === "pending" && (
                <>
                  <Button size="xs" variant="primary" onClick={() => handleUpdateStatus(row.id, "diproses")}>
                    Proses
                  </Button>
                  <Button size="xs" 
                  leftIcon={<CircleX className="w-3 h-3" />}
                  variant="danger" onClick={() => setModalTolak({ isOpen: true, suratId: row.id })}>
                    Tolak
                  </Button>
                </>
              )}

              {row.status === "diproses" && (
                <>
                  <Button 
                    size="xs" 
                    variant="warning"
                    loading={isRowLoading} 
                    leftIcon={<FileCheck className="w-3 h-3" />}
                    onClick={() => handleGeneratePDF(row.id)}
                  >
                    Selesaikan
                  </Button>
                  <Button size="xs"
                  leftIcon={<CircleX className="w-3 h-3" />}
                  variant="danger" onClick={() => setModalTolak({ isOpen: true, suratId: row.id })}>
                    Tolak
                  </Button>
                </>
              )}

              {row.status === "selesai" && (
                <>
                  <Button 
                    size="xs" 
                    loading={loadingId === `download-${row.id}`}
                    leftIcon={<Download className="w-3 h-3" />}
                    onClick={() => handleDownloadPDF(row.id, row.jenis_surat, row.profiles?.nama)}
                  >
                    Download
                  </Button>
                  <Button size="xs" variant="outline" leftIcon={<Eye className="w-3 h-3" />}>
                    Detail
                  </Button>
                </>
              )}

              {row.status === "ditolak" && (
                <>
                  <Button size="xs" variant="secondary" onClick={() => setModalAlasan({ isOpen: true, teks: row.catatan_petugas || "Tidak ada alasan." })}>
                    Alasan
                  </Button>
                  <Button size="xs" variant="outline" leftIcon={<RefreshCw className="w-3 h-3" />} onClick={() => handleUpdateStatus(row.id, "diproses")}>
                    Proses Ulang
                  </Button>
                </>
              )}
            </div>
          );
        },
      },
    ],
    [loadingId, alasanTolak],
  );

  return (
    <>
      {/* ================= HEADER HALAMAN ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-200  mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Administrasi Surat</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola permohonan surat masuk dan status dokumen warga.</p>
        </div>
        <div className="flex items-center gap-2">
        <Link
          href="/dashboard/surat/request"
        >
          <Button
          leftIcon={
            
            <Plus className="h-4 w-4" />
          }
        >
          Buat Surat
        </Button>
        </Link>

           <Link
          href="/dashboard/surat/arsip"
        >
          <Button variant="outline"
          leftIcon={
            
            <Archive className="h-4 w-4" />
          }
        >
          Lihat Arsip
        </Button>
        </Link>
        </div>
      </div>

      {/* ================= TAB FILTER STATUS ================= */}
      <div className="flex border-b border-slate-200 overflow-x-auto no-scrollbar gap-1">
        {(
          [
            { id: "semua", label: "Semua" },
            { id: "pending", label: "Pending" },
            { id: "diproses", label: "Diproses" },
            { id: "selesai", label: "Selesai" },
            { id: "ditolak", label: "Ditolak" },
          ] as const
        ).map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-3 px-4 font-bold text-sm border-b-2 transition-all whitespace-nowrap flex items-center gap-2 ${
                isActive ? "border-emerald-600 text-emerald-600 bg-emerald-50/40" : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
              }`}
            >
              {tab.label}
              <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}>{counts[tab.id]}</span>
            </button>
          );
        })}
      </div>

      <DataTable columns={columns} data={filteredSurat} isLoading={loadingId === "fetch-awal"} />

     <Modal
        open={modalTolak.isOpen}
        onClose={() => {
          setModalTolak({
            isOpen: false,
            suratId: null,
          });
          setAlasanTolak('');
        }}
        title="Tolak Permohonan Surat"
        description="Berikan alasan menolak surat"
      >
        <p className="text-slate-500 text-xs mb-4">
          Berikan alasan penolakan yang objektif dan jelas.
        </p>

        <Textarea
          rows={4}
          value={alasanTolak}
          onChange={(e) =>
            setAlasanTolak(e.target.value)
          }
          placeholder="Jelaskan alasan surat tidak bisa diproses..."
        />

        <div className="flex justify-between mt-2">
          <span
            className={`text-[11px] font-bold ${
              alasanTolak.length >= 20
                ? 'text-emerald-600'
                : 'text-slate-400'
            }`}
          >
            {alasanTolak.length} / Minimal 20 Karakter
          </span>
        </div>

        <div className="mt-5 flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => {
              setModalTolak({
                isOpen: false,
                suratId: null,
              });
              setAlasanTolak('');
            }}
          >
            Batal
          </Button>

          <Button
            variant="danger"
            className="flex-1"
            onClick={handleKirimPenolakan}
            disabled={
              alasanTolak.trim().length < 20
            }
          >
            Kirim Penolakan
          </Button>
        </div>
      </Modal>

      {/* ================= MODAL LIHAT ALASAN ================= */}
      {modalAlasan.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-lg border border-slate-100">
            <h4 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-2">Catatan Penolakan Petugas</h4>
            <div className="bg-slate-50 border p-3 rounded-xl text-xs text-slate-600 font-medium leading-relaxed max-h-48 overflow-y-auto">&quot;{modalAlasan.teks}&quot;</div>
            <button onClick={() => setModalAlasan({ isOpen: false, teks: "" })} className="w-full mt-4 bg-slate-800 hover:bg-slate-900 text-white py-2 rounded-xl text-xs font-bold transition">
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
    </svg>
  );
}
