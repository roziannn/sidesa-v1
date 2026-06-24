/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";
import { FileText, ArrowLeft,Send } from "lucide-react";
import Link from "next/link";
import Textarea from "@components/ui/Textarea";
import Select from "@components/ui/Select";
import Input from "@components/ui/Input";
import SelectSearch from "@components/ui/SelectSearch";
import FileUpload, { UploadedFile } from "@components/ui/FileUpload";
import Button from "@components/ui/Button";

interface Profile {
  id: string;
  nama: string;
  rt: string;
  rw: string;
}

export default function RequestSuratPage() {
  const router = useRouter();
  const { showToast } = useToast();

  // Form States
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [jenisSurat, setJenisSurat] = useState("");
  const [jenisSuratLainnya, setJenisSuratLainnya] = useState("");
  const [keperluan, setKeperluan] = useState("");

  // UI States
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [files, setFiles] =
  useState<UploadedFile[]>([]);

  const fetchProfiles = async () => {
  setLoadingProfiles(true);

  try {
    const { data, error } =
      await supabaseClient
        .from('profiles')
        .select('id, nama, rt, rw')
        .order('nama');

    if (error) throw error;

    setProfiles(data || []);
  } catch (err: any) {
    console.error(
      'Error fetching profiles:',
      err.message
    );
  } finally {
    setLoadingProfiles(false);
  }
};

useEffect(() => {
  fetchProfiles();
}, []);

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const chosenFiles = Array.from(e.target.files);

    if (files.length + chosenFiles.length > 3) {
      showToast("error", "Batas Maksimal", "Maksimal berkas dokumen pendukung adalah 3 file.");
      return;
    }

    const validFiles: { file: File; preview: string; isPdf: boolean }[] = [];

    for (const file of chosenFiles) {
      // Validasi Ukuran (5MB = 5 * 1024 * 1024)
      if (file.size > 5 * 1024 * 1024) {
        showToast("error", "Berkas Terlalu Besar", `File ${file.name} melebihi kapasitas batas 5MB.`);
        continue;
      }

      const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
      const preview = isPdf ? "" : URL.createObjectURL(file);

      validFiles.push({ file, preview, isPdf });
    }

    setFiles((prev) => [...prev, ...validFiles]);
    e.target.value = ""; // Reset input file target
  };

  // Remove Selected File
  const handleRemoveFile = (index: number) => {
    setFiles((prev) => {
      const target = prev[index];
      if (!target.isPdf && target.preview) {
        URL.revokeObjectURL(target.preview);
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  // Main Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi Dasar
    if (!selectedProfile) {
      showToast("error", "Validasi Gagal", "Wajib memilih pemohon/warga!");
      return;
    }
    if (!jenisSurat) {
      showToast("error", "Validasi Gagal", "Silakan pilih jenis surat!");
      return;
    }
    if (jenisSurat === "Lainnya" && !jenisSuratLainnya.trim()) {
      showToast("error", "Validasi Gagal", "Harap isi kolom jenis surat lainnya!");
      return;
    }
    if (keperluan.trim().length < 20) {
      showToast("error", "Validasi Gagal", "Keperluan surat wajib dijabarkan minimal 20 karakter!");
      return;
    }

    setIsSubmitting(true);

    try {
      const finalJenisSurat = jenisSurat === "Lainnya" ? jenisSuratLainnya.trim() : jenisSurat;
      const uploadedUrls: string[] = [];

      // 1. Upload dokumen pendukung jika ada ke Supabase Storage
      for (const item of files) {
      if (!item.file) continue; 

      const fileExt = item.file.name.split(".").pop();
      const fileName = `${selectedProfile.id}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Sekarang item.file sudah dipastikan tidak null
      const { error: uploadError } = await supabaseClient.storage
        .from("surat-dokumen")
        .upload(filePath, item.file, { 
          cacheControl: "3600", 
          upsert: true 
        });

      if (uploadError) throw uploadError;

      // Ambil Public URL hasil upload
      const { data: urlData } = supabaseClient.storage
        .from("surat-dokumen")
        .getPublicUrl(filePath);

      if (urlData?.publicUrl) {
        uploadedUrls.push(urlData.publicUrl);
      }
    }

      // 2. Insert record baru ke tabel 'surat'
      const { data: newSurat, error: insertError } = await supabaseClient
        .from("surat")
        .insert({
          pemohon_id: selectedProfile.id,
          jenis_surat: finalJenisSurat,
          keperluan: keperluan.trim(),
          status: "pending",
          file_url: uploadedUrls[0] || null, // Atur default dokumen pendukung utama
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      showToast("success", "Permohonan Berhasil", "Permohonan surat berhasil diajukan!");

      // 3. Redirect ke halaman detail surat yang baru dibuat
      router.push(`/dashboard/surat`);
      router.refresh();
    } catch (err: any) {
      showToast("error", "Gagal menyimpan request", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      {/* Tombol Kembali */}
      <div className="flex items-center gap-2">
        <Link href="/dashboard/surat" className="text-slate-500 hover:text-slate-800 text-sm font-semibold flex items-center gap-1 transition">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Manajemen Surat
        </Link>
      </div>

      {/* Header Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800  flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" /> Buat Request Surat Jalan offline
          </h1>
          <p className="text-slate-500 text-xs mt-1">Gunakan form ini untuk meregistrasikan permintaan administrasi warga yang datang langsung secara tatap muka.</p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        {/* FIELD 1: PILIH PEMOHON (Searchable Dropdown) */}
       <div className="space-y-2">

        <SelectSearch
        label="1. Pilih Warga (Pemohon)"
        required
        placeholder="Cari nama warga pemohon..."
        value={selectedProfile?.id}
        options={profiles.map((profile) => ({
          value: profile.id,
          label: `${profile.nama} — RT ${profile.rt || '00'}/RW ${profile.rw || '00'}`,
        }))}
        onChange={(value) => {
          const selected = profiles.find(
            (p) => p.id === value
          );

          if (selected) {
            setSelectedProfile(selected);
          }
        }}
      />
      </div>

      {/* FIELD 2: JENIS SURAT */}
      <div className="space-y-2">
      <Select
        label="2. Pilih Jenis Surat"
        required
        value={jenisSurat}
        onChange={(e) => setJenisSurat(e.target.value)}
        leftIcon={
          <FileText className="h-4 w-4 text-emerald-600" />
        }
        className="bg-slate-50 focus:bg-white"
      >
        <option value="" disabled>
          -- Pilih Klasifikasi Surat --
        </option>

        <option value="Surat Keterangan Domisili">
          Surat Keterangan Domisili
        </option>

        <option value="Surat Keterangan Tidak Mampu (SKTM)">
          Surat Keterangan Tidak Mampu (SKTM)
        </option>

        <option value="Surat Keterangan Usaha">
          Surat Keterangan Usaha
        </option>

        <option value="Surat Pengantar KTP/KK">
          Surat Pengantar KTP/KK
        </option>

        <option value="Surat Izin Kegiatan">
          Surat Izin Kegiatan
        </option>

        <option value="Surat Keterangan Kematian">
          Surat Keterangan Kematian
        </option>

        <option value="Lainnya">
          Lainnya
        </option>
      </Select>

      {jenisSurat === 'Lainnya' && (
        <Input
          required
          placeholder="Masukkan jenis surat kustom di sini..."
          value={jenisSuratLainnya}
          onChange={(e) =>
            setJenisSuratLainnya(e.target.value)
          }
          leftIcon={
            <FileText className="h-4 w-4 text-slate-500" />
          }
          className="
            mt-2
            bg-white
            animate-in
            fade-in
            duration-200
          "
        />
      )}
    </div>

        {/* keperluan or tujuan */}
       <div className="space-y-2">
        <Textarea
        label="3. Keperluan atau tujuan surat"
          required
          rows={4}
          value={keperluan}
          onChange={(e) => setKeperluan(e.target.value)}
          placeholder="Contoh: Untuk mendaftar beasiswa di Universitas X atau kelengkapan berkas pernikahan jilid II"
          className="bg-slate-50 focus:bg-white"
        />
      </div>

        {/* FIELD 4: DOKUMEN PENDUKUNG (OPSIONAL) */}
        <div className="space-y-2">
         <FileUpload
            label="4. Dokumen Pendukung"
            helperText="opsional - maks 3 file"
            files={files}
            onChange={setFiles}
            maxFiles={3}
            maxSizeMB={5}
            accept="image/*,application/pdf"
          />
        </div>

        {/* ACTIONS / BUTTON SUBMIT */}
       <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
        <Link href="/dashboard/surat">
          <Button variant="outline">
            Batal
          </Button>
        </Link>

        <Button
          type="submit"
          loading={isSubmitting}
          disabled={keperluan.trim().length < 20}
          leftIcon={
            <Send className="h-4 w-4" />
          }
        >
          Submit Request Surat
        </Button>
      </div>
      </form>
    </div>
  );
}
