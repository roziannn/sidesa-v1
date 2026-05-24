/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Loader2, Save, FolderHeart, AlertTriangle, HelpCircle } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";

interface ProgramBansosData {
  id?: string; // Digunakan jika ada internal master table id, atau fallback nama lama
  nama_program: string;
  deskripsi?: string | null;
  jumlah_bantuan_default?: number | null;
  is_aktif: boolean;
}

interface FormProgramProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: ProgramBansosData | null; // Jika terisi -> Mode Edit, jika null -> Mode Tambah
}

export default function FormProgram({ isOpen, onClose, onSuccess, initialData }: FormProgramProps) {
  const { showToast } = useToast();
  const isEditMode = !!initialData;

  // State Form Utama
  const [namaProgram, setNamaProgram] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [rawJumlahBantuan, setRawJumlahBantuan] = useState("");
  const [displayJumlahBantuan, setDisplayJumlahBantuan] = useState("");
  const [isAktif, setIsAktif] = useState(true);

  // State Kontrol Submit & Warning Perubahan Nama
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countPenerimaTerdampak, setCountPenerimaTerdampak] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);

  // ----------------------------------------------------------------
  // 1. INITIALIZE & RESET FORM DATA
  // ----------------------------------------------------------------
  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && initialData) {
      setNamaProgram(initialData.nama_program);
      setDeskripsi(initialData.deskripsi || "");
      setIsAktif(initialData.is_aktif ?? true);

      if (initialData.jumlah_bantuan_default) {
        const nominal = initialData.jumlah_bantuan_default.toString();
        setRawJumlahBantuan(nominal);
        setDisplayJumlahBantuan(Number(nominal).toLocaleString("id-ID"));
      } else {
        setRawJumlahBantuan("");
        setDisplayJumlahBantuan("");
      }
    } else {
      // Mode Tambah: Reset Kosong
      setNamaProgram("");
      setDeskripsi("");
      setRawJumlahBantuan("");
      setDisplayJumlahBantuan("");
      setIsAktif(true);
    }
    setShowWarningModal(false);
  }, [isOpen, isEditMode, initialData]);

  // ----------------------------------------------------------------
  // 2. HANDLER FORMAT RUPIAH
  // ----------------------------------------------------------------
  const handleJumlahBantuanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleanNumbers = value.replace(/\D/g, "");
    setRawJumlahBantuan(cleanNumbers);

    if (cleanNumbers) {
      setDisplayJumlahBantuan(Number(cleanNumbers).toLocaleString("id-ID"));
    } else {
      setDisplayJumlahBantuan("");
    }
  };

  // ----------------------------------------------------------------
  // 3. LOGIKA PRE-SUBMIT (CEK WARNING PERUBAHAN NAMA PROGRAM)
  // ----------------------------------------------------------------
  const handlePreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!namaProgram.trim()) {
      showToast("error", "Validasi Gagal", "Nama program wajib diisi.");
      return;
    }

    // Jika mode edit dan nama program berubah dari nilai aslinya
    if (isEditMode && initialData && namaProgram.trim().toLowerCase() !== initialData.nama_program.toLowerCase()) {
      setIsSubmitting(true);
      try {
        // Cek berapa banyak alokasi data penerima bansos yang terikat dengan nama program lama ini
        const { count, error } = await supabaseClient.from("bansos").select("*", { count: "exact", head: true }).eq("nama_program", initialData.nama_program);

        if (error) throw error;

        if (count && count > 0) {
          setCountPenerimaTerdampak(count);
          setShowWarningModal(true); // Tampilkan modal warning interseptor
          return;
        }
      } catch (err: any) {
        showToast("error", "Gagal Memeriksa Dampak Data", err.message || "Gagal melakukan scan relasi data.");
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    // Jika tidak ada perubahan nama atau dalam mode tambah, langsung eksekusi penyimpanan
    executeSave();
  };

  // ----------------------------------------------------------------
  // 4. EKSEKUSI SAVE DATA (INSERT / UPDATE)
  // ----------------------------------------------------------------
  const executeSave = async () => {
    setIsSubmitting(true);
    setShowWarningModal(false);

    const nominalBantuan = rawJumlahBantuan ? Number(rawJumlahBantuan) : null;
    const payload = {
      nama_program: namaProgram.trim(),
      deskripsi: deskripsi.trim() || null,
      jumlah_bantuan_default: nominalBantuan,
      is_aktif: isAktif,
    };

    try {
      if (isEditMode && initialData) {
        // PROSES TRANSAKSI UPDATE
        // A. Jika nama program berubah, update juga semua nama_program di tabel riwayat transaksi bansos
        if (namaProgram.trim().toLowerCase() !== initialData.nama_program.toLowerCase() && countPenerimaTerdampak > 0) {
          const { error: errCascade } = await supabaseClient.from("bansos").update({ nama_program: namaProgram.trim() }).eq("nama_program", initialData.nama_program);

          if (errCascade) throw errCascade;
        }

        // B. Update data master program itu sendiri (menggunakan ID jika ada, atau filter nama lama)
        const { error: errUpdate } = await supabaseClient
          .from("master_program_bansos") // Silakan sesuaikan nama tabel master program Anda
          .update(payload)
          .eq("nama_program", initialData.nama_program);

        if (errUpdate) throw errUpdate;
        showToast("success", "Program Diperbarui", "Perubahan data master program berhasil disimpan.");
      } else {
        // PROSES TRANSAKSI INSERT (MODE TAMBAH)
        // Cek duplikasi nama program sebelum insert
        const { count, error: errCheck } = await supabaseClient.from("master_program_bansos").select("*", { count: "exact", head: true }).eq("nama_program", namaProgram.trim());

        if (errCheck) throw errCheck;
        if (count && count > 0) {
          showToast("error", "Nama Program Duplikat", "Nama program tersebut sudah terdaftar di sistem.");
          setIsSubmitting(false);
          return;
        }

        const { error: errInsert } = await supabaseClient.from("master_program_bansos").insert([payload]);

        if (errInsert) throw errInsert;
        showToast("success", "Program Ditambahkan", "Master program bansos baru berhasil didaftarkan.");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      showToast("error", "Gagal Menyimpan Data", err.message || "Terjadi kendala pada sistem database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* MODAL UTAMA FORM PROGRAM */}
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
          {/* HEADER */}
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-emerald-800">
              <FolderHeart className="w-5 h-5 stroke-[2.25]" />
              <h3 className="font-bold text-slate-900 text-base">{isEditMode ? "Ubah Master Program" : "Tambah Program Baru"}</h3>
            </div>
            <button type="button" onClick={onClose} className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* KONTEN FORM */}
          <form onSubmit={handlePreSubmit} className="p-6 space-y-4 overflow-y-auto">
            {/* FIELD 1: NAMA PROGRAM */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1.5">
                Nama Program <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder='Contoh: "PKH 2026" atau "BLT Dana Desa"'
                value={namaProgram}
                onChange={(e) => setNamaProgram(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-medium"
              />
            </div>

            {/* FIELD 2: DESKRIPSI PROGRAM */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Deskripsi Program <span className="text-slate-400 font-normal">(Opsional)</span>
              </label>
              <textarea
                rows={3}
                maxLength={300}
                placeholder="Berikan penjelasan singkat mengenai tujuan, kriteria, atau target sasaran dari alokasi program bantuan ini..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition resize-none leading-relaxed"
              />
            </div>

            {/* FIELD 3: JUMLAH BANTUAN DEFAULT */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wide flex items-center justify-between">
                <span>Jumlah Bantuan Standar (Default)</span>
                <span className="text-[10px] text-slate-400 font-normal lowercase italic flex items-center gap-1">
                  <HelpCircle className="w-3 h-3 inline" /> dapat di-override nanti
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">Rp</span>
                <input
                  type="text"
                  placeholder="Masukkan nominal bantuan standar (Contoh: 300.000)"
                  value={displayJumlahBantuan}
                  onChange={handleJumlahBantuanChange}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition font-mono font-bold"
                />
              </div>
            </div>

            {/* FIELD 4: STATUS AKTIF / NONAKTIF */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-center justify-between mt-2">
              <div className="space-y-0.5 pr-4">
                <span className="text-xs font-bold text-slate-700 block uppercase tracking-wide">Status Publikasi</span>
                <p className="text-slate-500 text-[11px] leading-relaxed">Jika dinonaktifkan, program tidak akan muncul sebagai opsi pilihan saat mengalokasikan penerima baru.</p>
              </div>

              {/* TOGGLE SWITCH COMPONENT */}
              <label className="relative inline-flex items-center cursor-pointer select-none flex-shrink-0">
                <input type="checkbox" checked={isAktif} onChange={(e) => setIsAktif(e.target.checked)} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-bold text-slate-700 min-w-[50px] text-center">{isAktif ? "Aktif" : "Nonaktif"}</span>
              </label>
            </div>

            {/* ACTION BUTTON FOOTER */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-4">
              <button type="button" disabled={isSubmitting} onClick={onClose} className="text-xs font-bold text-slate-500 hover:bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 transition cursor-pointer disabled:opacity-50">
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 bg-[#15803d] hover:bg-[#166534] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                {isEditMode ? "Simpan Perubahan" : "Buat Program"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ================================================================ */}
      {/* MODAL INTERSEPTOR WARNING (CASCADING PERUBAHAN NAMA PROGRAM)     */}
      {/* ================================================================ */}
      {showWarningModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-[420px] shadow-2xl border border-amber-200 overflow-hidden flex flex-col animate-in scale-in duration-150">
            <div className="p-5 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-600 flex-shrink-0">
                  <AlertTriangle className="w-6 h-6 stroke-[2]" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-bold text-slate-900 text-sm">Konfirmasi Perubahan Nama</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Mengubah nama program dari <strong className="text-slate-900">"{initialData?.nama_program}"</strong> menjadi <strong className="text-emerald-700">"{namaProgram.trim()}"</strong> akan mempengaruhi{" "}
                    <span className="font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{countPenerimaTerdampak} data alokasi penerima</span> yang sudah berjalan.
                  </p>
                  <p className="text-slate-500 text-[11px] leading-relaxed italic">Data transaksi penerima akan tetap aman di sistem, tetapi kolom pengenal nama programnya akan ikut dimigrasikan secara otomatis. Lanjutkan tindakan ini?</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button type="button" onClick={() => setShowWarningModal(false)} className="text-xs font-bold text-slate-500 hover:bg-slate-100 px-3 py-2 rounded-lg border border-slate-200 transition cursor-pointer">
                  Gagalkan
                </button>
                <button type="button" onClick={executeSave} className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm transition cursor-pointer">
                  Ya, Ubah Secara Kaskade
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
