/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateSuratDomisili } from "@/lib/pdf/templates/SuratDomisili";
import { SuratDomisiliPayload } from "@/types/surat";
import { sendEmail } from "@/lib/email/sendEmail"; // Impor fungsi sendEmail
import { createSuratStatusEmail } from "@/lib/email/templates/suratStatusEmail"; // Impor template

const toRomawi = (month: number): string => {
  const romawiArr = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return romawiArr[month - 1] || "I";
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { surat_id } = body;

    if (!surat_id) {
      return NextResponse.json({ error: "ID Permohonan Surat wajib disertakan." }, { status: 400 });
    }

    const supabase = await createClient();

    // STEP 1 & 2: Ambil Data Lengkap (Surat, Pemohon, Anggota)
    const { data: surat, error: suratError } = await supabase
      .from("surat")
      .select(`
        id, jenis_surat, keperluan, status, pemohon_id,
        profiles!pemohon_id(id, nama, email, rt, rw, nik)
      `)
      .eq("id", surat_id)
      .maybeSingle();

    if (suratError) throw new Error(`Database error: ${suratError.message}`);
    if (!surat) return NextResponse.json({ error: "Permohonan surat tidak ditemukan." }, { status: 404 });

    const pemohon = (surat as any).profiles;
    if (!pemohon || !pemohon.nik) {
      return NextResponse.json({ error: "Profil pemohon atau NIK tidak ditemukan." }, { status: 404 });
    }

    const { data: dataWargaSipil } = await supabase
      .from("anggota")
      .select("nik, nama, tgl_lahir, tempat_lahir, agama, jenis_kelamin, alamat, pekerjaan")
      .eq("nik", pemohon.nik)
      .maybeSingle();

    const warga = dataWargaSipil || ({} as any);

    // STEP 3: Generate Nomor Surat
    const { count } = await supabase
      .from("surat")
      .select("*", { count: "exact", head: true })
      .eq("status", "selesai");

    const nextUrutan = ((count || 0) + 1).toString().padStart(3, "0");
    const now = new Date();
    const nomorSuratFinal = `${nextUrutan}/KADES/${toRomawi(now.getMonth() + 1)}/${now.getFullYear()}`;

    // STEP 4 & 5: Generate PDF
    const payloadTemplate: SuratDomisiliPayload = {
      nomor_urut: nextUrutan,
      keperluan: surat.keperluan || "-",
      tanggal_generate: now.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
      warga: {
        nama: pemohon.nama || warga.nama || "-",
        nik: pemohon.nik || warga.nik || "-",
        tempat_lahir: warga.tempat_lahir || "-",
        tanggal_lahir: warga.tgl_lahir || "-",
        jenis_kelamin: warga.jenis_kelamin || "laki-laki",
        agama: warga.agama || "-",
        pekerjaan: warga.pekerjaan || "-",
        alamat: warga.alamat || "-",
        rt: pemohon.rt || "00",
        rw: pemohon.rw || "00",
      },
      desa: {
        nama_desa: "Digital Makmur",
        nama_kecamatan: "Cikarang Pusat",
        nama_kabupaten: "Bekasi",
        alamat_kantor: "Jl. Raya Utama No. 10 Kelurahan Digital",
        no_telp: "(021) 8991234",
        kode_pos: "17530",
        kode_desa: "DD-MKM",
        nama_kepala_desa: "Supriatna S.IP",
        nip_kepala_desa: "198204122010011002",
      },
    };

    const doc = generateSuratDomisili(payloadTemplate);
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // STEP 6: Upload ke Storage
    const storagePath = `surat/${surat_id}/${nomorSuratFinal.replace(/\//g, "-")}.pdf`;
    const { error: uploadError } = await supabase.storage.from("surat-output").upload(storagePath, pdfBuffer, {
      contentType: "application/pdf",
      upsert: true,
    });

    if (uploadError) throw new Error(`Upload Gagal: ${uploadError.message}`);

    const { data: signedData, error: signedUrlError } = await supabase.storage
      .from("surat-output")
      .createSignedUrl(storagePath, 3600); 

    if (signedUrlError) throw new Error(`Gagal generate link: ${signedUrlError.message}`);

    // STEP 7: Update Status
    const { error: updateError } = await supabase
      .from("surat")
      .update({
        status: "selesai",
        file_url: signedData.signedUrl,
        catatan_petugas: `Surat digenerate pada ${now.toLocaleString("id-ID")} WIB.`,
      })
      .eq("id", surat_id);

    if (updateError) throw new Error(`Update Status Gagal: ${updateError.message}`);

    // STEP 8: Kirim Notifikasi Email (Non-blocking)
    if (pemohon.email) {
      sendEmail(
        pemohon.email,
        `Surat Anda Selesai: ${surat.jenis_surat}`,
        createSuratStatusEmail({
          namaPemohon: pemohon.nama,
          jenisSurat: surat.jenis_surat,
          status: 'selesai',
          downloadUrl: signedData.signedUrl,
          namaDesaInfo: process.env.NEXT_PUBLIC_NAMA_DESA || "Desa Digital"
        })
      ).catch(err => console.error("Email notifikasi gagal:", err));
    }

    return NextResponse.json({ success: true, file_url: signedData.signedUrl, nomor_surat: nomorSuratFinal });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}