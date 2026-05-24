/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
// Gunakan Server Client untuk Server Component
import { createClient } from "@/lib/supabase/server";
import { FileText, Download, Printer, Layers, Calendar, CheckCircle2, Clock, Users, CircleDollarSign, Search } from "lucide-react";
import LaporanExport from "@/components/bansos/LaporanExport";

interface LaporanPageProps {
  searchParams: Promise<{
    program?: string;
    bulan?: string;
    tahun?: string;
  }>;
}

const DAFTAR_BULAN = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
];

export default async function LaporanBansosPage({ searchParams }: LaporanPageProps) {
  const params = await searchParams;

  // Inisialisasi Supabase Server Client
  const supabase = await createClient();

  const currentYear = new Date().getFullYear();
  // Ambil default bulan saat ini (dua digit)
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

  const selectedProgram = params.program || "";
  const selectedBulan = params.bulan || currentMonth;
  const selectedTahun = params.tahun || currentYear.toString();

  // 🔥 PERBAIKAN 1: Ambil label nama bulan berdasarkan selectedBulan
  const namaBulanLabel = DAFTAR_BULAN.find((b) => b.value === selectedBulan)?.label || "Mei";

  // 🔥 PERBAIKAN 2: Sesuaikan format string dengan isi DB ("Mei 2026" -> Menggunakan Spasi)
  const formatPeriodeStr = `${namaBulanLabel} ${selectedTahun}`;

  // 2. Fetch Master Program untuk Dropdown Filter
  const { data: dataBansosMaster } = await supabase.from("bansos").select("nama_program");
  const listProgramMaster = Array.from(new Set((dataBansosMaster || []).map((item) => item.nama_program))).sort();

  // 3. Query Relasional disesuaikan dengan skema tabel database Anda
  let query = supabase
    .from("bansos")
    .select(
      `
      id,
      nama_program,
      jumlah_bantuan,
      periode,
      status,
      catatan,
      created_at,
      penerima_id,
      profiles (
        nama,
        rt,
        rw
      )
    `,
    )
    .eq("periode", formatPeriodeStr);

  if (selectedProgram) {
    query = query.eq("nama_program", selectedProgram);
  }

  const { data: reportRows, error } = await query.order("created_at", { ascending: true });

  if (error) {
    console.error("❌ Error Fetching Laporan Bansos:", error);
  }

  const records = reportRows || [];

  // 4. Kalkulasi Agregasi Data Laporan
  const totalKK = records.length;
  const sudahSalurKK = records.filter((r) => r.status === "tersalurkan").length;
  const belumSalurKK = totalKK - sudahSalurKK;

  const persenSudah = totalKK > 0 ? Math.round((sudahSalurKK / totalKK) * 100) : 0;
  const persenBelum = totalKK > 0 ? 100 - persenSudah : 0;

  const totalNilaiTersalurkan = records.filter((r) => r.status === "tersalurkan").reduce((sum, item) => sum + (item.jumlah_bantuan || 0), 0);

  return (
    <div className="space-y-6 p-1 md:p-4 print:p-0 print:bg-white">
      {/* HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 print:hidden">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-700 stroke-[2.5]" />
            Laporan Penyaluran Bantuan Sosial
          </h2>
          <p className="text-slate-500 text-xs font-medium">Analisis data real-time ketersediaan dan ketepatan sasaran bansos tingkat desa/RT.</p>
        </div>
      </div>

      {/* BLOCK FILTER FORM */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-400" /> Nama Program Bansos
            </label>
            <select
              name="program"
              defaultValue={selectedProgram}
              className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            >
              <option value="">📁 Semua Program</option>
              {listProgramMaster.map((prog) => (
                <option key={prog} value={prog}>
                  🔹 {prog}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Periode Bulan
            </label>
            <select
              name="bulan"
              defaultValue={selectedBulan}
              className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            >
              {DAFTAR_BULAN.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wide flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" /> Tahun
            </label>
            <select
              name="tahun"
              defaultValue={selectedTahun}
              className="w-full bg-white border border-slate-300 rounded-lg py-1.5 px-3 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
            >
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
                <option key={y} value={y.toString()}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-lg shadow transition flex items-center justify-center gap-2 h-9 cursor-pointer">
              <Search className="w-4 h-4" />
              Tampilkan Laporan
            </button>
          </div>
        </form>
      </div>

      {/* KOP SURAT FORMAL */}
      <div className="hidden print:block text-center space-y-1 border-b-4 border-double border-slate-900 pb-4 mb-6">
        <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">Pemerintah Kabupaten Bekasi</h1>
        <h2 className="text-lg font-bold uppercase text-slate-800">Sekretariat Desa Sukamaju</h2>
        <p className="text-xs text-slate-500 font-medium font-mono">Jl. Raya Lingkar Transaksi No. 17, Jawa Barat</p>
      </div>

      {/* JUDUL LAPORAN PRINTER */}
      <div className="hidden print:block mb-4">
        <h3 className="text-base font-extrabold text-slate-900 uppercase text-center">Laporan Rekapitulasi Pendistribusian {selectedProgram || "Semua Program Bansos"}</h3>
        <p className="text-xs text-slate-600 text-center font-medium mt-0.5">
          Periode Kelayakan: {namaBulanLabel} {selectedTahun} ({formatPeriodeStr})
        </p>
      </div>

      {/* CONDITION EMPTY CHECK */}
      {totalKK === 0 ? (
        <div className="bg-amber-50 rounded-xl p-8 border border-amber-200 text-center max-w-xl mx-auto mt-6">
          <p className="text-amber-800 font-bold text-sm">Tidak Ada Rekaman Distribusi</p>
          <p className="text-amber-600 text-xs mt-1">
            Belum terdapat alokasi warga terdaftar pada program <strong className="text-slate-900">{selectedProgram || "Semua Program"}</strong> untuk periode{" "}
            <strong className="text-slate-900">
              {namaBulanLabel} {selectedTahun}
            </strong>
            .
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ACTION BAR */}
          <div className="flex items-center justify-between bg-slate-100 p-3 rounded-xl border border-slate-200 print:hidden">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">Dokumen siap cetak ({totalKK} Baris ter-filter)</span>
            <div className="flex items-center gap-2">
              <LaporanExport records={records} selectedProgram={selectedProgram} namaBulanLabel={namaBulanLabel} selectedTahun={selectedTahun} totalDanaTersalurkan={totalNilaiTersalurkan} />
            </div>
          </div>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5 print:border-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-50 text-slate-600 print:hidden">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Total Penerima</span>
                <p className="text-xl font-black text-slate-900 font-mono">{totalKK} KK</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5 print:border-slate-300">
              <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700 print:hidden">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Sudah Tersalurkan</span>
                <p className="text-xl font-black text-emerald-700 font-mono">
                  {sudahSalurKK} KK <span className="text-xs font-bold text-slate-400">({persenSudah}%)</span>
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5 print:border-slate-300">
              <div className="p-2.5 rounded-lg bg-amber-50 text-amber-700 print:hidden">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Belum Tersalurkan</span>
                <p className="text-xl font-black text-amber-700 font-mono">
                  {belumSalurKK} KK <span className="text-xs font-bold text-slate-400">({persenBelum}%)</span>
                </p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3.5 print:border-slate-300">
              <div className="p-2.5 rounded-lg bg-blue-50 text-blue-700 print:hidden">
                <CircleDollarSign className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">Total Dana Cair</span>
                <p className="text-xl font-black text-slate-900 font-mono">Rp {totalNilaiTersalurkan.toLocaleString("id-ID")}</p>
              </div>
            </div>
          </div>

          {/* PROGRESS BAR */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 print:border-slate-300">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Rasio Keberhasilan Alokasi Penyaluran</span>
              <span className="font-mono text-emerald-700">{persenSudah}% Sukses</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex border border-slate-200/50">
              <div className="bg-emerald-600 h-full transition-all duration-300" style={{ width: `${persenSudah}%` }} />
              <div className="bg-slate-300 h-full transition-all duration-300" style={{ width: `${persenBelum}%` }} />
            </div>
          </div>

          {/* TABLE CORE */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden print:border-slate-400">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider print:bg-slate-100 print:text-slate-900 print:border-slate-400">
                    <th className="py-3 px-4 text-center w-12">No</th>
                    <th className="py-3 px-4">Nama Penerima</th>
                    <th className="py-3 px-4">ID Penerima</th>
                    <th className="py-3 px-4 text-center">Wilayah RT/RW</th>
                    <th className="py-3 px-4 text-right">Nominal Jumlah</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Tanggal Cair</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-medium text-slate-700 print:divide-slate-300">
                  {records.map((row: any, idx) => {
                    const profileData = row.profiles;
                    const tanggalCair = row.status === "tersalurkan" ? new Date(row.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-";

                    return (
                      <tr key={row.id} className="hover:bg-slate-50/70 transition print:hover:bg-transparent">
                        <td className="py-2.5 px-4 text-center font-mono text-slate-400 print:text-slate-900">{idx + 1}</td>
                        <td className="py-2.5 px-4 font-bold text-slate-900 uppercase">{profileData?.nama || "Warga Luar/Tidak Terdata"}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-500 text-[11px] print:text-slate-900">{row.penerima_id}</td>
                        <td className="py-2.5 px-4 text-center font-semibold">
                          RT {profileData?.rt || "00"} / RW {profileData?.rw || "00"}
                        </td>
                        <td className="py-2.5 px-4 text-right font-bold font-mono text-slate-800">Rp {Number(row.jumlah_bantuan || 0).toLocaleString("id-ID")}</td>
                        <td className="py-2.5 px-4 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                              row.status === "tersalurkan" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {row.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-center text-slate-500 font-mono text-[11px] print:text-slate-900">{tanggalCair}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* SIGNATURE FOOTER */}
          <div className="hidden print:grid grid-cols-2 pt-12 text-xs font-bold text-slate-900 mt-12 page-break-inside-avoid">
            <div className="text-center space-y-16">
              <div>
                <p>Mengetahui,</p>
                <p className="uppercase">Ketua Lingkungan Rukun Warga (RW)</p>
              </div>
              <div>
                <p className="underline font-black">................................................</p>
              </div>
            </div>

            <div className="text-center space-y-16">
              <div>
                <p>Bekasi, {new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</p>
                <p className="uppercase">Kepala Desa Sukamaju</p>
              </div>
              <div>
                <p className="underline font-black">H. NANDO JAYA, M.Si</p>
                <p className="text-slate-500 font-normal text-[11px]">Kepala Desa Utama</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
