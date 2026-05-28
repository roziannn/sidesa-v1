/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";
import { FileText, User, Search, ChevronDown, Upload, X, File, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [jenisSurat, setJenisSurat] = useState("");
  const [jenisSuratLainnya, setJenisSuratLainnya] = useState("");
  const [keperluan, setKeperluan] = useState("");
  const [files, setFiles] = useState<{ file: File; preview: string; isPdf: boolean }[]>([]);

  // UI States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch profiles based on search query (Debounced or triggered on query change)
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoadingProfiles(true);
      try {
        let query = supabaseClient.from("profiles").select("id, nama, rt, rw").order("nama");

        if (searchQuery.trim() !== "") {
          query = query.ilike("nama", `%${searchQuery}%`);
        } else {
          // Limit default view to 10 profiles if empty search
          query = query.limit(10);
        }

        const { data, error } = await query;
        if (error) throw error;
        setProfiles(data || []);
      } catch (err: any) {
        console.error("Error fetching profiles:", err.message);
      } finally {
        setLoadingProfiles(false);
      }
    };

    const timer = setTimeout(() => {
      fetchProfiles();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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
        const fileExt = item.file.name.split(".").pop();
        const fileName = `${selectedProfile.id}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabaseClient.storage.from("surat-dokumen").upload(filePath, item.file, { cacheControl: "3600", upsert: true });

        if (uploadError) throw uploadError;

        // Ambil Public URL hasil upload
        const { data: urlData } = supabaseClient.storage.from("surat-dokumen").getPublicUrl(filePath);

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
          <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" /> Buat Request Surat Jalan offline
          </h1>
          <p className="text-slate-500 text-xs mt-1">Gunakan form ini untuk meregistrasikan permintaan administrasi warga yang datang langsung secara tatap muka.</p>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
        {/* FIELD 1: PILIH PEMOHON (Searchable Dropdown) */}
        <div className="space-y-2" ref={dropdownRef}>
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            1. Pilih Warga / Pemohon <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 p-3.5 rounded-xl text-sm font-medium text-left flex items-center justify-between transition-all focus:ring-2 focus:ring-emerald-500/10"
            >
              {selectedProfile ? (
                <span className="text-slate-800 font-semibold">
                  {selectedProfile.nama} —{" "}
                  <span className="text-slate-500 font-normal">
                    RT {selectedProfile.rt}/RW {selectedProfile.rw}
                  </span>
                </span>
              ) : (
                <span className="text-slate-400">Cari nama warga pemohon...</span>
              )}
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-100">
                {/* Search Input inside Dropdown */}
                <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400 ml-2 shrink-0" />
                  <input
                    type="text"
                    placeholder="Ketik nama warga untuk memfilter..."
                    className="w-full bg-transparent p-1.5 text-sm outline-none text-slate-800 placeholder-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Dropdown Options */}
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                  {loadingProfiles ? (
                    <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" /> Memuat data warga...
                    </div>
                  ) : profiles.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">Warga tidak ditemukan. Coba keyword lain.</div>
                  ) : (
                    profiles.map((profile) => (
                      <button
                        key={profile.id}
                        type="button"
                        onClick={() => {
                          setSelectedProfile(profile);
                          setIsDropdownOpen(false);
                        }}
                        className={`w-full p-3 text-left text-sm hover:bg-emerald-50/50 flex items-center gap-2 transition-colors ${selectedProfile?.id === profile.id ? "bg-emerald-50 font-semibold text-emerald-700" : "text-slate-700"}`}
                      >
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <div>
                          <div className="font-medium">{profile.nama}</div>
                          <div className="text-xs text-slate-400">
                            RT {profile.rt || "00"} / RW {profile.rw || "00"}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FIELD 2: JENIS SURAT */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            2. Jenis Surat <span className="text-red-500">*</span>
          </label>
          <select
            required
            className="w-full bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all cursor-pointer"
            value={jenisSurat}
            onChange={(e) => setJenisSurat(e.target.value)}
          >
            <option value="" disabled>
              -- Pilih Klasifikasi Surat --
            </option>
            <option value="Surat Keterangan Domisili">Surat Keterangan Domisili</option>
            <option value="Surat Keterangan Tidak Mampu (SKTM)">Surat Keterangan Tidak Mampu (SKTM)</option>
            <option value="Surat Keterangan Usaha">Surat Keterangan Usaha</option>
            <option value="Surat Pengantar KTP/KK">Surat Pengantar KTP/KK</option>
            <option value="Surat Izin Kegiatan">Surat Izin Kegiatan</option>
            <option value="Surat Keterangan Kematian">Surat Keterangan Kematian</option>
            <option value="Lainnya">Lainnya</option>
          </select>

          {/* Conditional Input "Lainnya" */}
          {jenisSurat === "Lainnya" && (
            <input
              type="text"
              required
              placeholder="Masukkan jenis surat kustom di sini..."
              className="w-full border border-slate-200 p-3 rounded-xl text-sm bg-white outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all mt-2 animate-in fade-in duration-200"
              value={jenisSuratLainnya}
              onChange={(e) => setJenisSuratLainnya(e.target.value)}
            />
          )}
        </div>

        {/* FIELD 3: KEPERLUAN / TUJUAN */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
              3. Keperluan / Tujuan Surat <span className="text-red-500">*</span>
            </label>
            <span className={`text-[10px] font-bold ${keperluan.trim().length >= 20 ? "text-emerald-600" : "text-slate-400"}`}>{keperluan.trim().length} / Min 20 Karakter</span>
          </div>
          <textarea
            required
            rows={4}
            placeholder="Contoh: Untuk mendaftar beasiswa di Universitas X atau kelengkapan berkas pernikahan jilid II"
            className="w-full border border-slate-200 p-3.5 rounded-xl text-sm bg-slate-50 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all resize-none"
            value={keperluan}
            onChange={(e) => setKeperluan(e.target.value)}
          />
        </div>

        {/* FIELD 4: DOKUMEN PENDUKUNG (OPSIONAL) */}
        <div className="space-y-2">
          <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider">
            4. Dokumen Pendukung <span className="text-slate-400 text-[10px] font-normal lowercase">(opsional - maks 3 file)</span>
          </label>

          {/* Upload Dropzone Container */}
          {files.length < 3 && (
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-emerald-50/10 transition group relative cursor-pointer">
              <input type="file" multiple accept="image/*, application/pdf" className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" onChange={handleFileChange} />
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-emerald-600 transition" />
                <span className="text-xs font-bold text-slate-600 group-hover:text-slate-800">Tarik berkas atau klik untuk mengunggah</span>
                <span className="text-[10px] text-slate-400">Mendukung format gambar (PNG, JPG) & PDF hingga ukuran 5MB</span>
              </div>
            </div>
          )}

          {/* Upload Previews List */}
          {files.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {files.map((item, idx) => (
                <div key={idx} className="relative border border-slate-200 rounded-xl p-3 bg-white flex items-center gap-3 shadow-sm animate-in zoom-in-95 duration-100">
                  {item.isPdf ? (
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-lg flex items-center justify-center shrink-0">
                      <File className="w-6 h-6" />
                    </div>
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.preview} alt="preview berkas" className="w-12 h-12 object-cover rounded-lg bg-slate-100 shrink-0 border" />
                  )}
                  <div className="overflow-hidden flex-1">
                    <p className="text-xs font-semibold text-slate-700 truncate">{item.file.name}</p>
                    <p className="text-[10px] text-slate-400">{(item.file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                  <button type="button" onClick={() => handleRemoveFile(idx)} className="p-1 text-slate-400 hover:text-red-500 rounded-full hover:bg-slate-100 transition shrink-0" title="Hapus file">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTIONS / BUTTON SUBMIT */}
        <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
          <Link href="/dashboard/surat" className="border border-slate-200 hover:bg-slate-50 text-slate-600 px-5 py-3 rounded-xl text-sm font-bold transition shadow-sm">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || keperluan.trim().length < 20}
            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-sm font-bold transition shadow-md flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Memproses Penyimpanan...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit Request Surat
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
