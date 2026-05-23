import React, { Suspense } from "react";
import { 
  Home, 
  HandHeart, 
  Calendar, 
  FileText, 
  Wallet, 
  Clock, 
  CheckCircle, 
  XCircle 
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
// Import komponen greeting yang baru
import Greeting from "@/components/dashboard/Greeting";

export const revalidate = 0;

export default async function DashboardOverviewPage() {
  // 1. Ambil data user yang login untuk mendapatkan namanya dari tabel profiles
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let namaManager = "Petugas";

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nama_lengkap")
      .eq("id", user.id)
      .single();
      
    if (profile?.nama_lengkap) {
      namaManager = profile.nama_lengkap;
    }
  }

  return (
    <div className="space-y-8">
      {/* Bagian Atas: Menggunakan komponen Greeting Client-Side */}
      <Greeting namaManager={namaManager} />

      {/* Bagian Konten Utama */}
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

// Sub-komponen Asinkronus untuk Fetching Data Supabase
async function DashboardContent() {
  const supabase = await createClient();

  // Mendapatkan rentang tanggal awal dan akhir bulan ini untuk filter kegiatan
  const sekarang = new Date();
  const awalBulan = new Date(sekarang.getFullYear(), sekarang.getMonth(), 1).toISOString();
  const akhirBulan = new Date(sekarang.getFullYear(), shendBulanDate(), 31).toISOString(); 
  function shendBulanDate() {
    return sekarang.getMonth() + 1;
  }

  // Melakukan eksekusi query secara paralel untuk efisiensi performa server
  const [
    totalKK,
    bansosAktif,
    kegiatanBulanIni,
    suratPending,
    retribusiBelumBayar,
    suratTerbaru,
    kegiatanMendatang
  ] = await Promise.all([
    // 1. Total KK
    supabase.from("keluarga").select("*", { count: "exact", head: true }),
    
    // 2. Penerima Bansos Aktif
    supabase.from("bansos").select("*", { count: "exact", head: true }).eq("status", "tersalurkan"),
    
    // 3. Kegiatan Bulan Ini
    supabase.from("kegiatan").select("*", { count: "exact", head: true })
      .gte("tanggal_pelaksanaan", awalBulan)
      .lte("tanggal_pelaksanaan", akhirBulan),
    
    // 4. Surat Pending Approval
    supabase.from("surat").select("*", { count: "exact", head: true }).eq("status", "pending"),
    
    // 5. Retribusi Belum Lunas
    supabase.from("retribusi").select("*", { count: "exact", head: true }).eq("status", "belum_bayar"),

    // 6. Ambil 5 Surat Terbaru beserta relasi profil pemohon
    supabase.from("surat")
      .select(`id, jenis_surat, status, created_at, profiles(nama_lengkap)`)
      .order("created_at", { ascending: false })
      .limit(5),

    // 7. Ambil 3 Kegiatan Terdekat yang akan datang
    supabase.from("kegiatan")
      .select("id, judul, tanggal_pelaksanaan, lokasi, kuota")
      .gte("tanggal_pelaksanaan", sekarang.toISOString())
      .order("tanggal_pelaksanaan", { ascending: true })
      .limit(3)
  ]);

  // Ekstraksi data statistik counts (jika null atau error, default ke 0)
  const countKK = totalKK.count || 0;
  const countBansos = bansosAktif.count || 0;
  const countKegiatan = kegiatanBulanIni.count || 0;
  const countSurat = suratPending.count || 0;
  const countRetribusi = retribusiBelumBayar.count || 0;

  // Struktur data kartu statistik untuk mempermudah perulangan loop (.map)
  const stats = [
    { label: "Total KK Terdaftar", value: countKK, sub: "Kepala Keluarga", icon: Home, bgIcon: "bg-blue-50 text-blue-600" },
    { label: "Penerima Bansos", value: countBansos, sub: "Program Tersalurkan", icon: HandHeart, bgIcon: "bg-emerald-50 text-emerald-600" },
    { label: "Kegiatan Bulan Ini", value: countKegiatan, sub: "Agenda Terjadwal", icon: Calendar, bgIcon: "bg-purple-50 text-purple-600" },
    { label: "Surat Pending", value: countSurat, sub: "Perlu Persetujuan", icon: FileText, bgIcon: "bg-orange-50 text-orange-600" },
    { label: "Retribusi Tertunggak", value: countRetribusi, sub: "Tagihan Aktif", icon: Wallet, bgIcon: "bg-red-50 text-red-600" },
  ];

  return (
    <>
      {/* ---------------------------------------------------------------- */}
      {/* GRID KARTU STATISTIK (Responsive: 2-Mobile, 3-Tablet, 5-Desktop) */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${stat.bgIcon}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-bold text-slate-800 tracking-tight">{stat.value}</p>
              <p className="text-xs text-slate-400 mt-1">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* SEKSI DATA TABEL BAWAH (Split 2 Kolom pada Layar Lebar)         */}
      {/* ---------------------------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Tabel Surat Terbaru (Lebar Kolom: 7/12) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-slate-800 text-sm">5 Pengajuan Surat Terbaru</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-slate-400 font-semibold text-xs">
                  <th className="p-4">Pemohon</th>
                  <th className="p-4">Jenis Surat</th>
                  <th className="p-4">Tanggal</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                {suratTerbaru.data && suratTerbaru.data.length > 0 ? (
                  suratTerbaru.data.map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-medium text-slate-700 truncate max-w-[140px]">
                        {s.profiles?.nama_lengkap || "Warga"}
                      </td>
                      <td className="p-4 text-xs">{s.jenis_surat}</td>
                      <td className="p-4 text-xs text-slate-400">
                        {new Date(s.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium leading-none ${
                          s.status === "pending" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                          s.status === "disetujui" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          {s.status === "pending" && <Clock className="w-3 h-3" />}
                          {s.status === "disetujui" && <CheckCircle className="w-3 h-3" />}
                          {s.status === "ditolak" && <XCircle className="w-3 h-3" />}
                          <span className="capitalize">{s.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-slate-400 text-xs">Belum ada pengajuan surat masuk.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Kegiatan Mendatang (Lebar Kolom: 5/12) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-slate-800 text-sm">Agenda Kegiatan Terdekat</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {kegiatanMendatang.data && kegiatanMendatang.data.length > 0 ? (
              kegiatanMendatang.data.map((k: any) => (
                <div key={k.id} className="p-4 hover:bg-slate-50/50 transition-colors flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-slate-700 truncate">{k.judul}</h4>
                    <p className="text-xs text-slate-400 mt-1 truncate">📍 {k.lokasi}</p>
                    <p className="text-[11px] text-[#15803d] font-medium mt-1">Kuota: {k.kuota || "Tidak terbatas"} warga</p>
                  </div>
                  <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-center flex-shrink-0 min-w-[55px]">
                    <p className="text-xs font-bold text-slate-700">
                      {new Date(k.tanggal_pelaksanaan).toLocaleDateString("id-ID", { day: "2-digit" })}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">
                      {new Date(k.tanggal_pelaksanaan).toLocaleDateString("id-ID", { month: "short" })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">Tidak ada kegiatan terdekat dalam waktu dekat.</div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

// ------------------------------------------------------------------
// KOMPONEN LOADING SKELETON (Animasi Kedip Abu-abu saat Data Dimuat)
// ------------------------------------------------------------------
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Skeleton Kartu */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-5 h-28 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between">
              <div className="h-3 w-20 bg-slate-200 rounded"></div>
              <div className="h-8 w-8 bg-slate-200 rounded-full"></div>
            </div>
            <div className="h-6 w-12 bg-slate-200 rounded mt-2"></div>
          </div>
        ))}
      </div>

      {/* Skeleton Tabel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white h-72 rounded-xl border border-slate-200 shadow-sm"></div>
        <div className="lg:col-span-5 bg-white h-72 rounded-xl border border-slate-200 shadow-sm"></div>
      </div>
    </div>
  );
}