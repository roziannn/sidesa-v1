/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { Trash2, UserPlus, Printer } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { formatDate, formatDayDate } from "@/lib/format";

// Interfaces
interface Profile {
  id: string;
  nama: string;
  rt: string;
  rw: string;
  no_hp: string;
}

interface Peserta {
  id: string;
  catatan: string;
  created_at: string;
  profiles: Profile;
}

interface Kegiatan {
  id: string;
  judul: string;
  tanggal: string;
  waktu_mulai: string;
  waktu_selesai: string;
  lokasi: string;
  kuota: number;
  status: "aktif" | "Selesai" | "Dibatalkan";
  keterangan_batal?: string;
}

export default function DetailKegiatanPage() {
  const { id } = useParams() as { id: string };
  const { showToast } = useToast();
  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(null);
  const [peserta, setPeserta] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(true);

  // State Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<Peserta | null>(null);
  const [alasanBatal, setAlasanBatal] = useState("");
  const [wargaList, setWargaList] = useState<Profile[]>([]);
  const [newPeserta, setNewPeserta] = useState({ warga_id: "", catatan: "" });

  const loadData = useCallback(async () => {
    if (!id) return;
    const { data: keg } = await supabaseClient.from("kegiatan").select("*, peserta_kegiatan(id, catatan, created_at, profiles(id, nama, rt, rw, no_hp))").eq("id", id).single();

    setKegiatan(keg as Kegiatan);
    setPeserta(keg?.peserta_kegiatan || []);
    setLoading(false);
  }, [id]);

  const fetchWarga = useCallback(async () => {
    const { data } = await supabaseClient.from("profiles").select("*");
    setWargaList(data || []);
  }, []);

  useEffect(() => {
    loadData();
    fetchWarga();
  }, [loadData, fetchWarga]);

  const handleTambahPeserta = async () => {
    if (!newPeserta.warga_id) {
      showToast("error", "Gagal", "Silakan pilih warga terlebih dahulu!");
      return;
    }

    const apakahSudahTerdaftar = peserta.some((p) => p.profiles?.id === newPeserta.warga_id);

    if (apakahSudahTerdaftar) {
      showToast("error", "Peserta Sudah Ada", "Warga ini sudah terdaftar dalam kegiatan ini.");
      return;
    }

    const { error } = await supabaseClient.from("peserta_kegiatan").insert({
      kegiatan_id: id,
      warga_id: newPeserta.warga_id,
      catatan: newPeserta.catatan || null,
    });

    if (error) {
      console.error("Error saat menambah peserta:", error);
      showToast("error", "Gagal Menambahkan", error.message);
    } else {
      showToast("success", "Berhasil", "Peserta baru telah ditambahkan ke kegiatan.");
      setShowAddModal(false);
      setNewPeserta({ warga_id: "", catatan: "" });
      loadData();
    }
  };

  const handleHapusPeserta = async (pId: string) => {
    const { error } = await supabaseClient.from("peserta_kegiatan").delete().eq("id", pId);
    if (error) {
      showToast("error", "Gagal", "Gagal menghapus peserta.");
    } else {
      showToast("success", "Berhasil Dihapus", "Peserta dikeluarkan dari kegiatan.");
      setShowDeleteModal(null);
      loadData();
    }
  };

  const handleBatalkan = async () => {
    const { error } = await supabaseClient.from("kegiatan").update({ status: "Dibatalkan", keterangan_batal: alasanBatal }).eq("id", id);

    if (error) {
      showToast("error", "Gagal", "Gagal membatalkan kegiatan.");
    } else {
      showToast("success", "Kegiatan Dibatalkan", "Status kegiatan berhasil diperbarui.");
      setShowCancelModal(false);
      loadData();
    }
  };

  const handleCetakDaftarHadir = () => {
    window.print();
  };

  if (loading) return <div className="p-8 text-center print:hidden">Memuat data...</div>;
  if (!kegiatan) return <div className="p-8 text-center print:hidden">Kegiatan tidak ditemukan.</div>;

  const terdaftar = peserta.length;
  const sisa = kegiatan.kuota - terdaftar;
  const persentase = (terdaftar / kegiatan.kuota) * 100;
  const getProgressColor = () => {
    if (persentase >= 90) return "bg-red-500";
    if (persentase >= 70) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  // Bersihkan format jam dari detik (:00) jika ada
  const waktuMulaiSlicing = kegiatan.waktu_mulai?.slice(0, 5);
  const waktuSelesaiSlicing = kegiatan.waktu_selesai?.slice(0, 5);

  return (
    <>
      {/* ================================================================
          LAYOUT UNTUK LAYAR WEB STANDARD (DISEMBUNYIKAN SAAT PRINT)
         ================================================================ */}
      <div className="max-w-4xl mx-auto space-y-6 pb-20 print:hidden">
        {/* SECTION 1: INFO */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{kegiatan.judul}</h1>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${kegiatan.status === "aktif" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{kegiatan.status.toUpperCase()}</span>
            </div>
            {kegiatan.status === "aktif" && (
              <button onClick={() => setShowCancelModal(true)} className="text-red-600 text-sm hover:underline">
                Batalkan Kegiatan
              </button>
            )}
          </div>

          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1 font-medium">
              <span>
                {terdaftar} dari {kegiatan.kuota} peserta
              </span>
              <span>{Math.round(persentase)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${getProgressColor()}`} style={{ width: `${Math.min(persentase, 100)}%` }}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div>
              <p className="text-slate-500">Tanggal</p>
              <p className="font-semibold">
              {formatDayDate(kegiatan.tanggal)}
            </p>
            </div>
            <div>
              <p className="text-slate-500">Waktu</p>
              <p className="font-semibold">
                {waktuMulaiSlicing} - {waktuSelesaiSlicing} WIB
              </p>
            </div>
            <div>
              <p className="text-slate-500">Lokasi</p>
              <p className="font-semibold">{kegiatan.lokasi}</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: TABEL PESERTA */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <h2 className="font-bold text-lg">Peserta Terdaftar ({terdaftar} orang)</h2>

            <div className="flex items-center gap-2">
              {/* TOMBOL CETAK DAFTAR HADIR */}
              <button onClick={handleCetakDaftarHadir} className="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 font-semibold transition shadow-sm">
                <Printer className="w-4 h-4" />
                Cetak Daftar Hadir
              </button>

              {kegiatan.status.toLowerCase() === "aktif" && (
                <button
                  disabled={sisa <= 0}
                  onClick={() => setShowAddModal(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50 disabled:bg-slate-400 font-semibold transition shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  {sisa <= 0 ? "Kuota Penuh" : "Tambah Peserta"}
                </button>
              )}
            </div>
          </div>

          {sisa <= kegiatan.kuota * 0.1 && sisa > 0 && <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4 text-yellow-700 text-sm font-medium">⚠️ Sisa kuota hanya {sisa} tempat lagi!</div>}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr className="text-slate-500 text-left">
                  <th className="py-2">No</th>
                  <th className="py-2">Nama</th>
                  <th className="py-2">RT/RW</th>
                  <th className="py-2">No HP</th>
                  <th className="py-2">Waktu Daftar</th>
                  <th className="py-2 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {peserta.map((p, idx) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-3">{idx + 1}</td>
                    <td className="py-3 font-medium">{p.profiles?.nama || "Tidak Terdata"}</td>
                    <td className="py-3">
                      {p.profiles?.rt || "00"}/{p.profiles?.rw || "00"}
                    </td>
                    <td className="py-3">{p.profiles?.no_hp || "-"}</td>
                    <td className="py-3">{new Date(p.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
                    <td className="py-3 text-right">
                      <button onClick={() => setShowDeleteModal(p)} className="text-red-600 hover:bg-red-50 p-1 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL TAMBAH */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-md">
              <h3 className="font-bold mb-4">Tambah Peserta</h3>
              <select className="w-full border p-2 rounded mb-3 text-sm bg-white" onChange={(e) => setNewPeserta({ ...newPeserta, warga_id: e.target.value })}>
                <option value="">Pilih Warga...</option>
                {wargaList.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.nama} — RT {w.rt}/RW {w.rw}
                  </option>
                ))}
              </select>
              <textarea placeholder="Catatan (Opsional)" className="w-full border p-2 rounded mb-4 text-sm" onChange={(e) => setNewPeserta({ ...newPeserta, catatan: e.target.value })} />
              <div className="flex gap-2">
                <button onClick={() => setShowAddModal(false)} className="flex-1 border py-2 rounded text-sm font-semibold">
                  Batal
                </button>
                <button onClick={handleTambahPeserta} className="flex-1 bg-emerald-600 text-white py-2 rounded text-sm font-semibold">
                  Simpan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL HAPUS */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-sm">
              <p className="text-sm">
                Hapus <strong>{showDeleteModal.profiles?.nama}</strong> dari daftar kegiatan?
              </p>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowDeleteModal(null)} className="flex-1 border py-2 rounded text-sm font-semibold">
                  Batal
                </button>
                <button onClick={() => handleHapusPeserta(showDeleteModal.id)} className="flex-1 bg-red-600 text-white py-2 rounded text-sm font-semibold">
                  Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL BATALKAN KEGIATAN */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl w-full max-w-sm">
              <h3 className="font-bold text-red-600 mb-2">Batalkan Kegiatan</h3>
              <textarea placeholder="Alasan pembatalan..." className="w-full border p-2 rounded mb-4 text-sm" onChange={(e) => setAlasanBatal(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={() => setShowCancelModal(false)} className="flex-1 border py-2 rounded text-sm font-semibold">
                  Batal
                </button>
                <button onClick={handleBatalkan} className="flex-1 bg-red-600 text-white py-2 rounded text-sm font-semibold">
                  Konfirmasi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================
          LAYOUT KHUSUS PRINT CETAK (HANYA MUNCUL SAAT WINDOW PRINT AKTIF)
         ================================================================ */}
      <div className="hidden print:block w-full p-4 text-black text-xs leading-relaxed bg-white">
        {/* HEADER DAFTAR HADIR */}
        <div className="text-center border-b-2 border-black pb-4 mb-6">
          <h2 className="text-sm font-extrabold tracking-wide uppercase">Pemerintah Desa [NAMA DESA]</h2>
          <h1 className="text-lg font-black tracking-wider mt-1">DAFTAR HADIR KEGIATAN</h1>
        </div>

        {/* METADATA KEGIATAN */}
        <div className="grid grid-cols-12 gap-y-1.5 mb-6 text-[13px] border p-3 rounded-lg bg-slate-50/50">
          <div className="col-span-3 font-bold text-slate-700">Nama Kegiatan</div>
          <div className="col-span-9 font-medium">: {kegiatan.judul}</div>

          <div className="col-span-3 font-bold text-slate-700">Tanggal</div>
          <div className="col-span-9 font-medium">: {formatDate(kegiatan.tanggal)}</div>

          <div className="col-span-3 font-bold text-slate-700">Waktu</div>
          <div className="col-span-9 font-medium">
            : {waktuMulaiSlicing} - {waktuSelesaiSlicing} WIB
          </div>

          <div className="col-span-3 font-bold text-slate-700">Lokasi</div>
          <div className="col-span-9 font-medium">: {kegiatan.lokasi}</div>
        </div>

        {/* TABEL DATA PESERTA */}
        <table className="w-full border-collapse border border-black text-center text-xs">
          <thead>
            <tr className="bg-slate-100 border-b border-black text-[11px] font-bold">
              <th className="border border-black px-2 py-2.5 w-[5%]">No</th>
              <th className="border border-black px-3 py-2.5 text-left w-[40%]">Nama Lengkap</th>
              <th className="border border-black px-2 py-2.5 w-[25%]">NIK</th>
              <th className="border border-black px-2 py-2.5 w-[10%]">RT/RW</th>
              <th className="border border-black px-2 py-2.5 w-[20%] text-left">TTD/Paraf</th>
            </tr>
          </thead>
          <tbody>
            {/* Render Peserta yang Terdaftar */}
            {peserta.map((p, idx) => (
              <tr key={p.id} className="border-b border-black">
                <td className="border border-black px-2 py-3">{idx + 1}</td>
                <td className="border border-black px-3 py-3 text-left font-medium">{p.profiles?.nama || "-"}</td>
                {/* NIK sengaja dikosongkan/disiapkan space kosong jika skema DB profiles belum menyimpannya */}
                <td className="border border-black px-2 py-3 text-slate-300 font-mono text-[10px]">_________________</td>
                <td className="border border-black px-2 py-3">
                  {p.profiles?.rt || "00"}/{p.profiles?.rw || "00"}
                </td>
                <td className="border border-black px-3 py-3 text-left text-[10px] text-slate-400 relative h-9">
                  <span className={idx % 2 === 0 ? "absolute left-2 top-1" : "absolute right-8 top-1"}>{idx + 1}.</span>
                </td>
              </tr>
            ))}

            {/* 5 Baris Kosong Ekstra untuk Registrasi On-Site */}
            {Array.from({ length: 5 }).map((_, i) => {
              const currentNumber = terdaftar + i + 1;
              return (
                <tr key={`empty-${i}`} className="border-b border-black h-9">
                  <td className="border border-black px-2 py-3">{currentNumber}</td>
                  <td className="border border-black px-3 py-3 text-left text-slate-300"></td>
                  <td className="border border-black px-2 py-3 text-slate-300"></td>
                  <td className="border border-black px-2 py-3 text-slate-300"></td>
                  <td className="border border-black px-3 py-3 text-left text-[10px] text-slate-400 relative">
                    <span className={(currentNumber - 1) % 2 === 0 ? "absolute left-2 top-1" : "absolute right-8 top-1"}>{currentNumber}.</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* FOOTER TANDA TANGAN */}
        <div className="mt-12 grid grid-cols-2 text-center text-[12px] gap-x-20 avoid-break">
          <div>
            <p className="font-medium text-slate-700">Mengetahui,</p>
            <p className="font-bold mt-0.5">Kepala Desa</p>
            <div className="h-20"></div>
            <p className="font-bold text-black">(___________________________)</p>
          </div>
          <div>
            <p className="font-medium text-slate-700">Yang Membuat Daftar,</p>
            <p className="font-bold mt-0.5">Panitia Kegiatan</p>
            <div className="h-20"></div>
            <p className="font-bold text-black">(___________________________)</p>
          </div>
        </div>
      </div>
    </>
  );
}
