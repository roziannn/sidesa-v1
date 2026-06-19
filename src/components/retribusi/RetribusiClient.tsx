/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { Plus, Search, AlertCircle, Eye,  Send, CheckCircle2, FileText, Clock, X, CoinsIcon, Package, FolderOpen, Receipt } from "lucide-react";
import { formatDate, formatRupiah } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge"; // Pastikan sudah disesuaikan warnanya
import ConfirmModal from "../ConfirmModal";
import TombolBayar from "@/components/retribusi/TombolBayar";
import DataTable, { Column } from "@/components/DataTable";
import Button from "@components/ui/Button";
import Input from "@components/ui/Input";
import Select from "@components/ui/Select";
import Modal from "@components/ui/Modal";

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
        <Button 
          variant="outline" 
          size="xs" 
          leftIcon={<FileText className="h-3 w-3" />}
        >
          Bukti
        </Button>
      ) : (
        <>
         <Button
          size="xs" 
          variant={item.displayStatus === "jatuh_tempo" ? "danger" : "outline"}
          leftIcon={<CoinsIcon className="w-3 h-3" />}
          onClick={() => {
            setSelectedTagihan(item);
            setIsPayModalOpen(true);
          }}
        >
          Bayar Manual
        </Button>
          
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
      <div className="bg-white p-4 rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex gap-2 flex-wrap">
          <Select 
          leftIcon={<FolderOpen className="w-4 h-4 text-emerald-600" />}
          className="w-48"
          
          onChange={(e) => setFilterJenis(e.target.value)}
        >
          <option value="Semua">Semua Program</option>
          {[...new Set(data.map((i) => i.jenis))].map((j) => (
            <option key={j} value={j}>
              {j}
            </option>
          ))}
        </Select>

        {/* Select Filter Status */}
        <Select 
          className="w-48"
          leftIcon={<Package className="w-4 h-4 text-emerald-600" />}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="Semua">Semua Status</option>
          <option value="lunas">Lunas</option>
          <option value="belum_bayar">Belum Bayar</option>
          <option value="jatuh_tempo">Jatuh Tempo</option>
        </Select>

          {/* input bulan/tahun yg berfungsi */}
          <Input
            type="month"
            defaultValue={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`}
            onChange={(e) => {
              const value = e.target.value;
              if (!value) return;
              
              const [tahun, bulan] = value.split("-");
              setFilterTahun(tahun);
              setFilterBulan((parseInt(bulan) - 1).toString());
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
          <Input
              className="w-64"
              placeholder="Cari nama warga..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />  
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
      
       <Modal
      open={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Alokasi Retribusi Baru"
      description="Tambah retribusi baru"
      size="md"
    >
      <div className="space-y-5">
        <Input
          label="Pilih Warga"
          required
          leftIcon={<Search className="w-4 h-4" />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari nama warga..."
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Jenis Retribusi"
            required
            onChange={(e) => setJenis(e.target.value)}
          >
            <option value="Sampah">Sampah</option>
            <option value="Pasar">Pasar</option>
            <option value="Lainnya">Lainnya</option>
          </Select>

          <Input
            label="Jumlah (Rp)"
            required
            value={jumlah}
            onChange={(e) => setJumlah(formatRupiah(e.target.value))}
            placeholder="Rp 0"
          />
        </div>

        {/* Jatuh Tempo */}
        <Input
          label="Jatuh Tempo"
          type="date"
          required
          value={jatuhTempo}
          onChange={(e) => setJatuhTempo(e.target.value)}
        />

        {/* Catatan */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-700">
            CATATAN TAMBAHAN
          </label>
          <textarea
            className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            placeholder="Catatan khusus (opsional)"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
          Batal
        </Button>
        <Button onClick={handleSimpanTagihan} loading={isSaving}>
          Simpan Tagihan
        </Button>
      </div>
    </Modal>
    </div>
  );
}
