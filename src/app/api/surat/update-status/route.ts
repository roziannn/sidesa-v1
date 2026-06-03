import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/sendEmail";
import { createSuratStatusEmail } from "@/lib/email/templates/suratStatusEmail";

export async function POST(request: Request) {
  try {
    const { surat_id, new_status, catatan } = await request.json();
    const supabase = await createClient();

    // 1. Update status surat & ambil data pemohon, jenis surat, dan file_url
    const { data: surat, error } = await supabase
    .from("surat")
    .update({ 
        status: new_status, 
        catatan_petugas: catatan 
    })
    .eq("id", surat_id)
    .select(`
        *,
        profiles:pemohon_id (
        nama,
        email
        ),
        jenis_surat,
        file_url
    `) 
    .single();

    if (error || !surat) {
      return NextResponse.json({ error: "Update status gagal" }, { status: 400 });
    }

    // Validasi email pemohon
    if (!surat.profiles?.email) {
      return NextResponse.json({ error: "Email pemohon tidak ditemukan" }, { status: 400 });
    }

    // 2. Kirim Email Notifikasi
    const emailHtml = createSuratStatusEmail({
      namaPemohon: surat.profiles.nama,
      jenisSurat: surat.jenis_surat,
      status: new_status,
      catatanPetugas: catatan,
      downloadUrl: surat.file_url,
      namaDesaInfo: process.env.NEXT_PUBLIC_NAMA_DESA || "Desa Digital"
    });

    const emailResponse = await sendEmail(
      surat.profiles.email, 
      `Update Status Surat: ${surat.jenis_surat}`, 
      emailHtml
    );

    if (!emailResponse.success) {
      return NextResponse.json({ error: "Gagal mengirim email notifikasi" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
    
  } catch (err) {
    return NextResponse.json({ error: "Terjadi kesalahan internal" }, { status: 500 });
  }
}