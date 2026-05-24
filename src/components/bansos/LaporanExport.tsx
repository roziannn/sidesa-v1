/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { Download, Printer } from "lucide-react";

interface ExportButtonsProps {
  records: any[];
  selectedProgram: string;
  namaBulanLabel: string;
  selectedTahun: string;
  totalDanaTersalurkan: number;
}

export default function ExportButtons({ records, selectedProgram, namaBulanLabel, selectedTahun, totalDanaTersalurkan }: ExportButtonsProps) {
  // =========================
  // EXPORT PDF
  // =========================
  const handleExportPDF = () => {
    const doc = new jsPDF("landscape");

    doc.setFontSize(16);
    doc.text("LAPORAN PENYALURAN BANTUAN SOSIAL", 14, 15);

    doc.setFontSize(10);
    doc.text(`Program: ${selectedProgram || "Semua Program"}`, 14, 24);

    doc.text(`Periode: ${namaBulanLabel} ${selectedTahun}`, 14, 30);

    const tableData = records.map((row: any, index: number) => [
      index + 1,
      row.profiles?.nama || "Tidak Terdata",
      row.penerima_id,
      `RT ${row.profiles?.rt || "00"} / RW ${row.profiles?.rw || "00"}`,
      `Rp ${Number(row.jumlah_bantuan || 0).toLocaleString("id-ID")}`,
      row.status,
      row.status === "Tersalurkan" ? new Date(row.created_at).toLocaleDateString("id-ID") : "-",
    ]);

    autoTable(doc, {
      startY: 38,
      head: [["No", "Nama", "ID Penerima", "Wilayah", "Nominal", "Status", "Tanggal Cair"]],
      body: tableData,
      styles: {
        fontSize: 8,
      },
      headStyles: {
        fillColor: [16, 185, 129],
      },
    });

    const finalY = (doc as any).lastAutoTable.finalY || 60;

    doc.text(`Total Dana Tersalurkan: Rp ${totalDanaTersalurkan.toLocaleString("id-ID")}`, 14, finalY + 10);

    // Area tanda tangan
    doc.text(`Bekasi, ${new Date().toLocaleDateString("id-ID")}`, 220, finalY + 25);

    doc.text("Kepala Desa Sukamaju", 220, finalY + 32);

    doc.text("H. NANDO JAYA, M.Si", 220, finalY + 55);

    doc.save(`laporan-bansos-${namaBulanLabel}-${selectedTahun}.pdf`);
  };

  // =========================
  // EXPORT EXCEL
  // =========================
  const handleExportExcel = () => {
    const excelData = records.map((row: any, index: number) => ({
      No: index + 1,
      Nama: row.profiles?.nama || "Tidak Terdata",
      "ID Penerima": row.penerima_id,
      Wilayah: `RT ${row.profiles?.rt || "00"} / RW ${row.profiles?.rw || "00"}`,
      Nominal: row.jumlah_bantuan,
      Status: row.status,
      "Tanggal Cair": row.status === "Tersalurkan" ? new Date(row.created_at).toLocaleDateString("id-ID") : "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Bansos");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(fileData, `rekap-bansos-${namaBulanLabel}-${selectedTahun}.xlsx`);
  };

  return (
    <div className="flex items-center gap-2">
      {/* EXCEL */}
      <button
        type="button"
        onClick={handleExportExcel}
        className="inline-flex items-center gap-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-emerald-700" />
        Export Excel
      </button>

      {/* PDF */}
      <button type="button" onClick={handleExportPDF} className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition cursor-pointer">
        <Printer className="w-3.5 h-3.5" />
        Export PDF
      </button>
    </div>
  );
}
