/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { supabaseClient } from "@/lib/supabase/client";
import { Trash2, UserPlus, Printer, XCircle } from "lucide-react";
import { useToast } from "@/hooks/useToast";
import { formatDate, formatDayDate } from "@/lib/format";
import Button from "@components/ui/Button";
import Card from "@components/ui/Card";
import StatusBadge from "@components/StatusBadge";
import DataTable, { Column } from "@components/DataTable";
import Modal from "@components/ui/Modal";
import SelectSearch from "@components/ui/SelectSearch";
import Textarea from "@components/ui/Textarea";
import ConfirmModal from "@components/ConfirmModal";

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
    const { data: keg } = await supabaseClient
      .from("kegiatan")
      .select("*, peserta_kegiatan(id, catatan, created_at, profiles(id, nama, rt, rw, no_hp))")
      .eq("id", id)
      .single();

    setKegiatan(keg as Kegiatan);
    setPeserta(keg?.peserta_kegiatan || []);
    setLoading(false);
  }, [id]);

  const columns: Column<Peserta>[] = [
    { key: "no", label: "No", render: (_, __, index) => index + 1 },
    { 
      key: "nama", 
      label: "Nama", 
      render: (_, row) => <span className="font-medium">{row.profiles?.nama || "-"}</span> 
    },
    { 
      key: "rt", 
      label: "RT/RW", 
      render: (_, row) => `${row.profiles?.rt || "00"}/${row.profiles?.rw || "00"}` 
    },
    { key: "no_hp", label: "No HP", render: (_, row) => row.profiles?.no_hp || "-" },
    { 
      key: "created_at", 
      label: "Waktu Daftar", 
      render: (val) => new Date(val as string).toLocaleDateString("id-ID") 
    },
  ];

  const wargaOptions = wargaList.map((w) => ({
  value: w.id,
  label: `${w.nama} — RT ${w.rt}/RW ${w.rw}`,
  }));

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
      showToast("error", "Peserta Sudah Ada", "Warga ini sudah terdaftar.");
      return;
    }

    const { error } = await supabaseClient.from("peserta_kegiatan").insert({
      kegiatan_id: id,
      warga_id: newPeserta.warga_id,
      catatan: newPeserta.catatan || null,
    });

    if (error) {
      showToast("error", "Gagal Menambahkan", error.message);
    } else {
      showToast("success", "Berhasil", "Peserta telah ditambahkan.");
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
      showToast("success", "Berhasil", "Peserta dikeluarkan.");
      setShowDeleteModal(null);
      loadData();
    }
  };

  const handleBatalkan = async () => {
    const { error } = await supabaseClient.from("kegiatan").update({ status: "Dibatalkan", keterangan_batal: alasanBatal }).eq("id", id);
    if (error) {
      showToast("error", "Gagal", "Gagal membatalkan kegiatan.");
    } else {
      showToast("success", "Berhasil", "Status diperbarui.");
      setShowCancelModal(false);
      loadData();
    }
  };

  if (loading) return <div className="p-8 text-center print:hidden">Memuat data...</div>;
  if (!kegiatan) return <div className="p-8 text-center print:hidden">Kegiatan tidak ditemukan.</div>;

  const terdaftar = peserta.length;
  const sisa = kegiatan.kuota - terdaftar;
  const persentase = (terdaftar / kegiatan.kuota) * 100;
  const waktuMulaiSlicing = kegiatan.waktu_mulai?.slice(0, 5);
  const waktuSelesaiSlicing = kegiatan.waktu_selesai?.slice(0, 5);

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6 pb-20 print:hidden">
        {/* CARD 1: INFO */}
        <Card
          title={kegiatan.judul}
          description="Informasi kegiatan yang akan datang."
          headerAction={
            kegiatan.status === 'aktif' && (
              <Button variant="danger" size="sm" leftIcon={<XCircle className="h-4 w-4" />} onClick={() => setShowCancelModal(true)}>
                Batalkan
              </Button>
            )
          }
        >
          <StatusBadge status={kegiatan.status} />
          
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1 font-medium">
              <span>{terdaftar} dari {kegiatan.kuota} peserta</span>
              <span>{Math.round(persentase || 0)}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div className={`h-2.5 rounded-full ${persentase >= 90 ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(persentase, 100)}%` }}></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            <div>
              <p className="text-slate-500">Tanggal</p>
              <p className="font-semibold">{formatDayDate(kegiatan.tanggal)}</p>
            </div>
            <div>
              <p className="text-slate-500">Waktu</p>
              <p className="font-semibold">{waktuMulaiSlicing} - {waktuSelesaiSlicing} WIB</p>
            </div>
            <div>
              <p className="text-slate-500">Lokasi</p>
              <p className="font-semibold">{kegiatan.lokasi}</p>
            </div>
          </div>
        </Card>

        {/* CARD 2: TABEL */}
        <Card
          title={`Peserta Terdaftar (${terdaftar} orang)`}
          description="Peserta yang terdaftar pada kegiatan ini."
          padding="sm"
          headerAction={
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" leftIcon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
                Cetak
              </Button>
              {kegiatan.status.toLowerCase() === 'aktif' && (
                <Button variant="primary" size="sm" disabled={sisa <= 0} leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
                  Tambah
                </Button>
              )}
            </div>
          }
        >
        <DataTable<Peserta>
            columns={columns}
            data={peserta}
            onDelete={(row) => setShowDeleteModal(row)}
          />
        </Card>

        {/* modal tambah */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Tambah Peserta"
        description="Tambah peserta pada kegiatan ini."
        size="sm"
      footer={
        <>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setShowAddModal(false)}
          >
            Batal
          </Button>
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleTambahPeserta}
          >
            Simpan Peserta
          </Button>
        </>
      }
      >
        <div className="space-y-4">
          <SelectSearch
            label="Pilih Warga"
            placeholder="Cari warga..."
            options={wargaOptions}
            value={newPeserta.warga_id}
            onChange={(value) => setNewPeserta({ ...newPeserta, warga_id: value })}
            required
          />
          
          <Textarea 
            label="Catatan"
            placeholder="Catatan (Opsional)"
            rows={3} 
            value={newPeserta.catatan}
            onChange={(e) => setNewPeserta({ ...newPeserta, catatan: e.target.value })} 
          />
        </div>
      </Modal>

        {/* modal hapus */}
        <ConfirmModal
          isOpen={!!showDeleteModal}
          title="Hapus Peserta"
        message={
          <>
            Apakah Anda yakin ingin menghapus <strong className="font-bold text-slate-900">{showDeleteModal?.profiles?.nama}</strong> dari kegiatan ini?
          </>
        }
          confirmLabel="Hapus"
          confirmVariant="danger"
          onCancel={() => setShowDeleteModal(null)}
          onConfirm={() => showDeleteModal && handleHapusPeserta(showDeleteModal.id)}
        />

        {/* modal batalkan kegiatan */}
       <Modal
          open={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title="Apakah Anda yakin ingin membatalkan kegiatan ini? Tindakan ini tidak dapat dibatalkan."
          // description="Batalkan Kegiatan"
          size="sm"
          footer={
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowCancelModal(false)}
              >
                Batal
              </Button>
              <Button 
                variant="danger" 
                size="sm" 
                onClick={handleBatalkan}
              >
                Konfirmasi
              </Button>
            </>
          }
        >
          <Textarea
            label="Alasan Pembatalan"
            placeholder="Masukkan alasan pembatalan..."
            rows={3}
            value={alasanBatal}
            onChange={(e) => setAlasanBatal(e.target.value)}
          />
        </Modal>
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
