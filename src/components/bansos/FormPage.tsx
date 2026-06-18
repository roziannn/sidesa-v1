/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Loader2, Save, FolderHeart, AlertTriangle, HelpCircle } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Toggle from "@/components/ui/Toggle";
import ConfirmModal from "@components/ConfirmModal";

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
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
      title={
        isEditMode
          ? "Ubah Master Program"
          : "Tambah Program Baru"
      }
      description={
        isEditMode
          ? "Perbarui informasi program bantuan sosial."
          : "Tambahkan program bantuan sosial baru."
      }
    >
      <form
        onSubmit={handlePreSubmit}
        className="space-y-5"
      >
        <Input
          label="Nama Program"
          required
          placeholder='Contoh: "PKH 2026" atau "BLT Dana Desa"'
          value={namaProgram}
          onChange={(e) =>
            setNamaProgram(
              e.target.value
            )
          }
        />

        <Textarea
          label="Deskripsi Program"
          rows={4}
          maxLength={300}
          placeholder="Berikan penjelasan singkat mengenai tujuan, kriteria, atau target sasaran program bantuan."
          value={deskripsi}
          onChange={(e) =>
            setDeskripsi(
              e.target.value
            )
          }
        />

        <Input
          label="Jumlah Bantuan Standar"
          placeholder="300.000"
          value={displayJumlahBantuan}
          onChange={
            handleJumlahBantuanChange
          }
        />

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <Toggle
            checked={isAktif}
            onChange={setIsAktif}
            label="Status Publikasi"
            description="Jika dinonaktifkan, program tidak akan muncul saat alokasi penerima baru."
          />
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>

          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            leftIcon={
              !isSubmitting ? (
                <Save className="w-4 h-4" />
              ) : undefined
            }
          >
            {isEditMode
              ? "Simpan Perubahan"
              : "Buat Program"}
          </Button>
        </div>
      </form>
    </Modal>

   <ConfirmModal
      isOpen={showWarningModal}
      title="Konfirmasi Perubahan Nama"
      message={`Mengubah nama program dari "${
        initialData?.nama_program ?? ""
      }" menjadi "${namaProgram.trim()}" akan memperbarui ${countPenerimaTerdampak} data penerima yang sudah terkait dengan program ini. Tindakan ini akan dilakukan secara otomatis ke seluruh data yang terdampak.`}
      confirmLabel="Ya, Ubah Kaskade"
      confirmVariant="warning"
      isLoading={isSubmitting}
      onCancel={() =>
        setShowWarningModal(false)
      }
      onConfirm={executeSave}
    />
    </>
  );
}
