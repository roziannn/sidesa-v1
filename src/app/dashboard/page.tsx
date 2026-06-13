import React, { Suspense } from "react";
import { 
  Home, 
  HandHeart, 
  Calendar, 
  FileText, 
  Wallet, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users,
  Mars,
  Venus,
  PinIcon,
  LocateIcon,
  House
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
// Import komponen greeting yang baru
import Greeting from "@/components/dashboard/Greeting";
import { formatDate } from "@/lib/format";

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

  const [
  totalWarga,
  totalLakiLaki,
  totalPerempuan,
] = await Promise.all([
  supabase
    .from("anggota")
    .select("*", {
      count: "exact",
      head: true,
    }),

  supabase
    .from("anggota")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq(
      "jenis_kelamin",
      "L"
    ),

  supabase
    .from("anggota")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq(
      "jenis_kelamin",
      "P"
    ),
]);

const countWarga =
  totalWarga.count ?? 0;

const countLakiLaki =
  totalLakiLaki.count ?? 0;

const countPerempuan =
  totalPerempuan.count ?? 0;

  return (
    <div className="space-y-6">
      <Greeting
      namaManager={namaManager}
    />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}

// Sub-komponen Asinkronus untuk Fetching Data Supabase
async function DashboardContent() {
  const supabase = await createClient();

  // mendapatkan rentang tanggal awal dan akhir bulan ini untuk filter kegiatan
  const sekarang = new Date();
  const awalBulan = new Date(sekarang.getFullYear(), sekarang.getMonth(), 1).toISOString();
  const akhirBulan = new Date(sekarang.getFullYear(), shendBulanDate(), 31).toISOString(); 
  function shendBulanDate() {
    return sekarang.getMonth() + 1;
  }

  // melakukan eksekusi query secara paralel untuk efisiensi performa server
  const [
    totalKK,
    bansosAktif,
    kegiatanBulanIni,
    suratPending,
    retribusiBelumBayar,
    suratTerbaru,
  ] = await Promise.all([
    // 1. Total KK
    supabase.from("keluarga").select("*", { count: "exact", head: true }),
    
    // 2. Penerima Bansos Aktif
    supabase.from("bansos").select("*", { count: "exact", head: true }).eq("status", "tersalurkan"),
    
    // 3. Kegiatan Bulan Ini
    supabase.from("kegiatan").select(
      "id, judul, tanggal_pelaksanaan, lokasi, kuota"
    ),
    
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
const today =
  new Date()
    .toISOString()
    .split("T")[0];

  const kegiatanMendatang =
  await supabase
    .from("kegiatan")
    .select(
      "id, judul, tanggal, lokasi, kuota"
    )
    .gte(
      "tanggal",
      awalBulan
    )
    .lte(
      "tanggal",
      akhirBulan
    )
    .eq(
      "status",
      "aktif"
    )
    .order(
      "tanggal",
      {
        ascending: true,
      }
    )
    .limit(5);

  // ekstraksi data statistik counts (jika null atau error, default ke 0)
  const countKK = totalKK.count || 0;
  const countBansos = bansosAktif.count || 0;
  const countKegiatan = kegiatanBulanIni.count || 0;
  const countSurat = suratPending.count || 0;
  const countRetribusi = retribusiBelumBayar.count || 0;

  const suratChartRaw =
  await supabase
    .from("surat")
    .select("jenis_surat");

const suratChartData = Object.values(
  (suratChartRaw.data ?? []).reduce(
    (acc, item) => {
      const jenis =
        item.jenis_surat ||
        "Lainnya";

      if (!acc[jenis]) {
        acc[jenis] = {
          jenis,
          total: 0,
        };
      }

      acc[jenis].total += 1;

      return acc;
    },
    {} as Record<
      string,
      {
        jenis: string;
        total: number;
      }
    >
  )
)
.sort(
  (a, b) =>
    b.total - a.total
);

  // Struktur data kartu statistik untuk mempermudah perulangan loop (.map)
  const stats = [
    { label: "Total KK Terdaftar", value: countKK, sub: "Kepala Keluarga", icon: Home, bgIcon: "bg-blue-50 text-blue-600" },
    { label: "Penerima Bansos", value: countBansos, sub: "Program Tersalurkan", icon: HandHeart, bgIcon: "bg-emerald-50 text-emerald-600" },
    { label: "Kegiatan Bulan Ini", value: countKegiatan, sub: "Agenda Terjadwal", icon: Calendar, bgIcon: "bg-purple-50 text-purple-600" },
    { label: "Surat Pending", value: countSurat, sub: "Perlu Persetujuan", icon: FileText, bgIcon: "bg-orange-50 text-orange-600" },
    { label: "Retribusi Tertunggak", value: countRetribusi, sub: "Tagihan Aktif", icon: Wallet, bgIcon: "bg-red-50 text-red-600" },
  ];

  const [
  totalWarga,
  totalLakiLaki,
  totalPerempuan,
] = await Promise.all([
  supabase
    .from("anggota")
    .select("*", {
      count: "exact",
      head: true,
    }),

  supabase
    .from("anggota")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq(
      "jenis_kelamin",
      "L"
    ),

  supabase
    .from("anggota")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq(
      "jenis_kelamin",
      "P"
    ),
]);

const countWarga =
  totalWarga.count ?? 0;

const countLakiLaki =
  totalLakiLaki.count ?? 0;

const countPerempuan =
  totalPerempuan.count ?? 0;

  return (
    <>
   <div className="grid gap-4 lg:grid-cols-12">

    {/* Ringkasan */}
    <div className="lg:col-span-9 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-700 p-6 text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-emerald-100">
            Ringkasan Hari Ini
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {countSurat} Surat Menunggu Persetujuan
          </h2>

          <p className="mt-2 text-emerald-100">
            {countKegiatan} kegiatan bulan ini |
            {" "}
            {countRetribusi} retribusi belum dibayar
          </p>
        </div>

        <div className="hidden md:block">
          {formatDate(new Date())}
        </div>
      </div>
    </div>

    {/* Statistik Warga */}
    <div className="lg:col-span-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-slate-600 flex gap-1">
          <Users className="w-4 h-4"/> Total Warga
        </span>

        <span className="text-xl font-bold text-slate-900">
          {countWarga}
        </span>
      </div>

      <div className="my-3 h-px bg-slate-200" />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 flex gap-1">
            <Mars className="w-4 h-4"/> Laki-laki
          </span>

          <span className="font-semibold text-blue-600">
            {countLakiLaki}
            {" ("}
            {(
              (countLakiLaki /
                countWarga) *
              100
            ).toFixed(1)}
            %)
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-slate-600 flex gap-1">
            <Venus className="w-4 h-4"/> Perempuan
          </span>

          <span className="font-semibold text-pink-600">
            {countPerempuan}
            {" ("}
            {(
              (countPerempuan /
                countWarga) *
              100
            ).toFixed(1)}
            %)
          </span>
        </div>
      </div>
    </div>

  </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase">{stat.label}</span>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${stat.bgIcon}`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-1">
              <p className="text-md font-bold text-slate-800">{stat.value} {stat.sub}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
       <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
    <div className="flex items-center justify-between p-6">
      <div>
        <h3 className="font-bold text-slate-800">
          Statistik Pengajuan Surat
        </h3>

        <p className="text-sm text-slate-500">
          Jumlah pengajuan berdasarkan jenis surat
        </p>
      </div>
    </div>

  <div className="px-6 mb-6">
    <div className="space-y-5">
      {suratChartData.length > 0 ? (
        suratChartData.map(
          (item) => {
            const max =
              suratChartData[0]
                .total;

            const width =
              (item.total /
                max) *
              100;

            return (
              <div
                key={
                  item.jenis
                }
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">
                    {
                      item.jenis
                    }
                  </span>

                  <span className="text-sm font-bold text-slate-900">
                    {
                      item.total
                    }
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600 transition-all"
                    style={{
                      width: `${width}%`,
                    }}
                  />
                </div>
              </div>
            );
          }
        )
      ) : (
        <div className="py-12 text-center text-sm text-slate-400">
          Belum ada data pengajuan surat.
        </div>
      )}
    </div>
  </div>
</div>

  <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
     <div className="flex items-center justify-between p-6">
      <div>
        <h3 className="font-bold text-slate-800">
          Agenda Mendatang
        </h3>

        <p className="text-sm text-slate-500">
          Kegiatan desa yang akan berlangsung
        </p>
      </div>
  </div>

  <div className="px-6 mb-6">
    {kegiatanMendatang.data &&
    kegiatanMendatang.data.length > 0 ? (
      <div className="space-y-5">
        {kegiatanMendatang.data.map(
          (k: any, index) => (
            <div
              key={k.id}
              className="relative pl-8"
            >
              {/* Timeline */}
              <div className="absolute left-0 top-1 h-3 w-3 rounded-full bg-emerald-600" />

              {index !==
                kegiatanMendatang.data.length -
                  1 && (
                <div className="absolute left-[5px] top-4 bottom-[-24px] w-px bg-slate-200" />
              )}

              <div>
                <h4 className="font-semibold text-slate-800">
                  {k.judul}
                </h4>

                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <span className="flex gap-1">
                    <Calendar className="w-3 h-3"/>
                    {formatDate(
                      k.tanggal
                    )} -
                  </span>

                  <span className="flex gap-1">
                  <House className="w-3 h-3"/> {k.lokasi}
                  </span>
                </div>
              </div>
            </div>
          )
        )}
      </div>
      ) : (
        <div className="py-10 text-center text-sm text-slate-400">
          Tidak ada kegiatan terdekat.
        </div>
      )}
    </div>
  </div>

      </div>
    </>
  );
}

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