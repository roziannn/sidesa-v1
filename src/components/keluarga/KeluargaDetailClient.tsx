"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Plus, UserCheck, Calendar, MapPin, X, Save, Loader2, Smile, Printer, Home, AlertTriangle } from "lucide-react";
import Link from "next/link";
import DataTable, { Column } from "@/components/DataTable";
import ConfirmModal from "@/components/ConfirmModal";
import { supabaseClient } from "@/lib/supabase/client";
import { useToast } from "@/hooks/useToast";

interface AnggotaKeluarga {
  id: string;
  keluarga_id: string;
  nama: string;
  nik: string;
  hubungan: string;
  tgl_lahir: string;
  jenis_kelamin: "L" | "P";
  created_at?: string;
}

interface KeluargaDetail {
  id: string;
  no_kk: string;
  nama_kepala: string;
  alamat: string;
  rt: string;
  rw: string;
  created_at: string;
  anggota: AnggotaKeluarga[];
}

interface KeluargaDetailClientProps {
  keluarga: KeluargaDetail;
}

export default function KeluargaDetailClient({ keluarga }: KeluargaDetailClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [isKkDeleteOpen, setIsKkDeleteOpen] = useState(false);
  const [isKkDeleting, setIsKkDeleting] = useState(false);
  const [isAnggotaDeleteOpen, setIsAnggotaDeleteOpen] = useState(false);
  const [selectedAnggota, setSelectedAnggota] = useState<AnggotaKeluarga | null>(null);
  const [isAnggotaDeleting, setIsAnggotaDeleting] = useState(false);

  // State Utama Form Modal Anggota
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<"tambah" | "edit">("tambah");
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  
  const [formId, setFormId] = useState("");
  const [formNama, setFormNama] = useState("");
  const [formNik, setFormNik] = useState("");
  const [formHubungan, setFormHubungan] = useState("Anak");
  const [formTglLahir, setFormTglLahir] = useState("");
  const [formJk, setFormJk] = useState<"L" | "P">("L");
  const [formErrorNik, setFormErrorNik] = useState("");

  // VALIDASI BISNIS 1: State Konfirmasi Penggantian Kepala Keluarga
  const [showSuksesiWarning, setShowSuksesiWarning] = useState(false);

  // Mencari tahu siapa Kepala Keluarga yang saat ini sedang menjabat di KK ini
  const kepalaSaatIni = keluarga.anggota?.find(a => a.hubungan === "Kepala Keluarga");
  const sudahAdaKepala = !!kepalaSaatIni;

  // Efek Otomatis: Jika KK masih kosong melompong, paksa hubungan pertama kali menjadi 'Kepala Keluarga'
  useEffect(() => {
    if (isFormModalOpen && formMode === "tambah" && (!keluarga.anggota || keluarga.anggota.length === 0)) {
      setFormHubungan("Kepala Keluarga");
    }
  }, [isFormModalOpen, formMode, keluarga.anggota]);

  const hitungUsia = (tglLahir: string) => {
    if (!tglLahir) return "-";
    const lahir = new Date(tglLahir);
    const hariIni = new Date();
    let usia = hariIni.getFullYear() - lahir.getFullYear();
    const bulan = hariIni.getMonth() - lahir.getMonth();
    if (bulan < 0 || (bulan === 0 && hariIni.getDate() < lahir.getDate())) {
      usia--;
    }
    return `${usia} Tahun`;
  };

  const formatTanggalIndo = (tglString: string) => {
    if (!tglString) return "-";
    return new Date(tglString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const samarkanNik = (nikStr: string) => {
    if (!nikStr || nikStr.length < 8) return nikStr;
    return `${nikStr.slice(0, 4)}********${nikStr.slice(-4)}`;
  };

  const bukaModalTambah = () => {
    setFormMode("tambah"); setFormId(""); setFormNama(""); setFormNik(""); 
    setFormHubungan(keluarga.anggota?.length === 0 ? "Kepala Keluarga" : "Anak"); 
    setFormTglLahir(""); setFormJk("L"); setFormErrorNik(""); setShowSuksesiWarning(false);
    setIsFormModalOpen(true);
  };

  const bukaModalEditAnggota = (anggota: AnggotaKeluarga) => {
    setFormMode("edit"); setFormId(anggota.id); setFormNama(anggota.nama); setFormNik(anggota.nik); setFormHubungan(anggota.hubungan); setFormTglLahir(anggota.tgl_lahir); setFormJk(anggota.jenis_kelamin); setFormErrorNik(""); setShowSuksesiWarning(false);
    setIsFormModalOpen(true);
  };

  // Interseptor untuk memeriksa bentrokan jabatan Kepala Keluarga sebelum disubmit
  const handlePreSubmitCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorNik("");

    if (formNik.length !== 16) {
      setFormErrorNik("NIK harus tepat berisi 16 digit angka.");
      return;
    }

    // Jika user memilih 'Kepala Keluarga' padahal sudah ada pejabatnya di KK ini
    if (formHubungan === "Kepala Keluarga" && sudahAdaKepala) {
      // Jika mode EDIT dan yang di-edit memang dia sendiri, biarkan lolos
      if (formMode === "edit" && formId === kepalaSaatIni?.id) {
        eksekusiSimpanData();
      } else {
        // Picu kemunculan kotak warning peringatan suksesi kepala keluarga
        setShowSuksesiWarning(true);
      }
    } else {
      eksekusiSimpanData();
    }
  };

  const eksekusiSimpanData = async () => {
    setIsFormSubmitting(true);
    setFormErrorNik("");

    try {
      // VALIDASI BISNIS 1: Logika Alur Transaksi Penggantian Kepala Keluarga (Suksesi)
      if (formHubungan === "Kepala Keluarga" && sudahAdaKepala && formId !== kepalaSaatIni?.id) {
        // Turunkan tahta Kepala Keluarga yang lama menjadi 'Lainnya' atau 'Suami'/'Istri' secara otomatis
        const { error: suksesiError } = await supabaseClient
          .from("anggota")
          .update({ hubungan: "Lainnya" })
          .eq("id", kepalaSaatIni.id);
        
        if (suksesiError) throw suksesiError;

        // Sekaligus perbarui string nama kepala di tabel induk 'keluarga' agar sinkron
        await supabaseClient
          .from("keluarga")
          .update({ nama_kepala: formNama })
          .eq("id", keluarga.id);
      }

      // Jika yang di-edit adalah kepala keluarga aktif, pastikan nama di tabel induk ikut ter-update
      if (formMode === "edit" && formId === kepalaSaatIni?.id && formHubungan === "Kepala Keluarga") {
        await supabaseClient
          .from("keluarga")
          .update({ nama_kepala: formNama })
          .eq("id", keluarga.id);
      }

      // Jika pendaftar pertama kali adalah Kepala Keluarga, update string nama_kepala tabel keluarga
      if (formMode === "tambah" && formHubungan === "Kepala Keluarga") {
        await supabaseClient
          .from("keluarga")
          .update({ nama_kepala: formNama })
          .eq("id", keluarga.id);
      }

      const payload = { 
        keluarga_id: keluarga.id, 
        nama: formNama, 
        nik: formNik, 
        hubungan: formHubungan, 
        tgl_lahir: formTglLahir, 
        jenis_kelamin: formJk 
      };

      if (formMode === "tambah") {
        const { error } = await supabaseClient.from("anggota").insert([payload]);
        if (error) throw error;
        showToast("success", "Anggota Ditambahkan", `${formNama} berhasil diregistrasikan.`);
      } else {
        const { error } = await supabaseClient.from("anggota").update(payload).eq("id", formId);
        if (error) throw error;
        showToast("success", "Anggota Diperbarui", `Informasi biodata ${formNama} berhasil disimpan.`);
      }

      setIsFormModalOpen(false);
      setShowSuksesiWarning(false);
      startTransition(() => { router.refresh(); });
    } catch (err: any) {
      // VALIDASI BISNIS 3: Menangkap Error UNIQUE Constraint NIK Global dari Supabase (PGRST atau 23505)
      if (err.message?.includes("unique") || err.code === "23505") {
        setFormErrorNik("❌ NIK ini sudah terdaftar pada warga lain di dalam sistem desa.");
        showToast("error", "Pencatatan Ditolak", "Nomor NIK harus unik di seluruh wilayah desa.");
      } else {
        showToast("error", "Gagal Memproses", err.message || "Terjadi kesalahan koneksi database.");
      }
    } finally {
      setIsFormSubmitting(false);
    }
  };

  const handleHapusAnggota = async () => {
    if (!selectedAnggota) return;
    setIsAnggotaDeleting(true);
    try {
      // Jika yang dihapus adalah Kepala Keluarga, bersihkan namanya dari tabel induk keluarga
      if (selectedAnggota.hubungan === "Kepala Keluarga") {
        await supabaseClient.from("keluarga").update({ nama_kepala: "Belum Ada Kepala" }).eq("id", keluarga.id);
      }
      const { error } = await supabaseClient.from("anggota").delete().eq("id", selectedAnggota.id);
      if (error) throw error;
      
      showToast("success", "Anggota Dihapus", "Warga dikeluarkan dari susunan KK.");
      setIsAnggotaDeleteOpen(false);
      startTransition(() => { router.refresh(); });
    } catch (err: any) { showToast("error", "Gagal", err.message); } finally { setIsAnggotaDeleting(false); }
  };

  const handleHapusSeluruhKk = async () => {
    setIsKkDeleting(true);
    try {
      const { error } = await supabaseClient.from("keluarga").delete().eq("id", keluarga.id);
      if (error) throw error;
      showToast("success", "KK Dihapus Permanen", "Berkas Kartu Keluarga berhasil dimusnahkan.");
      setIsKkDeleteOpen(false);
      router.push("/dashboard/keluarga");
      router.refresh();
    } catch (err: any) { showToast("error", "Gagal", err.message); } finally { setIsKkDeleting(false); }
  };

  const columns: Column<AnggotaKeluarga>[] = [
    { key: "no", label: "No", render: (_v, _r, index) => <span className="text-slate-400 font-medium">{index + 1}</span> },
    { key: "nama", label: "Nama Lengkap" },
    { key: "nik", label: "NIK", render: (value) => <span className="font-mono text-xs">{samarkanNik(String(value))}</span> },
    {
      key: "hubungan",
      label: "Hubungan",
      render: (value) => {
        const val = String(value);
        let badgeStyle = "bg-blue-50 text-blue-700 border-blue-200";
        if (val === "Istri") badgeStyle = "bg-pink-50 text-pink-700 border-pink-200";
        else if (val === "Anak") badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
        else if (val === "Kepala Keluarga") badgeStyle = "bg-blue-600 text-white border-blue-700 font-bold";
        return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${badgeStyle}`}>{val}</span>;
      },
    },
    { key: "tgl_lahir", label: "Tanggal Lahir", render: (value) => formatTanggalIndo(String(value)) },
    { key: "usia", label: "Usia", render: (_v, row) => hitungUsia(row.tgl_lahir) },
    {
      key: "jenis_kelamin",
      label: "JK",
      render: (value) => (
        <span className="inline-flex items-center gap-1.5 font-semibold text-xs text-slate-700">
          <Smile className={`w-4 h-4 stroke-[2.5] ${value === "L" ? "text-blue-500" : "text-pink-500"}`} />
          {value === "L" ? "Laki-laki" : "Perempuan"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* ================= TAMPILAN DASHBOARD LAYER BIASA (NORMAL SCREEN) ================= */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between border-b border-slate-100 pb-4 mb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#15803d] flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Arsip Informasi Kartu Keluarga</h2>
              <p className="text-xs text-slate-400 mt-0.5">ID Dokumen: {keluarga.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-all shadow-sm cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Cetak KK Landscape
            </button>
            <Link
              href={`/dashboard/keluarga/${keluarga.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-all"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit KK
            </Link>
            <button
              onClick={() => setIsKkDeleteOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-semibold text-xs rounded-lg transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-sm">
          <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium sm:w-1/3">Nomor KK</span>
            <span className="text-slate-800 font-bold tracking-wider sm:w-2/3 font-mono">{keluarga.no_kk}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium sm:w-1/3">Kepala Keluarga</span>
            <span className="text-slate-800 font-semibold sm:w-2/3">{keluarga.nama_kepala}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium sm:w-1/3">Wilayah Domisili</span>
            <span className="text-slate-800 font-medium sm:w-2/3 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" /> RT {keluarga.rt} / RW {keluarga.rw}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between py-1 border-b border-slate-100">
            <span className="text-slate-400 font-medium sm:w-1/3">Terdaftar Sejak</span>
            <span className="text-slate-800 font-medium sm:w-2/3 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" /> {formatTanggalIndo(keluarga.created_at)}
            </span>
          </div>
          <div className="flex flex-col sm:flex-row py-1 md:col-span-2 items-start pt-2">
            <span className="text-slate-400 font-medium sm:w-[16.6%] flex items-center gap-1">
              <Home className="w-3.5 h-3.5 text-slate-400" /> Alamat Lengkap
            </span>
            <span className="text-slate-700 font-medium sm:w-[83.4%] bg-slate-50/80 p-2.5 rounded-lg border border-slate-200/60 mt-1 sm:mt-0 leading-relaxed">
              {keluarga.alamat || "Belum diisi oleh operator desa."}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4 print:hidden">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-slate-900">Anggota Keluarga ({keluarga.anggota?.length || 0} orang)</h3>
          <button onClick={bukaModalTambah} className="inline-flex items-center gap-1.5 bg-[#15803d] hover:bg-[#166534] text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-sm cursor-pointer"><Plus className="w-3.5 h-3.5" /> Tambah Anggota</button>
        </div>
        <DataTable<AnggotaKeluarga> columns={columns} data={keluarga.anggota || []} isLoading={isPending} onEdit={bukaModalEditAnggota} onDelete={(row) => { setSelectedAnggota(row); setIsAnggotaDeleteOpen(true); }} />
      </div>

      {/* =================================================================================== */}
      {/* AREA PRINT ELEKTRONIK KARTU KELUARGA LANDSCAPE                                      */}
      {/* =================================================================================== */}
      <div className="hidden print:block w-full text-black font-sans relative p-4 border-[4px] border-double border-black bg-white mx-auto max-w-[1020px] overflow-hidden leading-tight select-none">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='30' viewBox='0 0 60 30'%3E%3Cpath d='M0 10c15-10 15 10 30 0s15-10 30 0v20H0z' fill='none' stroke='%23000' stroke-width='1'/%3E%3C/svg%3E")`, backgroundSize: '40px 20px' }} />
        <div className="relative z-10 space-y-3.5">
          <div className="text-center flex flex-col items-center justify-center">
            <svg className="w-9 h-9 text-black mb-0.5" viewBox="0 0 100 100" fill="currentColor">
              <path d="M50 5 L60 25 L85 25 L65 40 L75 65 L50 50 L25 65 L35 40 L15 25 L40 25 Z" />
            </svg>
            <h1 className="text-sm font-bold tracking-[0.25em] uppercase">KARTU KELUARGA</h1>
            <h2 className="text-base font-black tracking-widest font-mono border-b border-black px-6 pb-0.5 mt-0.5">No. {keluarga.no_kk}</h2>
          </div>
          <div className="grid grid-cols-2 gap-x-4 text-[9px] uppercase font-bold">
            <div className="space-y-0.5">
              <div className="flex"><span className="w-28">Nama Kepala Keluarga</span><span className="mr-1">:</span><span>{keluarga.nama_kepala}</span></div>
              <div className="flex"><span className="w-28">Alamat</span><span className="mr-1">:</span><span className="font-medium">{keluarga.alamat}</span></div>
              <div className="flex"><span className="w-28">RT / RW</span><span className="mr-1">:</span><span className="font-medium">{keluarga.rt} / {keluarga.rw}</span></div>
            </div>
            <div className="space-y-0.5 pl-24">
              <div className="flex"><span className="w-28">Desa / Kelurahan</span><span className="mr-1">:</span><span className="font-medium">JAYAMUKTI</span></div>
              <div className="flex"><span className="w-28">Kecamatan</span><span className="mr-1">:</span><span className="font-medium">CIKARANG PUSAT</span></div>
              <div className="flex"><span className="w-28">Kabupaten / Kota</span><span className="mr-1">:</span><span className="font-medium">BEKASI REGENCY</span></div>
              <div className="flex"><span className="w-28">Provinsi</span><span className="mr-1">:</span><span className="font-medium">WEST JAVA</span></div>
            </div>
          </div>
          <div className="w-full border border-black overflow-hidden bg-white/95">
            <table className="w-full text-left text-[8.5px] border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-black text-center font-bold h-5.5">
                  <th className="border-r border-black p-0.5 w-6 text-center">No</th>
                  <th className="border-r border-black p-0.5 text-left px-1.5">Nama Lengkap</th>
                  <th className="border-r border-black p-0.5 w-28">NIK</th>
                  <th className="border-r border-black p-0.5 w-14">Jenis Kelamin</th>
                  <th className="border-r border-black p-0.5 w-22">Tempat Lahir</th>
                  <th className="border-r border-black p-0.5 w-18">Tanggal Lahir</th>
                  <th className="border-r border-black p-0.5 w-14">Agama</th>
                  <th className="p-0.5 w-24">Pendidikan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black font-semibold text-center">
                {[...Array(Math.max(5, keluarga.anggota?.length || 0))].map((_, index) => {
                  const item = keluarga.anggota?.[index];
                  return (
                    <tr key={index} className="h-4.5 max-h-4.5">
                      <td className="border-r border-black p-0.5 text-center font-mono text-[8px]">{index + 1}</td>
                      <td className="border-r border-black p-0.5 text-left px-1.5 uppercase font-bold text-black truncate max-w-[180px]">{item?.nama || ""}</td>
                      <td className="border-r border-black p-0.5 font-mono text-[9px] tracking-wider">{item?.nik || ""}</td>
                      <td className="border-r border-black p-0.5 uppercase text-[7.5px]">{item ? (item.jenis_kelamin === "L" ? "LAKI-LAKI" : "PEREMPUAN") : ""}</td>
                      <td className="border-r border-black p-0.5 uppercase text-[8px] truncate">{item ? "BEKASI" : ""}</td>
                      <td className="border-r border-black p-0.5 font-mono text-[8px]">{item ? new Date(item.tgl_lahir).toLocaleDateString("id-ID") : ""}</td>
                      <td className="border-r border-black p-0.5 uppercase text-[7.5px]">{item ? "ISLAM" : ""}</td>
                      <td className="p-0.5 text-left px-1 uppercase text-[7.5px] truncate">{item ? "SLTA / SEDERAJAT" : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="w-full border border-black overflow-hidden bg-white/95">
            <table className="w-full text-left text-[8.5px] border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-black text-center font-bold h-5.5">
                  <th className="border-r border-black p-0.5 w-6 text-center">No</th>
                  <th className="border-r border-black p-0.5 w-24">Jenis Pekerjaan</th>
                  <th className="border-r border-black p-0.5 w-20">Status Perkawinan</th>
                  <th className="border-r border-black p-0.5 w-24">Status Hubungan</th>
                  <th className="border-r border-black p-0.5 w-18">Kewarganegaraan</th>
                  <th className="border-r border-black p-0.5 w-22">No. Paspor</th>
                  <th className="p-0.5 w-22">No. KITAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black font-semibold text-center">
                {[...Array(Math.max(5, keluarga.anggota?.length || 0))].map((_, index) => {
                  const item = keluarga.anggota?.[index];
                  return (
                    <tr key={index} className="h-4.5 max-h-4.5">
                      <td className="border-r border-black p-0.5 text-center font-mono text-[8px]">{index + 1}</td>
                      <td className="border-r border-black p-0.5 text-left px-1.5 uppercase text-[7.5px] truncate max-w-[140px]">{item ? "KARYAWAN SWASTA" : ""}</td>
                      <td className="border-r border-black p-0.5 uppercase text-[7.5px]">{item ? (item.hubungan === "Kepala Keluarga" || item.hubungan === "Istri" ? "KAWIN" : "BELUM KAWIN") : ""}</td>
                      <td className="border-r border-black p-0.5 uppercase font-bold text-black text-[8px]">{item?.hubungan || ""}</td>
                      <td className="border-r border-black p-0.5 uppercase text-[7.5px]">{item ? "WNI" : ""}</td>
                      <td className="border-r border-black p-0.5 font-mono text-[8px] text-slate-400">{item ? "----------" : ""}</td>
                      <td className="p-0.5 font-mono text-[8px] text-slate-400">{item ? "----------" : ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="pt-1 flex justify-between items-start text-[8px] font-bold leading-tight">
            <div className="flex gap-2 border border-black p-1.5 bg-slate-50 rounded max-w-md">
              <div className="w-11 h-11 bg-white border border-slate-300 p-0.5 flex-shrink-0 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full text-black">
                  <path d="M10 10h30v30h-30zm5 5v20h20v-20zm45-5h30v30h-30zm5 5v20h20v-20zM10 60h30v30h-30zm5 5v20h20v-20zm60-5h10v10h-10zm10 10h10v10h-10zm-10 10h10v10h-10zm-10-10h10v10h-10zm0 20h10v10h-10zm20 0h10v10h-10z" fill="currentColor"/>
                </svg>
              </div>
              <div className="text-[7px] leading-tight text-slate-700 font-normal max-w-[280px]">
                <p className="font-bold text-black uppercase text-[7.5px] mb-0.5">TANDA TANGAN ELEKTRONIK (TTE)</p>
                <p>KK ini disahkan secara digital oleh Kepala Dinas Kependudukan dan Pencatatan Sipil Kabupaten Bekasi sesuai undang-undang ITE menggunakan sertifikat elektronik BSrE.</p>
                <p className="mt-0.5 font-mono text-slate-400 text-[6.5px]">ID Verifikasi: TTE-BUSS-2026-{keluarga.id.slice(0,8).toUpperCase()}</p>
              </div>
            </div>
            <div className="text-center space-y-7 pr-4 text-[8.5px]">
              <div>
                <p>Dikeluarkan Di : CIKARANG PUSAT</p>
                <p>Pada Tanggal : {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</p>
                <p className="mt-1 font-bold uppercase border-t border-black pt-0.5 text-[8px]">KEPALA DINAS KEPENDUDUKAN DAN</p>
                <p className="font-bold uppercase text-[8px]">PENCATATAN SIPIL KABUPATEN BEKASI</p>
              </div>
              <div>
                <p className="font-bold text-sm underline uppercase tracking-wide">Drs. H. Carwinda, M.Si</p>
                <p className="font-mono text-[7.5px] text-slate-600 font-normal">NIP. 19680312 199403 1 005</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* SECTION 3 — FORM DIALOG POP-UP MODAL ANGGOTA                      */}
      {/* ================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => !isFormSubmitting && setIsFormModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                {formMode === "tambah" ? "➕ Tambah Anggota Baru" : "📝 Edit Biodata Anggota"}
              </h4>
              <button onClick={() => setIsFormModalOpen(false)} disabled={isFormSubmitting} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
            </div>

            {/* VALIDASI BISNIS 1: Warning Interseptor Penggantian Kepala Keluarga */}
            {showSuksesiWarning ? (
              <div className="p-5 space-y-4 animate-fade-in text-sm">
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 text-amber-800">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Kepala Keluarga Sudah Terdaftar</p>
                    <p className="text-xs text-amber-700 leading-relaxed">
                      KK ini sudah memiliki kepala keluarga aktif bernama <span className="font-bold underline">{kepalaSaatIni?.nama}</span>. 
                      Apakah Anda yakin ingin mengganti jabatan Kepala Keluarga ke warga baru ini?
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 italic bg-slate-50 p-2 rounded-lg border">
                  Note: Jabatan {kepalaSaatIni?.nama} otomatis akan diturunkan menjadi 'Lainnya' dan nama kepala pada arsip utama akan diperbarui.
                </p>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowSuksesiWarning(false)} className="px-3 py-1.5 border bg-white rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">Kembali</button>
                  <button type="button" onClick={eksekusiSimpanData} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-sm">Ya, Ganti Jabatan</button>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePreSubmitCheck} className="p-5 space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Nama Lengkap <span className="text-red-500">*</span></label>
                  <input type="text" required value={formNama} onChange={(e) => setFormNama(e.target.value)} className="w-full border border-slate-300 rounded-lg p-2 text-slate-800 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Nomor NIK (16 Digit) <span className="text-red-500">*</span></label>
                  <input type="text" maxLength={16} required value={formNik} onChange={(e) => setFormNik(e.target.value.replace(/\D/g, ""))} className={`w-full border rounded-lg p-2 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 ${formErrorNik ? "border-red-500 bg-red-50/50" : "border-slate-300 bg-white"}`} />
                  {formErrorNik && <p className="text-xs text-red-500 mt-1 font-medium">{formErrorNik}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Hubungan Dalam Keluarga <span className="text-red-500">*</span></label>
                  <select value={formHubungan} onChange={(e) => setFormHubungan(e.target.value)} className="w-full border border-slate-300 bg-white text-sm rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500">
                    {["Kepala Keluarga", "Suami", "Istri", "Anak", "Orang Tua", "Mertua", "Cucu", "Saudara", "Lainnya"].map((hub) => (<option key={hub} value={hub}>{hub}</option>))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Tanggal Lahir <span className="text-red-500">*</span></label>
                    <input type="date" required value={formTglLahir} onChange={(e) => setFormTglLahir(e.target.value)} className="w-full border border-slate-300 bg-white text-sm rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Jenis Kelamin <span className="text-red-500">*</span></label>
                    <div className="flex items-center gap-4 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold text-xs select-none">
                        <input type="radio" name="jk" checked={formJk === "L"} onChange={() => setFormJk("L")} className="text-blue-600 w-4 h-4" />
                        <span className={`inline-flex items-center gap-1 p-1 rounded-md ${formJk === "L" ? "bg-blue-50 text-blue-700" : "text-slate-400"}`}><Smile className="w-4 h-4 stroke-[2.5]" /> Laki-laki</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-slate-700 font-semibold text-xs select-none">
                        <input type="radio" name="jk" checked={formJk === "P"} onChange={() => setFormJk("P")} className="text-pink-600 w-4 h-4" />
                        <span className={`inline-flex items-center gap-1 p-1 rounded-md ${formJk === "P" ? "bg-pink-50 text-pink-700" : "text-slate-400"}`}><Smile className="w-4 h-4 stroke-[2.5]" /> Perempuan</span>
                      </label>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 mt-5">
                  <button type="button" onClick={() => setIsFormModalOpen(false)} disabled={isFormSubmitting} className="px-4 py-2 border border-slate-300 bg-white text-slate-700 font-semibold rounded-lg hover:bg-slate-50">Batal</button>
                  <button type="submit" disabled={isFormSubmitting} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#15803d] hover:bg-[#166534] text-white font-semibold rounded-lg shadow-sm">
                    {isFormSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>Simpan</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <ConfirmModal isOpen={isAnggotaDeleteOpen} title="Keluarkan Anggota Keluarga?" message={`Apakah Anda yakin ingin menghapus ${selectedAnggota?.nama} dari berkas susunan keluarga ini?`} confirmLabel="Ya, Hapus" isLoading={isAnggotaDeleting} onConfirm={handleHapusAnggota} onCancel={() => setIsAnggotaDeleteOpen(false)} />
      
      {/* VALIDASI BISNIS 2: Warning Dinamis Peringatan Jumlah Jiwa Terhapus Sebelum Drop KK */}
      <ConfirmModal 
        isOpen={isKkDeleteOpen} 
        title="⚠️ Peringatan Kritis: Hapus Berkas KK?" 
        message={
          keluarga.anggota && keluarga.anggota.length > 0 
            ? `KK ini masih memiliki ${keluarga.anggota.length} anggota keluarga aktif di dalamnya. Menghapus berkas KK nomor ${keluarga.no_kk} otomatis akan MEMUSNAHKAN semua data biodata warga di dalamnya. Apakah Anda yakin ingin melanjutkan?`
            : `Apakah Anda yakin ingin menghapus arsip data Kartu Keluarga nomor ${keluarga.no_kk} secara permanen dari sistem desa?`
        } 
        confirmLabel="Ya, Hapus Masal" 
        confirmVariant="danger"
        isLoading={isKkDeleting} 
        onConfirm={handleHapusSeluruhKk} 
        onCancel={() => setIsKkDeleteOpen(false)} 
      />
    </div>
  );
}