"use client";

import React, { useState, useMemo } from "react";
import { Plus, Search, AlertCircle, Eye, HandCoins, Send, Filter, CheckCircle2, FileText, Clock, X, Mail } from "lucide-react";
import { formatRupiah } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge"; // Pastikan sudah disesuaikan warnanya
import ConfirmModal from "../ConfirmModal";

export default function RetribusiClient({ initialData }: { initialData: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [wargaOptions, setWargaOptions] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [jumlah, setJumlah] = useState("");

    const [selectedWarga, setSelectedWarga] = useState<any>(null); // State buat nampung warga yg dipilih
    const [jatuhTempo, setJatuhTempo] = useState("");
    const [jenis, setJenis] = useState("Sampah");
    const [isSaving, setIsSaving] = useState(false)

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

      return data.map((item) => {
        const tglTempo = new Date(item.jatuh_tempo);
        const isOverdue = item.status !== "lunas" && tglTempo < hariIni;
        
        return {
          ...item,
          displayStatus: isOverdue ? "jatuh_tempo" : item.status
        };
      }).filter((item) => {
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
        else setSelectedIds(filteredData.map(i => i.id));
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
        return data.reduce((acc, curr) => {
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
            }, { total: 0, lunas: 0, belum: 0, jatuhTempoCount: 0 });
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
            const res = await fetch("/api/retribusi/create", { // Sesuaikan path route API Anda
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                warga_id: selectedWarga.id, // ID dari hasil pencarian
                jenis: jenis,
                jumlah: parseInt(jumlah.replace(/[^0-9]/g, "")), // Bersihkan format "Rp 1.000" jadi 1000
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

    return (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-bold text-slate-800">
        Manajemen Retribusi
      </h1>

      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-2 rounded-lg bg-[#1B4332] px-4 py-2 text-sm font-semibold text-white hover:bg-[#153427]"
      >
        <Plus className="h-4 w-4" />
        Buat Tagihan
      </button>
    </div>

    {/* Summary */}
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
        <div
          key={index}
          className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div>
            <p className="mb-1 text-[10px] font-bold tracking-wider text-slate-500">
              {card.title}
            </p>
            <p className="text-xl font-bold text-[#1B4332]">
              {card.val}
            </p>
          </div>

          <div className="rounded-full bg-slate-50 p-3 text-slate-400">
            {card.icon}
          </div>
        </div>
      ))}
    </div>

    {/* 2. FILTER BAR */}
<div className="bg-white p-4 rounded-lg flex items-center justify-between shadow-sm">
  <div className="flex gap-2 flex-wrap">
          <select className="border-slate-200 text-sm rounded-md px-3 py-2 border outline-none" onChange={(e) => setFilterJenis(e.target.value)}>
            <option value="Semua">Semua Program</option>
            {[...new Set(data.map(i => i.jenis))].map(j => <option key={j} value={j}>{j}</option>)}
          </select>
          <select className="border-slate-200 text-sm rounded-md px-3 py-2 border outline-none" onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="Semua">Semua Status</option>
            <option value="lunas">Lunas</option>
            <option value="belum_bayar">Belum Bayar</option>
            <option value="jatuh_tempo">Jatuh Tempo</option>
          </select>
          <input type="month" className="border-slate-200 text-sm rounded-md px-3 py-2 border outline-none" defaultValue={`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2, '0')}`} />
        </div>
        
        <button 
        disabled={selectedIds.length === 0}
        onClick={() => setIsReminderModalOpen(true)}
        className="flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-lg text-white text-sm font-semibold disabled:opacity-50 hover:bg-blue-700"
      >
        <Send className="h-4 w-4" /> Kirim Reminder ({selectedIds.length})
      </button>
  
      <div className="relative">
    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input 
            className="pl-9 pr-4 py-2 border rounded-md text-sm w-64 outline-none focus:border-[#1B4332]" 
            placeholder="Ketik nama warga..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-[#1B4332] text-white">
            <tr>
              <th className="p-4 w-10 text-center"><input type="checkbox" onChange={toggleSelectAll} checked={selectedIds.length === filteredData.length && filteredData.length > 0} /></th>
              <th className="p-4 text-left">NAMA WARGA</th>
              <th className="p-4 text-left">RT/RW</th>
              <th className="p-4 text-left">JENIS</th>
              <th className="p-4 text-left">JUMLAH</th>
              <th className="p-4 text-left">JATUH TEMPO</th>
              <th className="p-4 text-left">STATUS</th>
              <th className="p-4 text-center">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredData.length > 0 ? (
              filteredData.map((item) => {
                const tglTempo = new Date(item.jatuh_tempo);
                const selisihHari = Math.ceil((tglTempo.getTime() - new Date().getTime()) / (1000 * 3600 * 24));
                const hampir = item.displayStatus === "belum_bayar" && selisihHari >= 0 && selisihHari < 3;

                const rowClass = item.displayStatus === "jatuh_tempo" ? "bg-red-50" : hampir ? "bg-yellow-50" : "";

                return (
                  <tr key={item.id} className={`${rowClass} transition-colors hover:bg-slate-50`}>
                    <td className="p-4 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(item.id)} 
                        onChange={() => setSelectedIds(prev => prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id])} 
                      />
                    </td>
                    <td className="p-4 font-medium text-slate-800">
                      <div className="flex items-center gap-2">
                        {item.displayStatus === "jatuh_tempo" && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 flex-shrink-0">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                        )}
                        {item.warga_nama}
                      </div>
                    </td>
                    <td className="p-4 text-slate-600">RT {item.rt}/RW {item.rw}</td>
                    <td className="p-4 text-slate-600">{item.jenis}</td>
                    <td className="p-4 font-semibold text-slate-800">{formatRupiah(item.jumlah)}</td>
                    <td className="p-4 text-slate-600 whitespace-nowrap">
                      {new Date(item.jatuh_tempo).toLocaleDateString('id-ID')}
                    </td>
                    <td className="p-4">
                      <StatusBadge status={item.displayStatus} />
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center items-center gap-2">
                        {item.displayStatus === "lunas" ? (
                          <button className="px-3 py-1 border border-slate-300 rounded text-slate-600 hover:bg-slate-100 text-xs">
                            <Eye className="h-3 w-3 inline mr-1" /> Bukti
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => { setSelectedTagihan(item); setIsPayModalOpen(true); }} 
                              className={`px-3 py-1 rounded text-white text-xs font-medium ${item.displayStatus === "jatuh_tempo" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
                            >
                              Bayar
                            </button>
                            <button className={`px-3 py-1 border rounded text-xs ${item.displayStatus === "jatuh_tempo" ? "border-red-600 text-red-600" : "border-slate-300 text-slate-600"}`}>
                              <Mail className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">Tidak ada data ditemukan.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
              <h2 className="text-lg font-bold">
                Alokasi Retribusi Baru
              </h2>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="space-y-5 p-6">
            {/* Warga */}
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                PILIH WARGA *
              </label>

              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />

                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="— Cari Nama Warga —"
                  className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#1B4332]"
                />

                {isSearching && (
                  <div className="absolute right-3 top-3 text-[10px] text-slate-400">
                    Mencari...
                  </div>
                )}
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
                      <div className="text-sm font-semibold text-[#1B4332]">
                        {w.nama}
                      </div>

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
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  JENIS RETRIBUSI *
                </label>

                <select
                  value={jenis}
                  onChange={(e) => setJenis(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#1B4332]"
                >
                  <option value="Sampah">Sampah</option>
                  <option value="Pasar">Pasar</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  JUMLAH (RP) *
                </label>

                <input
                  value={jumlah}
                  onChange={(e) =>
                    setJumlah(formatRupiah(e.target.value))
                  }
                  placeholder="Rp 0"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm"
                />
              </div>
            </div>

            {/* Jatuh Tempo */}
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                JATUH TEMPO *
              </label>

              <input
                type="date"
                value={jatuhTempo}
                onChange={(e) => setJatuhTempo(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-600"
              />
            </div>

            {/* Catatan */}
            <div>
              <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                CATATAN TAMBAHAN
              </label>

              <textarea
                placeholder="Catatan khusus (opsional)"
                className="h-24 w-full resize-none rounded-lg border border-slate-200 px-4 py-3 text-sm"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 bg-slate-50 px-6 py-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Batal
            </button>

            <button
              onClick={handleSimpanTagihan}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-lg bg-[#1B4332] px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#153427] disabled:opacity-50"
            >
              {isSaving ? "Menyimpan..." : "Simpan Tagihan"}
            </button>
          </div>
        </div>
      </div>
    )}
  </div>
);
}