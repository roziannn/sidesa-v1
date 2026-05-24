"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { Trash2, UserPlus } from "lucide-react";

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
  const [kegiatan, setKegiatan] = useState<Kegiatan | null>(null);
  const [peserta, setPeserta] = useState<Peserta[]>([]);
  const [loading, setLoading] = useState(true);

  // State Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState<Peserta | null>(null);
  const [alasanBatal, setAlasanBatal] = useState("");
  const [wargaList, setWargaList] = useState<Profile[]>([]);
  const [newPeserta, setNewPeserta] = useState({ profil_id: "", catatan: "" });

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    fetchWarga();
  }, [loadData, fetchWarga]);

  const handleTambahPeserta = async () => {
    const { error } = await supabaseClient.from("peserta_kegiatan").insert({
      kegiatan_id: id,
      profil_id: newPeserta.profil_id,
      catatan: newPeserta.catatan,
    });
    if (!error) {
      setShowAddModal(false);
      loadData();
    }
  };

  const handleHapusPeserta = async (pId: string) => {
    await supabaseClient.from("peserta_kegiatan").delete().eq("id", pId);
    setShowDeleteModal(null);
    loadData();
  };

  const handleBatalkan = async () => {
    await supabaseClient.from("kegiatan").update({ status: "Dibatalkan", keterangan_batal: alasanBatal }).eq("id", id);
    setShowCancelModal(false);
    loadData();
  };

  if (loading) return <div className="p-8 text-center">Memuat data...</div>;
  if (!kegiatan) return <div className="p-8 text-center">Kegiatan tidak ditemukan.</div>;

  const terdaftar = peserta.length;
  const sisa = kegiatan.kuota - terdaftar;
  const persentase = (terdaftar / kegiatan.kuota) * 100;
  const getProgressColor = () => {
    if (persentase >= 90) return "bg-red-500";
    if (persentase >= 70) return "bg-yellow-500";
    return "bg-emerald-500";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
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
            <p className="font-semibold">{kegiatan.tanggal}</p>
          </div>
          <div>
            <p className="text-slate-500">Waktu</p>
            <p className="font-semibold">
              {kegiatan.waktu_mulai} - {kegiatan.waktu_selesai}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Lokasi</p>
            <p className="font-semibold">{kegiatan.lokasi}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Peserta Terdaftar ({terdaftar} orang)</h2>

          {/* Debug: Cek status kegiatan di console jika tombol tidak muncul */}
          {console.log("Status kegiatan:", kegiatan.status)}

          {/* Gunakan toLowerCase() agar case-insensitive (misal: "Aktif" vs "aktif") */}
          {kegiatan.status.toLowerCase() === "aktif" && (
            <button disabled={sisa <= 0} onClick={() => setShowAddModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 disabled:opacity-50 disabled:bg-slate-400">
              <UserPlus className="w-4 h-4" />
              {sisa <= 0 ? "Kuota Penuh" : "Tambah Peserta"}
            </button>
          )}
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
                  <td className="py-3 font-medium">{p.profiles.nama}</td>
                  <td className="py-3">
                    {p.profiles.rt}/{p.profiles.rw}
                  </td>
                  <td className="py-3">{p.profiles.no_hp}</td>
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
            <select className="w-full border p-2 rounded mb-3" onChange={(e) => setNewPeserta({ ...newPeserta, profil_id: e.target.value })}>
              <option value="">Pilih Warga...</option>
              {wargaList.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.nama} — RT {w.rt}/RW {w.rw}
                </option>
              ))}
            </select>
            <textarea placeholder="Catatan (Opsional)" className="w-full border p-2 rounded mb-4" onChange={(e) => setNewPeserta({ ...newPeserta, catatan: e.target.value })} />
            <div className="flex gap-2">
              <button onClick={() => setShowAddModal(false)} className="flex-1 border py-2 rounded">
                Batal
              </button>
              <button onClick={handleTambahPeserta} className="flex-1 bg-emerald-600 text-white py-2 rounded">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL HAPUS & BATAL (Omitted for brevity, logic identical to previous step) */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <p>
              Hapus <strong>{showDeleteModal.profiles.nama}</strong>?
            </p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowDeleteModal(null)} className="flex-1 border py-2 rounded">
                Batal
              </button>
              <button onClick={() => handleHapusPeserta(showDeleteModal.id)} className="flex-1 bg-red-600 text-white py-2 rounded">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-sm">
            <h3 className="font-bold text-red-600 mb-2">Batalkan Kegiatan</h3>
            <textarea placeholder="Alasan..." className="w-full border p-2 rounded mb-4" onChange={(e) => setAlasanBatal(e.target.value)} />
            <div className="flex gap-2">
              <button onClick={() => setShowCancelModal(false)} className="flex-1 border py-2 rounded">
                Batal
              </button>
              <button onClick={handleBatalkan} className="flex-1 bg-red-600 text-white py-2 rounded">
                Konfirmasi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
