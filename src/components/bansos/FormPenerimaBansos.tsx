/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { X, Loader2, Save, Search, Check, HandHeart } from "lucide-react";
import { supabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@components/ui/Select";
import SelectSearch from "@components/ui/SelectSearch";

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
  const [isDropdownWargaOpen, setIsDropdownWargaOpen] = useState(false);
  const [selectedKeluargaLabel, setSelectedKeluargaLabel] = useState("");

  // State Loading Submit
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Klik di luar dropdown warga
  

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
  <Modal
    open={isOpen}
    onClose={onClose}
    size="lg"
    title="Alokasi Penerima Baru"
    description="Tambahkan warga sebagai penerima program bantuan sosial."
  >
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >

      {/* PROGRAM */}
      <div className="space-y-1">
        <SelectSearch
          label="Program Bansos"
          required
          placeholder="Cari program bantuan..."
          value={namaProgram}
          onChange={setNamaProgram}
          options={listProgram.map((prog) => ({
            value: prog,
            label: prog,
          }))}
        />
      </div>

      {/* PENERIMA */}
      <div>
        <SelectSearch
            label="Pilih Penerima (Kepala Keluarga)"
            required
            placeholder="Cari nama kepala keluarga..."
            value={penerimaId}
            onChange={setPenerimaId}
            options={listWarga.map((w) => ({
              value: w.id,
              label: `${w.nama.toUpperCase()} (RT ${w.rt || '00'}/RW ${
                w.rw || '00'
              })`,
            }))}
          />
      </div>

      {/* NOMINAL */}
      <div className="space-y-1">
        <Input
          label="Jumlah Bantuan"
          required
          placeholder="Masukkan jumlah bantuan"
          value={displayJumlahBantuan}
          onChange={handleJumlahBantuanChange}
        />
      </div>

      {/* PERIODE */}
      <div className="space-y-1">
        <label className="text-xs font-bold text-slate-600 uppercase tracking-wide">
          Periode Bantuan
        </label>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Bulan"
            value={periodeBulan}
            onChange={(e) =>
              setPeriodeBulan(
                e.target.value
              )
            }
          >
            {DAFTAR_BULAN.map((bln) => (
              <option
                key={bln.value}
                value={bln.value}
              >
                {bln.label}
              </option>
            ))}
          </Select>

          <Input
            label="Tahun"
            type="number"
            min={2020}
            max={2030}
            value={periodeTahun}
            onChange={(e) =>
              setPeriodeTahun(
                e.target.value
              )
            }
          />
        </div>
      </div>

      {/* CATATAN */}
      <div className="space-y-1">
       <Textarea
          label="Catatan Tambahan"
          rows={3}
          maxLength={500}
          placeholder="Catatan khusus untuk penerima ini (opsional)"
          value={catatan}
          onChange={(e) =>
            setCatatan(e.target.value)
          }
        />
      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
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
          disabled={
            isLoadingMaster ||
            listWarga.length === 0
          }
          leftIcon={
            !isSubmitting ? (
              <Save className="w-4 h-4" />
            ) : undefined
          }
        >
          Simpan Penerima
        </Button>
      </div>
    </form>
  </Modal>
);
}
