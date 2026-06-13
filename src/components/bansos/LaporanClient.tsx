"use client";
import React from "react";
import DataTable, { Column } from "@/components/DataTable";
import { formatDate, formatRupiah } from "@/lib/format";

export default function LaporanTableClient({ records }: { records: any[] }) {
  const columns: Column<any>[] = [
    { label: "Nama Penerima", key: "nama_penerima", render: (_, row) => <span className="font-bold text-slate-900 uppercase">{row.profiles?.nama || "Warga Luar"}</span> },
    { label: "ID Penerima", key: "penerima_id", render: (val) => <span className="font-mono text-[11px] text-slate-500">{val as string}</span> },
    { label: "RT / RW", key: "wilayah", render: (_, row) => `RT ${row.profiles?.rt || "00"} / RW ${row.profiles?.rw || "00"}` },
    { label: "Nominal", key: "jumlah_bantuan", render: (val) => (
      <span className="font-bold font-mono">
        {formatRupiah(Number(val))}
      </span>
    ),},
    { 
      label: "Status", 
      key: "status", 
      render: (val) => (
        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full border ${val === "tersalurkan" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
          {String(val).charAt(0).toUpperCase() + String(val).slice(1)}
        </span>
      ) 
    },
   {
  label: "Tanggal Cair",
  key: "created_at",
      render: (val, row) =>
        row.status === "tersalurkan"
          ? formatDate(String(val))
          : "-"
    }
  ];

  return <DataTable columns={columns} data={records} />;
}