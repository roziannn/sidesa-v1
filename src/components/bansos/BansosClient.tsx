/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Plus, CheckCircle, RotateCcw, Trash2, Pencil, Users, Layers, MapPin, ShieldCheck, Clock, CheckSquare, Square, Loader2, ChevronLeft } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import ConfirmModal from "@/components/ConfirmModal";
import FormPenerimaBansos from "@/components/bansos/FormPenerimaBansos";
import FormProgram from "@/components/bansos/FormPage"; 
import { supabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";

interface PenerimaBansos {
  id: string;
  nama_program: string;
  penerima_id: string;
  jumlah_bantuan: number;
  periode: string;
  status: "pending" | "tersalurkan";
  catatan: string | null;
  created_at: string;
  profiles?: {
    nama: string;
    rt: string;
    rw: string;
  } | null;
  anggota?: {
    nama: string;
  } | null;
}

interface ProgramAgregasi {
  nama: string;
  totalPenerima: number;
  periode: string;
}

interface WargaDropdown {
  id: string;
  nama: string;
  rt: string;
  rw: string;
}

interface BansosClientProps {
  initialData: PenerimaBansos[];
  daftarWarga: WargaDropdown[];
}

export default function BansosClient({ initialData, daftarWarga }: BansosClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  // State Filter & Pencarian Tabel
  const [filterProgram, setFilterProgram] = useState("Semua Program");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // State Fitur Bulk (Massal)
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  // State Modal Tunggal Hapus Penerima
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPenerima, setSelectedPenerima] = useState<PenerimaBansos | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State Modal Form Alokasi Penerima Bansos (Warga)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedDefaultProgram, setSelectedDefaultProgram] = useState<string | undefined>(undefined);

  // 🚀 State Baru: Modal Form Master Program Bansos (Tambah/Edit)
  const [isProgramModalOpen, setIsProgramModalOpen] = useState(false);
  const [selectedProgramData, setSelectedProgramData] = useState<{
    nama_program: string;
    deskripsi?: string | null;
    jumlah_bantuan_default?: number | null;
    is_aktif: boolean;
  } | null>(null);

  // ----------------------------------------------------------------
  // LOGIKA AGREGASI STATS BAR
  // ----------------------------------------------------------------
  const programMap: Record<string, ProgramAgregasi> = {};
  let totalTersalurkan = 0;
  let totalMenunggu = 0;

  initialData.forEach((item) => {
    if (!programMap[item.nama_program]) {
      programMap[item.nama_program] = { nama: item.nama_program, totalPenerima: 0, periode: item.periode };
    }
    programMap[item.nama_program].totalPenerima += 1;

    if (item.status === "tersalurkan") {
      totalTersalurkan += 1;
    } else {
      totalMenunggu += 1;
    }
  });

  const daftarProgram = Object.values(programMap);
  const totalProgramAktif = daftarProgram.length;
  const totalPenerimaTerdaftar = initialData.length;

  // ----------------------------------------------------------------
  // LOGIKA FILTER REAL-TIME
  // ----------------------------------------------------------------
  const filteredData = initialData.filter((item) => {
    const matchProgram = filterProgram === "Semua Program" || item.nama_program === filterProgram;
    const matchStatus = filterStatus === "Semua" || item.status === filterStatus;
    const namaWarga = (item.profiles?.nama || item.anggota?.nama || "").toLowerCase();
    return matchProgram && matchStatus && namaWarga.includes(searchQuery.toLowerCase());
  });

  // ----------------------------------------------------------------
  // HANDLER CHECKBOX MANAGEMENT (BULK SELECT)
  // ----------------------------------------------------------------
  const handleRowSelectToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // ----------------------------------------------------------------
  // HANDLER BULK EXECUTION ACTION
  // ----------------------------------------------------------------
  const handleBulkUpdateStatus = async () => {
    const totalSelected = selectedIds.length;
    const confirmAction = confirm(`Tandai ${totalSelected} penerima sebagai sudah tersalurkan?`);
    if (!confirmAction) return;

    setIsBulkActionLoading(true);
    try {
      const { error } = await supabaseClient.from("bansos").update({ status: "tersalurkan" }).in("id", selectedIds);
      if (error) throw error;

      showToast("success", "Penyaluran Massal Berhasil", `${totalSelected} bansos warga berhasil ditandai Tersalurkan.`);
      setSelectedIds([]);
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      showToast("error", "Gagal Memproses Bulk", err.message || "Terjadi kendala sistem.");
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    const totalSelected = selectedIds.length;
    const confirmAction = confirm(`⚠️ Kritis: Cabut hak bantuan untuk ${totalSelected} warga tercentang sekaligus?`);
    if (!confirmAction) return;

    setIsBulkActionLoading(true);
    try {
      const { error } = await supabaseClient.from("bansos").delete().in("id", selectedIds);
      if (error) throw error;

      showToast("success", "Penghapusan Massal Sukses", `${totalSelected} penerima dikeluarkan dari program.`);
      setSelectedIds([]);
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      showToast("error", "Gagal Menghapus Massal", err.message);
    } finally {
      setIsBulkActionLoading(false);
    }
  };

  // ----------------------------------------------------------------
  // HANDLER TUNGGAL BARIS DATA
  // ----------------------------------------------------------------
  const handleUpdateStatusTunggal = async (id: string, namaWarga: string, statusBaru: "tersalurkan" | "pending") => {
    try {
      const { error } = await supabaseClient.from("bansos").update({ status: statusBaru }).eq("id", id);
      if (error) throw error;
      showToast("success", statusBaru === "tersalurkan" ? "Bansos Tersalurkan" : "Penyaluran Dibatalkan", `Status ${namaWarga} sukses diperbarui.`);
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      showToast("error", "Gagal", err.message);
    }
  };

  const handleOpenDelete = (penerima: PenerimaBansos) => {
    setSelectedPenerima(penerima);
    setIsDeleteModalOpen(true);
  };

  const handleExecuteDelete = async () => {
    if (!selectedPenerima) return;
    setIsDeleting(true);
    try {
      const { error } = await supabaseClient.from("bansos").delete().eq("id", selectedPenerima.id);
      if (error) throw error;
      showToast("success", "Penerima Dihapus", "Warga berhasil dikeluarkan dari program.");
      setIsDeleteModalOpen(false);
      setSelectedPenerima(null);
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      showToast("error", "Gagal", err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  // Trigger penyegaran data global dari form sukses (Penerima maupun Master Program)
  const handleRefreshServerData = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const columns: Column<PenerimaBansos>[] = [
    {
      key: "checkbox_bulk",
      label: "",
      render: (_, row) => {
        const isSelected = selectedIds.includes(row.id);
        return (
          <button type="button" onClick={() => handleRowSelectToggle(row.id)} className="text-slate-400 hover:text-slate-700 transition flex items-center justify-center mx-auto cursor-pointer">
            {isSelected ? <CheckSquare className="w-4.5 h-4.5 text-emerald-600" /> : <Square className="w-4.5 h-4.5" />}
          </button>
        );
      },
    },
    // {
    //   key: "id",
    //   label: "No",
    //   render: (_, row) => {
    //     const index = filteredData.findIndex((item) => item.id === row.id);
    //     return <span className="text-slate-400 font-medium">{index + 1}</span>;
    //   },
    // },
    {
      key: "nama_warga",
      label: "Nama Penerima (Warga)",
      render: (_, row) => <span className="font-semibold text-slate-800 uppercase">{row.profiles?.nama || row.anggota?.nama || "Nama Tidak Terdata"}</span>,
    },
    {
      key: "wilayah",
      label: "RT / RW",
      render: (_, row) => (
        <span className="inline-flex items-center gap-1 text-slate-600 font-medium text-xs">
          <MapPin className="w-3 h-3 text-slate-400" />
          RT {row.profiles?.rt || "00"} / RW {row.profiles?.rw || "00"}
        </span>
      ),
    },
    { key: "nama_program", label: "Nama Program" },
    {
      key: "jumlah_bantuan",
      label: "Jumlah Bantuan",
      render: (val) => <span className="font-bold text-slate-700">Rp {Number(val ?? 0).toLocaleString("id-ID")}</span>,
    },
    { key: "periode", label: "Periode" },
    {
    key: "status",
    label: "Status",
    render: (val) => {
      const statusStr = String(val);
      const isSelesai = statusStr === "tersalurkan";
      
      const statusFormatted = statusStr.charAt(0).toUpperCase() + statusStr.slice(1);

      return (
        <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${
          isSelesai 
            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
            : "bg-amber-50 text-amber-700 border-amber-200"
        }`}>
          {statusFormatted}
        </span>
      );
    },
  },
    {
      key: "aksi_kustom",
      label: "Aksi Penyaluran",
      render: (_, row) => {
        const namaWarga = row.profiles?.nama || row.anggota?.nama || "Warga";
        return (
          <div className="flex items-center gap-1.5">
            {row.status === "pending" ? (
              <button
                onClick={() => handleUpdateStatusTunggal(row.id, namaWarga, "tersalurkan")}
                className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold px-2 py-1 rounded-md shadow-sm transition cursor-pointer"
              >
                <CheckCircle className="w-3 h-3" />
                Salurkan
              </button>
            ) : (
              <button
                onClick={() => handleUpdateStatusTunggal(row.id, namaWarga, "pending")}
                className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-semibold px-2 py-1 rounded-md border border-slate-300 transition cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                Batalkan
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Program Aktif", value: totalProgramAktif, icon: Layers, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Penerima", value: totalPenerimaTerdaftar, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Sudah Tersalurkan", value: totalTersalurkan, icon: ShieldCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Menunggu", value: totalMenunggu, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              {/* setup card style */}
              <p className="text-[12px] font-semibold text-slate-500 uppercase ">{stat.label}</p>
              <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-800 uppercase">Katalog Alokasi Program</h3>
          </div>
          <button
            onClick={() => {
              setSelectedDefaultProgram(filterProgram !== "Semua Program" ? filterProgram : undefined);
              setIsAddModalOpen(true);
            }}
            className="md:mt-4 inline-flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition h-9 self-end md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Program
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {daftarProgram.map((prog) => (
            <div key={prog.nama} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 uppercase">{prog.nama}</h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full uppercase  bg-emerald-50 text-emerald-700">Aktif</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>
                    Total Alokasi: <strong className="text-slate-800">{prog.totalPenerima} Warga</strong>
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Periode Berjalan: {prog.periode}</p>
              </div>
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => {
                    setFilterProgram(prog.nama);
                    document.getElementById("tabel-penerima-section")?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 cursor-pointer"
                >
                  Lihat Penerima <ChevronLeft className="w-3.5 h-3.5 rotate-180" />
                </button>
                <button
                  onClick={async () => {
                    const matchedItem = initialData.find((d) => d.nama_program === prog.nama);
                    setSelectedProgramData({
                      nama_program: prog.nama,
                      deskripsi: matchedItem?.catatan || "",
                      jumlah_bantuan_default: matchedItem?.jumlah_bantuan || null,
                      is_aktif: true,
                    });
                    setIsProgramModalOpen(true);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-50 transition cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="tabel-penerima-section" className="space-y-4 relative">
        {selectedIds.length > 0 && (
          <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between shadow-xl border border-slate-800 z-20">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs md:text-sm font-medium">
                Terpilih <span className="font-extrabold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">{selectedIds.length}</span> penerima bantuan sosial
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkUpdateStatus}
                disabled={isBulkActionLoading}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-3.5 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {isBulkActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                Tandai Tersalurkan
              </button>
              <button
                onClick={handleBulkDelete}
                disabled={isBulkActionLoading}
                className="inline-flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 px-3 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Terpilih
              </button>
              <div className="w-px h-5 bg-slate-700 mx-1 hidden sm:block" />
              <button onClick={() => setSelectedIds([])} disabled={isBulkActionLoading} className="text-xs font-semibold text-slate-400 hover:text-white px-2 py-1 transition cursor-pointer">
                Batal
              </button>
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-slate-400 text-[12px]">Program Kerja</span>
              <select
                value={filterProgram}
                onChange={(e) => {
                  setFilterProgram(e.target.value);
                  setSelectedIds([]);
                }}
                className="bg-white border border-slate-300 rounded-lg py-1.5 pl-2 pr-8 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 min-w-[160px]"
              >
                <option value="Semua Program">📁 Semua Program</option>
                {daftarProgram.map((p) => (
                  <option key={p.nama} value={p.nama}>
                    🔹 {p.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-slate-400 text-[12px]">Status Cair</span>
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setSelectedIds([]);
                }}
                className="bg-white border border-slate-300 rounded-lg py-1.5 px-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Semua">📦 Semua Status</option>
                <option value="Menunggu">⏳ Menunggu</option>
                <option value="Tersalurkan">✅ Tersalurkan</option>
              </select>
            </div>
            <div className="flex flex-col gap-1 w-full sm:w-auto sm:min-w-[240px]">
              <span className="font-semibold text-slate-400 text-[12px]">Cari Nama Penerima</span>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Ketik nama warga..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIds([]);
                  }}
                  className="w-full bg-white border border-slate-300 rounded-lg py-1.5 pl-8 pr-3 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                />
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedDefaultProgram(filterProgram !== "Semua Program" ? filterProgram : undefined);
              setIsAddModalOpen(true);
            }}
            className="md:mt-4 inline-flex items-center justify-center gap-1.5 bg-[#15803d] hover:bg-[#166534] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition h-9 self-end md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Tambah Penerima
          </button>
        </div>

        {/* TABEL DATA DENGAN CHECKBOX */}
        <DataTable<PenerimaBansos> columns={columns} data={filteredData} isLoading={isPending} onDelete={handleOpenDelete} />
      </div>

      {/* CONFIRM MODAL SINGLE DELETE */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Batalkan Hak Penerima Bansos?"
        message={`Apakah Anda yakin ingin mencabut hak bantuan warga ${selectedPenerima?.profiles?.nama || selectedPenerima?.anggota?.nama || "ini"} secara permanen dari daftar program ${selectedPenerima?.nama_program}?`}
        confirmLabel="Ya, Cabut Hak"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleExecuteDelete}
        onCancel={() => setIsDeleteModalOpen(false)}
      />

      {/* FORM MODAL ALOKASI PENERIMA BANSOS BARU (WARGA) */}
      <FormPenerimaBansos isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={handleRefreshServerData} defaultProgram={selectedDefaultProgram} />

      {/* 🚀 FORM MODAL MANAJEMEN MASTER PROGRAM BANSOS (TAMBAH / EDIT KASKADE) */}
      <FormProgram
        isOpen={isProgramModalOpen}
        onClose={() => {
          setIsProgramModalOpen(false);
          setSelectedProgramData(null);
        }}
        onSuccess={handleRefreshServerData}
        initialData={selectedProgramData}
      />
    </div>
  );
}
