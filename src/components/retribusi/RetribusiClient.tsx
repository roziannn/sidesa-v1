/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { Plus, Search, AlertCircle, Eye, HandCoins, Send, Filter, CheckCircle2, FileText, Clock, X, Mail, CoinsIcon, Link } from "lucide-react";
import { formatDate, formatRupiah } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge"; // Pastikan sudah disesuaikan warnanya
import ConfirmModal from "../ConfirmModal";
import TombolBayar from "@/components/retribusi/TombolBayar";
import DataTable, { Column } from "@/components/DataTable";
import Button from "@components/ui/Button";

export default function RetribusiClient({ initialData }: { initialData: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [wargaOptions, setWargaOptions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [jumlah, setJumlah] = useState("");

  const [selectedWarga, setSelectedWarga] = useState<any>(null); // State buat nampung warga yg dipilih
  const [jatuhTempo, setJatuhTempo] = useState("");
  const [jenis, setJenis] = useState("Sampah");
  const [isSaving, setIsSaving] = useState(false);

  const [filterJenis, setFilterJenis] = useState("Semua");
  const [filterStatus, setFilterStatus] = useState("Semua");
  const [searchTerm, setSearchTerm] = useState("");

  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedTagihan, setSelectedTagihan] = useState<any>(null);
  const [isPaying, setIsPaying] = useState(false);

  const [data] = useState(initialData);

  const handleKirimReminder = async () => {
    setIsSendingReminder(true);
    try {
      const res = await fetch("/api/retribusi/reminder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (!res.ok) throw new Error("Gagal mengirim reminder");

      alert(`Reminder berhasil dikirim ke ${selectedIds.length} warga.`);
      setSelectedIds([]); // Reset pilihan
      setIsReminderModalOpen(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSendingReminder(false);
    }
  };

  const filteredData = useMemo(() => {
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    return data
      .map((item) => {
        const tglTempo = new Date(item.jatuh_tempo);
        const isOverdue = item.status !== "lunas" && tglTempo < hariIni;

        return {
          ...item,
          displayStatus: isOverdue ? "jatuh_tempo" : item.status,
        };
      })
      .filter((item) => {
        // Pastikan item.warga_nama ada, jika tidak gunakan string kosong agar tidak error
        const namaWarga = item.warga_nama ? item.warga_nama.toLowerCase() : "";
        const matchSearch = namaWarga.includes(searchTerm.toLowerCase());

        const matchJenis = filterJenis === "Semua" || item.jenis === filterJenis;
        const matchStatus = filterStatus === "Semua" || item.displayStatus === filterStatus;

        return matchSearch && matchJenis && matchStatus;
      });
  }, [data, searchTerm, filterJenis, filterStatus]);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [filterBulan, setFilterBulan] = useState(new Date().getMonth().toString());
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear().toString());

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredData.length) setSelectedIds([]);
    else setSelectedIds(filteredData.map((i) => i.id));
  };

  // helper untuk menentukan status hampir jatuh tempo (< 3 hari)
  const isHampirJatuhTempo = (tempo: string) => {
    const diff = new Date(tempo).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 3600 * 24));
    return days >= 0 && days < 3;
  };

  const summary = useMemo(() => {
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0); // reset jam ke 00:00 agar perbandingan tanggal akurat
    return data.reduce(
      (acc, curr) => {
        acc.total += curr.jumlah;

        const tglTempo = new Date(curr.jatuh_tempo);
        const isOverdue = curr.status !== "lunas" && tglTempo < hariIni;

        if (curr.status === "lunas") {
          acc.lunas += curr.jumlah;
        } else if (isOverdue) {
          // if sudah lewat hari ini dan belum lunas, hitung sebagai tunggakan dan jatuh tempo
          acc.belum += curr.jumlah;
          acc.jatuhTempoCount += 1;
        } else if (curr.status === "belum_bayar") {
          // if belum lunas dan belum jatuh tempo
          acc.belum += curr.jumlah;
        }
        return acc;
      },
      { total: 0, lunas: 0, belum: 0, jatuhTempoCount: 0 },
    );
  }, [data]);

  React.useEffect(() => {
    if (searchQuery.length < 2) {
      setWargaOptions([]);
      return;
    }

    const fetchWarga = async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/warga?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setWargaOptions(data);
      } catch (err) {
        console.error("Gagal cari warga:", err);
      } finally {
        setIsSearching(false);
      }
    };

    const delayDebounce = setTimeout(fetchWarga, 400); // Debounce 400ms
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSimpanTagihan = async () => {
    if (!selectedWarga || !jumlah) {
      alert("Mohon pilih warga dan masukkan jumlah!");
      return;
    }

    const getStatusTagihan = (item: any) => {
      if (item.status === "lunas") return "lunas";

      const hariIni = new Date();
      const tempo = new Date(item.jatuh_tempo);

      // if tanggal tempo sudah lewat dari hari ini
      if (tempo < hariIni) return "jatuh_tempo";

      return item.status; // "belum_bayar"
    };

    setIsSaving(true);
    try {
      const res = await fetch("/api/retribusi/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warga_id: selectedWarga.id, 
          jenis: jenis,
          jumlah: parseInt(jumlah.replace(/[^0-9]/g, "")), 
          jatuh_tempo: jatuhTempo,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Gagal menyimpan");
      }

      alert("Tagihan berhasil dibuat!");
      setIsModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBayarManualConfirm = async () => {
    if (!selectedTagihan) return;
    setIsPaying(true);
    try {
      const res = await fetch("/api/retribusi/bayar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedTagihan.id }),
      });

      if (!res.ok) throw new Error("Gagal memproses pembayaran");

      alert("Pembayaran tunai berhasil dicatat.");
      setIsPayModalOpen(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsPaying(false);
    }
  };

  const columns: Column<any>[] = [
    {
  label: <input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === filteredData.length && filteredData.length > 0} />,
  key: "checkbox",
  render: (_, row: any) => (
    <input 
      type="checkbox" 
      checked={selectedIds.includes(row.id)} 
      onChange={() => setSelectedIds((prev) => (prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id]))} 
    />
  )
},
  { label: "NAMA WARGA", key: "warga_nama" },
  { label: "RT/RW", key: "rt", render: (_, row) => `RT ${row.rt}/RW ${row.rw}` },
  { label: "JENIS", key: "jenis" },
  { label: "JUMLAH", key: "jumlah", render: (val) => formatRupiah(val as number) },
  { label: "JATUH TEMPO", key: "jatuh_tempo", render: (val) => formatDate(String(val)), },
  { 
    label: "STATUS", 
    key: "displayStatus", 
    render: (val) => <StatusBadge status={val as any} /> 
  },
 {
  label: "AKSI",
  key: "aksi",
  render: (_, item: any) => (
    <div className="flex justify-start items-center gap-1.5 flex-nowrap">
      {item.displayStatus === "lunas" ? (
        <button className="flex items-center justify-center h-[28px] px-3 border border-slate-300 rounded text-slate-600 hover:bg-slate-100 text-xs font-medium transition-all">
          <Eye className="h-3 w-3 mr-1.5" /> Bukti
        </button>
      ) : (
        <>
          <button
            onClick={() => {
              setSelectedTagihan(item);
              setIsPayModalOpen(true);
            }}
            className={`flex items-center justify-center h-[30px] px-3 rounded text-xs font-semibold border transition-all shadow-sm ${
              item.displayStatus === "jatuh_tempo" 
                ? "bg-red-500 hover:bg-red-600 text-white border-red-600" 
                : "bg-slate-200 hover:bg-slate-300 text-slate-700 border-slate-300"
            }`}
          >
          <CoinsIcon className="w-3 h-3 me-1"/>  Bayar Manual
          </button>
          
          {/* Pastikan TombolBayar di dalam memiliki height h-[30px] dan font-size text-xs */}
          <div className="h-[30px]">
            <TombolBayar
              retribusiId={String(item.id)}
              jumlah={item.jumlah}
              namaWarga={item.warga_nama}
              onSuccess={() => window.location.reload()}
              onPending={() => window.location.reload()}
            />
          </div>
        </>
      )}
    </div>
  ),
},
];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-800">Manajemen Retribusi</h1>
          <Button  onClick={() => setIsModalOpen(true)} variant="primary"
          leftIcon={
            
            <Plus className="h-4 w-4" />
          }
          >
            Buat Tagihan
          </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          {
            title: "TOTAL TAGIHAN",
            val: formatRupiah(summary.total),
            icon: <FileText className="h-4 w-4" />,
          },
          {
            title: "SUDAH LUNAS",
            val: formatRupiah(summary.lunas),
            icon: <CheckCircle2 className="h-4 w-4" />,
          },
          {
            title: "TUNGGAKAN",
            val: formatRupiah(summary.belum),
            icon: <AlertCircle className="h-4 w-4" />,
          },
          {
            title: "JATUH TEMPO",
            val: `${summary.jatuhTempoCount} Tagihan`,
            icon: <Clock className="h-4 w-4" />,
          },
        ].map((card, index) => (
          <div key={index} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-500">{card.title}</p>
              <p className="text-xl font-bold text-[#1B4332]">{card.val}</p>
            </div>

            <div className="rounded-full bg-slate-50 p-3 text-slate-400">{card.icon}</div>
          </div>
        ))}
      </div>

      {/* 2. FILTER BAR */}
      {/* 2. FILTER BAR */}
      <div className="bg-white p-4 rounded-lg flex items-center justify-between shadow-sm">
        {/* Bagian Kiri: Dropdowns */}
        <div className="flex gap-2 flex-wrap">
          <select className="border-slate-200 text-sm rounded-md px-3 py-2 border outline-none" onChange={(e) => setFilterJenis(e.target.value)}>
            <option value="Semua">Semua Program</option>
            {[...new Set(data.map((i) => i.jenis))].map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>

          <select className="border-slate-200 text-sm rounded-md px-3 py-2 border outline-none" onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="Semua">Semua Status</option>
            <option value="lunas">Lunas</option>
            <option value="belum_bayar">Belum Bayar</option>
            <option value="jatuh_tempo">Jatuh Tempo</option>
          </select>

          {/* Input Bulan/Tahun yang Berfungsi */}
          <input
            type="month"
            className="border-slate-200 text-sm rounded-md px-3 py-2 border outline-none"
            defaultValue={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`}
            onChange={(e) => {
              const [tahun, bulan] = e.target.value.split("-");
              setFilterTahun(tahun);
              setFilterBulan((parseInt(bulan) - 1).toString()); // Kurangi 1 karena JS Month dimulai dari 0
            }}
          />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            disabled={selectedIds.length === 0}
            onClick={() => setIsReminderModalOpen(true)}
            leftIcon={<Send className="h-4 w-4" />}
            className="border-slate-300 font-semibold"
          >
            Kirim Reminder ({selectedIds.length})
          </Button>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input className="pl-9 pr-4 py-2 border rounded-md text-sm w-64 outline-none focus:border-[#1B4332]" placeholder="Cari nama warga..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </div>
      </div>

        <DataTable 
          columns={columns} 
          data={filteredData.map(item => ({
              ...item,
          }))} 
        />

      <ConfirmModal
        isOpen={isPayModalOpen}
        title="Konfirmasi Pembayaran"
        message={`Tandai tagihan ${selectedTagihan?.warga_nama} sebesar ${formatRupiah(selectedTagihan?.jumlah || 0)} sebagai LUNAS?`}
        confirmLabel="Ya, Lunas"
        confirmVariant="primary"
        isLoading={isPaying}
        onConfirm={handleBayarManualConfirm}
        onCancel={() => setIsPayModalOpen(false)}
      />

      <ConfirmModal
        isOpen={isReminderModalOpen}
        title="Konfirmasi Kirim Reminder"
        message={`Anda akan mengirim pesan pengingat tagihan kepada ${selectedIds.length} warga yang dipilih. Lanjutkan?`}
        confirmLabel="Ya, Kirim"
        confirmVariant="primary"
        isLoading={isSendingReminder}
        onConfirm={handleKirimReminder}
        onCancel={() => setIsReminderModalOpen(false)}
      />

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2 text-[#1B4332]">
                <Plus className="h-5 w-5" />
                <h2 className="text-lg font-bold">Alokasi Retribusi Baru</h2>
              </div>

              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5 p-6">
              {/* Warga */}
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">PILIH WARGA *</label>

                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="— Cari Nama Warga —"
                    className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#1B4332]"
                  />

                  {isSearching && <div className="absolute right-3 top-3 text-[10px] text-slate-400">Mencari...</div>}
                </div>

                {wargaOptions.length > 0 && (
                  <div className="absolute z-50 mt-1 max-h-48 w-full max-w-[400px] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl">
                    {wargaOptions.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        className="w-full border-b p-3 text-left hover:bg-slate-50 last:border-none"
                        onClick={() => {
                          setSelectedWarga(w);
                          setWargaOptions([]);
                          setSearchQuery(w.nama);
                        }}
                      >
                        <div className="text-sm font-semibold text-[#1B4332]">{w.nama}</div>

                        <div className="text-[10px] text-slate-400">
                          RT {w.rt} / RW {w.rw}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Jenis & Jumlah */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">JENIS RETRIBUSI *</label>

                  <select value={jenis} onChange={(e) => setJenis(e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1B4332]">
                    <option value="Sampah">Sampah</option>
                    <option value="Pasar">Pasar</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">JUMLAH (RP) *</label>

                  <input value={jumlah} onChange={(e) => setJumlah(formatRupiah(e.target.value))} placeholder="Rp 0" className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm" />
                </div>
              </div>

              {/* Jatuh Tempo */}
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">JATUH TEMPO *</label>

                <input type="date" value={jatuhTempo} onChange={(e) => setJatuhTempo(e.target.value)} className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600" />
              </div>

              {/* Catatan */}
              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">CATATAN TAMBAHAN</label>

                <textarea placeholder="Catatan khusus (opsional)" className="h-24 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm" />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 bg-slate-50 px-6 py-4">
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">
                Batal
              </button>

              <button onClick={handleSimpanTagihan} disabled={isSaving} className="flex items-center gap-2 rounded-lg bg-[#1B4332] px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#153427] disabled:opacity-50">
                {isSaving ? "Menyimpan..." : "Simpan Tagihan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
