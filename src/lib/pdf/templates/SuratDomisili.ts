import { jsPDF } from "jspdf";
import { SuratDomisiliPayload } from "@/types/surat";

export const generateSuratDomisili = (payload: SuratDomisiliPayload): jsPDF => {
  const { warga, desa, nomor_urut, keperluan, tanggal_generate } = payload;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const startX = 20;
  const endX = 190;
  const midX = 105;
  let currentY = 15;

  // ================= 1. KOP SURAT (HEADER) =================
  doc.setDrawColor(100, 100, 100);
  doc.setLineWidth(0.5);

  // PERBAIKAN: Mengganti doc.polygon dengan doc.lines
  // Sintaks: lines([[x, y], ...], startX, startY, [scaleX, scaleY], style)
  doc.lines(
    [
      [18, 0],
      [0, 22],
      [-9, 4],
      [-9, -4],
      [0, -22],
    ],
    startX,
    currentY,
    [1, 1],
    "S", // 'S' untuk Stroke (garis tepi)
  );

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(7);
  doc.text("LOGO DESA", startX + 9, currentY + 12, { align: "center" });

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text(`PEMERINTAH KABUPATEN ${desa.nama_kabupaten.toUpperCase()}`, midX + 10, currentY, { align: "center" });

  currentY += 6;
  doc.text(`KECAMATAN ${desa.nama_kecamatan.toUpperCase()}`, midX + 10, currentY, { align: "center" });

  currentY += 7;
  doc.setFontSize(16);
  doc.text(`PEMERINTAH DESA ${desa.nama_desa.toUpperCase()}`, midX + 10, currentY, { align: "center" });

  currentY += 5;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Jl. ${desa.alamat_kantor}, Telp: ${desa.no_telp} - Kode Pos ${desa.kode_pos}`, midX + 10, currentY, { align: "center" });

  currentY += 4;
  doc.setLineWidth(0.8);
  doc.setDrawColor(0, 0, 0);
  doc.line(startX, currentY, endX, currentY);

  currentY += 1.2;
  doc.setLineWidth(0.2);
  doc.line(startX, currentY, endX, currentY);

  // ================= 2. JUDUL SURAT =================
  currentY += 15;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.text("SURAT KETERANGAN DOMISILI", midX, currentY, { align: "center" });

  doc.setLineWidth(0.4);
  const textWidth = doc.getTextWidth("SURAT KETERANGAN DOMISILI");
  doc.line(midX - textWidth / 2, currentY + 1, midX + textWidth / 2, currentY + 1);

  currentY += 6;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Nomor: ${nomor_urut} / ${desa.kode_desa} / ${(new Date().getMonth() + 1).toString().padStart(2, "0")} / ${new Date().getFullYear()}`, midX, currentY, { align: "center" });

  // ================= 3. ISI SURAT =================
  currentY += 15;
  doc.text(`Yang bertanda tangan di bawah ini, Kepala Desa ${desa.nama_desa}, Kecamatan ${desa.nama_kecamatan},`, startX, currentY);
  currentY += 5;
  doc.text("Kabupaten " + desa.nama_kabupaten + ", menerangkan bahwa:", startX, currentY);

  // ================= 4. TABEL BIODATA =================
  currentY += 8;
  const labelX = startX + 10;
  const titikDuaX = labelX + 40;
  const valueX = titikDuaX + 4;

  const listBiodata = [
    { label: "Nama Lengkap", value: warga.nama },
    { label: "NIK", value: warga.nik },
    { label: "Tempat / Tgl Lahir", value: `${warga.tempat_lahir}, ${warga.tanggal_lahir}` },
    { label: "Jenis Kelamin", value: warga.jenis_kelamin },
    { label: "Agama", value: warga.agama },
    { label: "Pekerjaan", value: warga.pekerjaan },
    { label: "Alamat", value: `${warga.alamat}, RT ${warga.rt} / RW ${warga.rw}` },
  ];

  listBiodata.forEach((item) => {
    doc.setFont("Helvetica", item.label === "Nama Lengkap" || item.label === "NIK" ? "bold" : "normal");
    doc.text(item.label, labelX, currentY);
    doc.text(":", titikDuaX, currentY);

    if (item.label === "Alamat") {
      const alamatLines = doc.splitTextToSize(item.value, endX - valueX);
      doc.text(alamatLines, valueX, currentY);
      currentY += (alamatLines.length - 1) * 5;
    } else {
      doc.text(item.value, valueX, currentY);
    }
    currentY += 6.5;
  });

  // ================= 5 & 6. PARAGRAF & TTD =================
  currentY += 5;
  doc.setFont("Helvetica", "normal");
  const p1Text = `Adalah benar penduduk Desa ${desa.nama_desa} dan berdomisili di alamat tersebut di atas. Surat keterangan ini dibuat secara resmi untuk memenuhi keperluan: ${keperluan}.`;
  doc.text(doc.splitTextToSize(p1Text, endX - startX), startX, currentY);

  currentY += 15;
  const p2Text = "Demikian surat keterangan ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya.";
  doc.text(doc.splitTextToSize(p2Text, endX - startX), startX, currentY);

  currentY += 15;
  const ttdX = endX - 60;
  doc.text(`${desa.nama_desa}, ${tanggal_generate}`, ttdX, currentY);
  currentY += 5;
  doc.setFont("Helvetica", "bold");
  doc.text(`Kepala Desa ${desa.nama_desa},`, ttdX, currentY);
  currentY += 22;
  doc.text(desa.nama_kepala_desa.toUpperCase(), ttdX, currentY);
  doc.line(ttdX, currentY + 0.8, ttdX + doc.getTextWidth(desa.nama_kepala_desa), currentY + 0.8);

  if (desa.nip_kepala_desa) {
    currentY += 5;
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`NIP. ${desa.nip_kepala_desa}`, ttdX, currentY);
  }

  return doc;
};
