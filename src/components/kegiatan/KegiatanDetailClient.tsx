"use client";

import { useMemo, useState } from "react";
import { supabaseClient } from "@/lib/supabase/client";
import { Calendar, Clock, MapPin, Users, Edit, Trash2, Loader2, Plus } from "lucide-react";

export default function KegiatanDetailClient({ kegiatan }: { kegiatan: any }) {
  const [peserta, setPeserta] = useState(kegiatan.peserta_kegiatan || []);
  const [loadingDelete, setLoadingDelete] = useState<string | null>(null);

  const totalKuota = kegiatan.kuota ?? 0;
  const jumlahPeserta = peserta.length;
  const sisaKuota = totalKuota ? totalKuota - jumlahPeserta : null;

  const persen = totalKuota ? (jumlahPeserta / totalKuota) * 100 : 0;

  const barColor = useMemo(() => {
    if (persen >= 100) return "bg-red-500";
    if (persen >= 80) return "bg-amber-500";
    return "bg-emerald-500";
  }, [persen]);

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus peserta ini?")) return;

    setLoadingDelete(id);

    const { error } = await supabaseClient.from("peserta_kegiatan").delete().eq("id", id);

    if (!error) {
      setPeserta((prev: any) => prev.filter((p: any) => p.id !== id));
    } else {
      alert("Gagal hapus peserta");
    }

    setLoadingDelete(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex justify-between">
          <div>
            <h1 className="text-2xl font-black">{kegiatan.judul}</h1>
            <p className="text-sm text-slate-500 mt-1">{kegiatan.lokasi}</p>
          </div>

          <div className="flex gap-2">
            <button className="px-3 py-2 border rounded-lg text-sm flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button className="px-3 py-2 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Batalkan
            </button>
          </div>
        </div>

        {/* INFO GRID */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 text-sm">
          <Info icon={<Calendar />} label="Tanggal" value={kegiatan.tanggal} />
          <Info icon={<Clock />} label="Waktu" value={`${kegiatan.waktu_mulai} - ${kegiatan.waktu_selesai}`} />
          <Info icon={<MapPin />} label="Lokasi" value={kegiatan.lokasi} />
          <Info icon={<Users />} label="Kuota" value={`${jumlahPeserta}/${totalKuota || "∞"}`} />
        </div>

        {/* PROGRESS */}
        <div className="mt-5 h-2 bg-slate-100 rounded-full overflow-hidden">
          <div className={`h-full ${barColor}`} style={{ width: `${Math.min(persen, 100)}%` }} />
        </div>
      </div>

      {/* PESERTA */}
      <div className="bg-white border rounded-xl p-6">
        <div className="flex justify-between mb-4">
          <h2 className="font-bold">Peserta ({jumlahPeserta})</h2>

          {(!totalKuota || sisaKuota! > 0) && (
            <button className="bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Tambah
            </button>
          )}
        </div>

        {peserta.length === 0 ? (
          <p className="text-center text-slate-400 py-10">Belum ada peserta</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-slate-500 border-b">
              <tr>
                <th>No</th>
                <th>Nama</th>
                <th>RT/RW</th>
                <th>No HP</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {peserta.map((p: any, i: number) => (
                <tr key={p.id} className="border-b hover:bg-slate-50">
                  <td className="py-3">{i + 1}</td>
                  <td>{p.profiles?.nama_lengkap}</td>
                  <td>
                    RT {p.profiles?.rt}/RW {p.profiles?.rw}
                  </td>
                  <td>{p.profiles?.no_hp}</td>
                  <td className="text-right">
                    <button onClick={() => handleDelete(p.id)} className="text-red-500">
                      {loadingDelete === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Info({ icon, label, value }: any) {
  return (
    <div className="flex gap-3">
      <div className="text-emerald-600">{icon}</div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="font-bold">{value}</p>
      </div>
    </div>
  );
}
