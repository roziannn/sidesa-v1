/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, Loader2, Save, Search, Check, HandHeart } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";

interface FormPenerimaBansosProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultProgram?: string;
}

const DAFTAR_BULAN = [
  { value: "Januari", label: "Januari" },
  { value: "Februari", label: "Februari" },
  { value: "Maret", label: "Maret" },
  { value: "April", label: "April" },
  { value: "Mei", label: "Mei" },
  { value: "Juni", label: "Juni" },
  { value: "Juli", label: "Juli" },
  { value: "Agustus", label: "Agustus" },
  { value: "September", label: "September" },
  { value: "Oktober", label: "Oktober" },
  { value: "November", label: "November" },
  { value: "Desember", label: "Desember" },
];

export default function FormPenerimaBansos({ isOpen, onClose, onSuccess, defaultProgram }: FormPenerimaBansosProps) {
  const { showToast } = useToast();

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const currentMonthIndex = useMemo(() => new Date().getMonth(), []);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // State List Data Pendukung dari DB
  const [listProgram, setListProgram] = useState<string[]>([]);
  const [listWarga, setListWarga] = useState<any[]>([]);
  const [isLoadingMaster, setIsLoadingMaster] = useState(false);

  // State Form Utama
  const [namaProgram, setNamaProgram] = useState("");
  const [penerimaId, setPenerimaId] = useState("");
  const [rawJumlahBantuan, setRawJumlahBantuan] = useState("");
  const [displayJumlahBantuan, setDisplayJumlahBantuan] = useState("");
  const [periodeBulan, setPeriodeBulan] = useState(DAFTAR_BULAN[currentMonthIndex].value);
  const [periodeTahun, setPeriodeTahun] = useState(currentYear.toString());
  const [catatan, setCatatan] = useState("");

  // State Kustom Searchable Combobox Keluarga
  const [searchWarga, setSearchWarga] = useState("");
  const [isDropdownWargaOpen, setIsDropdownWargaOpen] = useState(false);
  const [selectedKeluargaLabel, setSelectedKeluargaLabel] = useState("");

  // State Loading Submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Klik di luar dropdown warga
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownWargaOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 1. FETCH DATA DARI TABEL PROFILES
  useEffect(() => {
    if (!isOpen) return;

    // Reset Form setiap kali modal dibuka
    setNamaProgram(defaultProgram || "");
    setPenerimaId("");
    setRawJumlahBantuan("");
    setDisplayJumlahBantuan("");
    setPeriodeBulan(DAFTAR_BULAN[currentMonthIndex].value);
    setPeriodeTahun(currentYear.toString());
    setCatatan("");
    setSearchWarga("");
    setSelectedKeluargaLabel("");

    async function fetchMasterData() {
      setIsLoadingMaster(true);
      try {
        const { data: dataBansos, error: errBansos } = await supabaseClient.from("bansos").select("nama_program");
        if (errBansos) throw errBansos;

        const programUnik = Array.from(new Set((dataBansos || []).map((item) => item.nama_program))).sort();
        setListProgram(programUnik);

        const { data: dataProfiles, error: errWarga } = await supabaseClient.from("profiles").select("id, nama, rt, rw").eq("role", "warga").order("nama", { ascending: true });

        if (errWarga) throw errWarga;
        setListWarga(dataProfiles || []);
      } catch (err: any) {
        showToast("error", "Gagal Memuat Master Data", err.message || "Terjadi galat sistem fetch.");
      } finally {
        setIsLoadingMaster(false);
      }
    }

    fetchMasterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (defaultProgram) {
      setNamaProgram(defaultProgram);
    }
  }, [defaultProgram]);

  // 2. 🛠️ PERBAIKAN UTAMA: DEPENDENSI MENGGUNAKAN listWarga (BUKAN listKeluarga)
  const filteredWarga = useMemo(() => {
    if (!searchWarga.trim()) return listWarga;
    const q = searchWarga.toLowerCase();
    return listWarga.filter((w) => {
      const nama = (w.nama || "").toLowerCase();
      return nama.includes(q);
    });
  }, [searchWarga, listWarga]);

  // 3. HANDLER INPUT NOMINAL
  const handleJumlahBantuanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanNumbers = value.replace(/\D/g, "");
    setRawJumlahBantuan(cleanNumbers);

    if (cleanNumbers) {
      const formatted = Number(cleanNumbers).toLocaleString("id-ID");
      setDisplayJumlahBantuan(formatted);
    } else {
      setDisplayJumlahBantuan("");
    }
  };

  // 4. VALIDASI DAN SUBMIT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nominalBantuan = Number(rawJumlahBantuan);
    const tahunBantuan = Number(periodeTahun);
    const gabunganPeriode = `${periodeBulan} ${periodeTahun}`;

    if (!namaProgram || !penerimaId || !rawJumlahBantuan || !periodeBulan || !periodeTahun) {
      showToast("error", "Formulir Belum Lengkap", "Harap pastikan semua kolom bertanda bintang (*) telah diisi.");
      return;
    }

    if (nominalBantuan < 1000) {
      showToast("error", "Nominal Tidak Valid", "Jumlah bantuan minimal adalah Rp 1.000.");
      return;
    }

    if (periodeTahun.length !== 4 || tahunBantuan < 2020 || tahunBantuan > 2030) {
      showToast("error", "Tahun Tidak Valid", "Tahun harus berupa 4 digit angka dengan rentang waktu 2020 s.d 2030.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { count, error: errCheck } = await supabaseClient.from("bansos").select("*", { count: "exact", head: true }).eq("nama_program", namaProgram).eq("penerima_id", penerimaId).eq("periode", gabunganPeriode);

      if (errCheck) throw errCheck;

      if (count && count > 0) {
        showToast("error", "Data Duplikat Terdeteksi", `⚠️ ${selectedKeluargaLabel.split("(")[0].trim()} sudah terdaftar sebagai penerima ${namaProgram} untuk periode ${gabunganPeriode}.`);
        setIsSubmitting(false);
        return;
      }

      const { error: errInsert } = await supabaseClient.from("bansos").insert([
        {
          penerima_id: penerimaId,
          nama_program: namaProgram,
          jumlah_bantuan: nominalBantuan,
          periode: gabunganPeriode,
          catatan: catatan.trim() || null,
          status: "pending",
        },
      ]);

      if (errInsert) throw errInsert;

      showToast("success", "Penerima Ditambahkan", `Penerima berhasil ditambahkan ke program ${namaProgram}.`);
      onSuccess();
      onClose();
    } catch (err: any) {
      showToast("error", "Gagal Alokasi Data", err.message || "Gagal melakukan penyimpanan data jaminan sosial.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* MODAL HEADER */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-emerald-800">
            <HandHeart className="w-5 h-5 stroke-[2.25]" />
            <h3 className="font-bold text-slate-900 text-base">Alokasi Penerima Baru</h3>
          </div>
          <button type="button" onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* MODAL FORM CONTENT */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {/* FIELD 1: PROGRAM BANSOS */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Program Bansos <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              list="list-program-hints"
              required
              placeholder="Pilih atau ketik nama program baru..."
              value={namaProgram}
              onChange={(e) => setNamaProgram(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            />
            <datalist id="list-program-hints">
              {listProgram.map((prog, idx) => (
                <option key={idx} value={prog} />
              ))}
            </datalist>
          </div>

          {/* FIELD 2: SEARCHABLE DROPDOWN KEPALA KELUARGA */}
          <div className="space-y-1 relative" ref={dropdownRef}>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Pilih Penerima (Kepala Keluarga) <span className="text-red-500">*</span>
            </label>

            <div className="relative">
              <div
                onClick={() => !isLoadingMaster && setIsDropdownWargaOpen(!isDropdownWargaOpen)}
                className={`w-full border border-slate-300 rounded-xl px-3 py-2 text-sm min-h-[38px] flex items-center justify-between cursor-pointer transition ${
                  penerimaId ? "text-slate-800 font-medium bg-slate-50/50" : "text-slate-400"
                }`}
              >
                <span className="truncate pr-4">{selectedKeluargaLabel || (isLoadingMaster ? "Memuat data warga..." : "-- Cari Nama Kepala Keluarga --")}</span>
                <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </div>

              {isDropdownWargaOpen && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 flex flex-col max-h-[220px] overflow-hidden">
                  <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-slate-400" />
                    <input type="text" placeholder="Ketik nama kepala keluarga..." value={searchWarga} onChange={(e) => setSearchWarga(e.target.value)} className="w-full bg-transparent text-xs text-slate-800 focus:outline-none py-1" />
                    {searchWarga && (
                      <button type="button" onClick={() => setSearchWarga("")} className="text-xs text-slate-400 hover:text-slate-600 px-1">
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="overflow-y-auto flex-1 divide-y divide-slate-50">
                    {filteredWarga.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">Warga tidak ditemukan</p>
                    ) : (
                      filteredWarga.map((w) => {
                        const labelFull = `${w.nama.toUpperCase()} (RT ${w.rt || "00"}/RW ${w.rw || "00"})`;
                        const isCurrent = penerimaId === w.id;
                        return (
                          <div
                            key={w.id}
                            onClick={() => {
                              setPenerimaId(w.id);
                              setSelectedKeluargaLabel(labelFull);
                              setIsDropdownWargaOpen(false);
                              setSearchWarga("");
                            }}
                            className={`px-3 py-2 text-xs hover:bg-emerald-50 hover:text-emerald-900 transition flex items-center justify-between cursor-pointer ${isCurrent ? "bg-slate-50 text-emerald-700 font-bold" : "text-slate-600"}`}
                          >
                            <span className="truncate pr-2">{labelFull}</span>
                            {isCurrent && <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* FIELD 3: JUMLAH BANTUAN */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Jumlah Bantuan (Nominal Rupiah) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">Rp</span>
              <input
                type="text"
                required
                placeholder="Masukkan jumlah dalam Rupiah"
                value={displayJumlahBantuan}
                onChange={handleJumlahBantuanChange}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-mono font-bold"
              />
            </div>
          </div>

          {/* FIELD 4: PERIODE BANTUAN */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              Periode Bantuan <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={periodeBulan}
                onChange={(e) => setPeriodeBulan(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
              >
                {DAFTAR_BULAN.map((bln) => (
                  <option key={bln.value} value={bln.value}>
                    {bln.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                required
                min="2020"
                max="2030"
                placeholder="Contoh: 2026"
                value={periodeTahun}
                onChange={(e) => setPeriodeTahun(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-mono"
              />
            </div>
          </div>

          {/* FIELD 5: CATATAN */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center justify-between">
              <span>Catatan Tambahan</span>
              <span className="text-[10px] font-normal text-slate-400 normal-case">{catatan.length}/500 karakter</span>
            </label>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Catatan khusus untuk penerima ini (opsional)"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none"
            />
          </div>

          {/* MODAL FOOTER BUTTONS */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-2">
            <button type="button" disabled={isSubmitting} onClick={onClose} className="text-xs font-bold text-slate-500 hover:bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 transition cursor-pointer disabled:opacity-50">
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoadingMaster || listWarga.length === 0}
              className="inline-flex items-center gap-1.5 bg-[#15803d] hover:bg-[#166534] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Simpan Penerima
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
