/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Search, Users, CheckCircle2, Clock, CircleDollarSign, ChartBarBig } from "lucide-react";
import DataTable, { Column } from "@/components/DataTable";
import LaporanTableClient from "@/components/bansos/LaporanClient";

interface LaporanPageProps {
  searchParams: Promise<{
    program?: string;
    bulan?: string;
    tahun?: string;
  }>;
}

const DAFTAR_BULAN = [
  { value: "01", label: "Januari" }, { value: "02", label: "Februari" },
  { value: "03", label: "Maret" }, { value: "04", label: "April" },
  { value: "05", label: "Mei" }, { value: "06", label: "Juni" },
  { value: "07", label: "Juli" }, { value: "08", label: "Agustus" },
  { value: "09", label: "September" }, { value: "10", label: "Oktober" },
  { value: "11", label: "November" }, { value: "12", label: "Desember" },
];

export default async function LaporanBansosPage({ searchParams }: LaporanPageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, "0");

  const selectedProgram = params.program || "";
  const selectedBulan = params.bulan || currentMonth;
  const selectedTahun = params.tahun || currentYear.toString();

  const namaBulanLabel = DAFTAR_BULAN.find((b) => b.value === selectedBulan)?.label || "Mei";
  const formatPeriodeStr = `${namaBulanLabel} ${selectedTahun}`;

  const { data: dataBansosMaster } = await supabase.from("bansos").select("nama_program");
  const listProgramMaster = Array.from(new Set((dataBansosMaster || []).map((item) => item.nama_program))).sort();

  let query = supabase
    .from("bansos")
    .select(`id, nama_program, jumlah_bantuan, periode, status, catatan, created_at, penerima_id, profiles (nama, rt, rw)`)
    .eq("periode", formatPeriodeStr);

  if (selectedProgram) query = query.eq("nama_program", selectedProgram);

  const { data: reportRows, error } = await query.order("created_at", { ascending: true });
  const records = reportRows || [];

  const totalKK = records.length;
  const sudahSalurKK = records.filter((r) => r.status === "tersalurkan").length;
  const belumSalurKK = totalKK - sudahSalurKK;
  const persenSudah = totalKK > 0 ? Math.round((sudahSalurKK / totalKK) * 100) : 0;
  const persenBelum = totalKK > 0 ? 100 - persenSudah : 0;
  const totalNilaiTersalurkan = records.filter((r) => r.status === "tersalurkan").reduce((sum, item) => sum + (item.jumlah_bantuan || 0), 0);

  // Definisi Kolom DataTable
  const columns: Column<any>[] = [
    { label: "Nama Penerima", key: "nama_penerima", render: (_, row) => <span className="font-bold text-slate-900 uppercase">{row.profiles?.nama || "Warga Luar"}</span> },
    { label: "ID Penerima", key: "penerima_id", render: (val) => <span className="font-mono text-[11px] text-slate-500">{val as string}</span> },
    { label: "RT / RW", key: "wilayah", render: (_, row) => `RT ${row.profiles?.rt || "00"} / RW ${row.profiles?.rw || "00"}` },
    { label: "Nominal", key: "jumlah_bantuan", render: (val) => <span className="font-bold font-mono">Rp {Number(val || 0).toLocaleString("id-ID")}</span> },
    { 
      label: "Status", 
      key: "status", 
      render: (val) => (
        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${val === "tersalurkan" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
          {String(val).charAt(0).toUpperCase() + String(val).slice(1)}
        </span>
      ) 
    },
    { label: "Tanggal Cair", key: "created_at", render: (val, row) => row.status === "tersalurkan" ? new Date(val as string).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-" }
  ];

  return (
    <div className="space-y-6">
       <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#15803d] flex items-center justify-center border border-emerald-100 shadow-sm">
            <ChartBarBig className="w-5 h-5 stroke-[2.25]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Penyaluran Bantuan Sosial</h1>
            <p className="text-sm text-slate-500 mt-0.5">Pantau penyaluran dana stimulan, verifikasi data jaring pengaman, serta klasterisasi bansos berkala warga.</p>
          </div>
        </div>

      {/* FILTER FORM */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <form method="GET" className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
            {/* Filter Input */}
            <select name="program" defaultValue={selectedProgram} className="w-full border-slate-300 rounded-lg py-1.5 px-3 text-xs font-semibold text-slate-700 border">
              <option value="">📁 Semua Program</option>
              {listProgramMaster.map((prog) => <option key={prog} value={prog}>{prog}</option>)}
            </select>
            <select name="bulan" defaultValue={selectedBulan} className="w-full border-slate-300 rounded-lg py-1.5 px-3 text-xs font-semibold text-slate-700 border">
              {DAFTAR_BULAN.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
            </select>
            <select name="tahun" defaultValue={selectedTahun} className="w-full border-slate-300 rounded-lg py-1.5 px-3 text-xs font-semibold text-slate-700 border">
              {[currentYear - 1, currentYear, currentYear + 1].map((y) => <option key={y} value={y.toString()}>{y}</option>)}
            </select>
            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2 px-4 rounded-lg shadow transition h-9 flex items-center justify-center gap-2">
              <Search className="w-4 h-4" /> Tampilkan
            </button>
        </form>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Penerima", value: `${totalKK} KK`, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Tersalurkan", value: `${sudahSalurKK} KK`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Menunggu", value: `${belumSalurKK} KK`, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Dana Cair", value: `Rp ${totalNilaiTersalurkan.toLocaleString("id-ID")}`, icon: CircleDollarSign, color: "text-slate-600", bg: "bg-slate-50" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}><stat.icon className="w-6 h-6" /></div>
            <div>
             <p className="text-[12px] font-semibold text-slate-500 uppercase ">{stat.label}</p>
              <p className="text-xl font-semibold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <LaporanTableClient records={records} />
      </div>
    </div>
  );
}